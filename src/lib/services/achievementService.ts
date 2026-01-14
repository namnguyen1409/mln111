import connectDB from "@/lib/db/mongodb";
import Achievement, { IAchievement } from "@/models/Achievement";
import User from "@/models/User";

/**
 * Checks if a user is eligible for any achievements of a specific type 
 * and awards them if not already earned.
 */
export async function checkAndAwardAchievements(email: string, type: string, currentVal: number) {
    await connectDB();

    // Find achievements of this type that the user meets the requirement for
    const eligibleAchievements = await Achievement.find({
        type,
        requirement: { $lte: currentVal }
    }).lean();

    if (eligibleAchievements.length === 0) return;

    const user = await User.findOne({ email });
    if (!user) return;

    const currentAchievementIds = user.achievements.map((a: any) => a.achievementId.toString());
    let newlyEarnedCount = 0;

    for (const achievement of eligibleAchievements) {
        if (!currentAchievementIds.includes(achievement._id.toString())) {
            user.achievements.push({
                achievementId: achievement._id,
                earnedAt: new Date()
            });
            newlyEarnedCount++;
        }
    }

    if (newlyEarnedCount > 0) {
        await user.save();
    }

    return newlyEarnedCount;
}

export async function getUserEarnedAchievements(email: string) {
    await connectDB();
    const user = await User.findOne({ email }).populate('achievements.achievementId').lean();
    if (!user) return [];

    return JSON.parse(JSON.stringify(user.achievements));
}

export async function getAllAchievementsWithStatus(email: string) {
    await connectDB();
    const allAchievements = await Achievement.find({}).sort({ requirement: 1 }).lean();
    const user = await User.findOne({ email }).lean();

    const earnedIds = user?.achievements?.map((a: any) => a.achievementId.toString()) || [];

    return allAchievements.map((achievement: any) => ({
        ...achievement,
        isEarned: earnedIds.includes(achievement._id.toString()),
        earnedAt: user?.achievements?.find((a: any) => a.achievementId.toString() === achievement._id.toString())?.earnedAt
    }));
}

// Admin CRUD
export async function createAchievement(data: Partial<IAchievement>) {
    await connectDB();
    const achievement = await Achievement.create(data);
    return JSON.parse(JSON.stringify(achievement));
}

export async function updateAchievement(id: string, data: Partial<IAchievement>) {
    await connectDB();
    const achievement = await Achievement.findByIdAndUpdate(id, data, { new: true }).lean();
    return JSON.parse(JSON.stringify(achievement));
}

export async function deleteAchievement(id: string) {
    await connectDB();
    await Achievement.findByIdAndDelete(id);
    return { success: true };
}
