import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

export async function getUserByEmail(email: string) {
    await connectDB();
    return User.findOne({ email }).lean();
}

export async function getAllUsers() {
    await connectDB();
    return User.find({}).sort({ points: -1 }).lean();
}

export async function getLeaderboard(limit: number = 50) {
    await connectDB();
    const users = await User.find({})
        .sort({ points: -1 })
        .limit(limit)
        .lean();
    return users;
}

export async function getUserRank(email: string) {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return null;

    const rank = await User.countDocuments({
        points: { $gt: user.points }
    }) + 1;

    return {
        rank,
        points: user.points,
        nextRankPoints: 0 // Could implement more complex logic here if needed
    };
}

export async function updateDailyStreak(email: string) {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    if (lastLogin) {
        lastLogin.setHours(0, 0, 0, 0);
    }

    const diffTime = lastLogin ? today.getTime() - lastLogin.getTime() : null;
    const diffDays = diffTime ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;

    let pointsToAdd = 0;

    if (!lastLogin) {
        // First login
        user.streak = 1;
        pointsToAdd = 50; // Initial welcome points
    } else if (diffDays === 1) {
        // Sequential day
        user.streak += 1;
        pointsToAdd = 10 * user.streak; // Progressive reward
        if (pointsToAdd > 50) pointsToAdd = 50; // Cap at 50 points
    } else if (diffDays && diffDays > 1) {
        // Streak broken
        user.streak = 1;
        pointsToAdd = 10;
    } else if (diffDays === 0) {
        // Already logged in today
        return user;
    }

    user.points += pointsToAdd;
    user.lastLoginDate = new Date();
    user.totalLogins += 1;

    // Auto-update level based on points (simple logic: 1 level per 1000 points)
    user.level = Math.floor(user.points / 1000) + 1;

    await user.save();
    return user;
}

export async function addPoints(email: string, points: number) {
    await connectDB();
    const user = await User.findOneAndUpdate(
        { email },
        { $inc: { points } },
        { new: true }
    );
    if (user) {
        user.level = Math.floor(user.points / 1000) + 1;
        await user.save();
    }
    return user;
}

export async function toggleAdmin(email: string) {
    await connectDB();
    const user = await User.findOne({ email });
    if (user) {
        user.isAdmin = !user.isAdmin;
        await user.save();
    }
    return user;
}
