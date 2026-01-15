import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { updateDailyStreak } from "@/lib/services/userService";
import User from "@/models/User";
import connectDB from "@/lib/db/mongodb";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (user.email) {
                await connectDB();
                // Find or create user manually (instead of adapter for more control/lean approach)
                let dbUser = await User.findOne({ email: user.email });
                if (!dbUser) {
                    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        isAdmin: adminEmails.includes(user.email)
                    });
                }
                // Update streak/points
                await updateDailyStreak(user.email);
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user && token.email) {
                await connectDB();
                let dbUser = await User.findOne({ email: token.email }).lean();

                if (dbUser) {
                    // Check-in logic: if last login was not today, update streak
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const lastLogin = dbUser.lastLoginDate ? new Date(dbUser.lastLoginDate) : null;
                    if (lastLogin) lastLogin.setHours(0, 0, 0, 0);

                    if (!lastLogin || today.getTime() !== lastLogin.getTime()) {
                        const updatedUser = await updateDailyStreak(token.email as string);
                        if (updatedUser) {
                            dbUser = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
                        }
                    }

                    (session.user as any).id = dbUser._id;
                    (session.user as any).isAdmin = dbUser.isAdmin;
                    (session.user as any).points = dbUser.points;
                    (session.user as any).level = dbUser.level;
                    (session.user as any).streak = dbUser.streak;
                }
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.email = user.email;
            }
            // Optional: Support session updates if needed
            return token;
        },
    },
});

export const isAdmin = (email?: string | null) => {
    if (!email) return false;
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    return adminEmails.includes(email);
};
