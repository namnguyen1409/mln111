import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import PointHistory from "@/models/PointHistory";

export async function getUserByEmail(email: string) {
    await connectDB();
    return User.findOne({ email }).lean();
}

export async function getAllUsers() {
    await connectDB();
    return User.find({}).sort({ points: -1 }).lean();
}

export async function getLeaderboard(limit: number = 50, mode: 'total' | 'weekly' = 'total') {
    await connectDB();
    const sortBy = mode === 'weekly' ? { weeklyPoints: -1 } : { points: -1 };
    const users = await User.find({})
        .sort(sortBy as any)
        .limit(limit)
        .lean();
    return users;
}

export async function getUserRank(email: string, mode: 'total' | 'weekly' = 'total') {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return null;

    const points = mode === 'weekly' ? user.weeklyPoints : user.points;
    const field = mode === 'weekly' ? 'weeklyPoints' : 'points';

    const rank = await User.countDocuments({
        [field]: { $gt: points }
    }) + 1;

    return {
        rank,
        points,
        nextRankPoints: 0
    };
}

export function getCurrentWeekKey() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
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

    // Check if user already logged in today
    if (lastLogin && today.getTime() === lastLogin.getTime()) {
        return user;
    }

    const diffTime = lastLogin ? today.getTime() - lastLogin.getTime() : null;
    const diffDays = diffTime ? Math.round(diffTime / (1000 * 60 * 60 * 24)) : null;

    let pointsToAdd = 0;

    if (!lastLogin) {
        // First login
        user.streak = 1;
        pointsToAdd = 50; // Initial welcome points
    } else if (diffDays === 1) {
        // Sequential day
        user.streak += 1;
        pointsToAdd = Math.min(10 * user.streak, 50); // Progressive reward capped at 50
    } else {
        // Streak broken or same day (diffDays === 0 check handled above, so this is diffDays > 1)
        user.streak = 1;
        pointsToAdd = 10;
    }

    user.points += pointsToAdd;
    user.lastLoginDate = new Date();
    user.totalLogins += 1;

    // Auto-update level based on points (simple logic: 1 level per 1000 points)
    user.level = Math.floor(user.points / 1000) + 1;

    await user.save();

    // Log Point History
    if (pointsToAdd > 0) {
        await PointHistory.create({
            userEmail: email,
            amount: pointsToAdd,
            reason: user.streak > 1 ? `Điểm danh ngày ${user.streak}` : "Điểm danh hàng ngày",
            type: 'add',
            metadata: { streak: user.streak }
        });
    }

    // Check for achievements
    const { checkAndAwardAchievements } = await import("./achievementService");
    await checkAndAwardAchievements(email, 'streak', user.streak);
    await checkAndAwardAchievements(email, 'points', user.points);
    await checkAndAwardAchievements(email, 'level', user.level);

    return user;
}

/**
 * Cấp điểm EXP cho người dùng
 */
export async function addPoints(email: string, amount: number, reason: string = "Hoàn thành bài học", metadata?: any) {
    await connectDB();
    const user = await User.findOne({ email });

    if (user) {
        // Weekly Reset Logic
        const currentWeekKey = getCurrentWeekKey();

        if (user.lastResetWeek !== currentWeekKey) {
            user.weeklyPoints = amount;
            user.lastResetWeek = currentWeekKey;
        } else {
            user.weeklyPoints += amount;
        }

        user.points += amount;
        user.level = Math.floor(user.points / 1000) + 1;
        await user.save();

        // Log Point History
        await PointHistory.create({
            userEmail: email,
            amount: amount,
            reason: reason,
            type: 'add',
            metadata: metadata
        });

        // Check for achievements
        const { checkAndAwardAchievements } = await import("./achievementService");
        await checkAndAwardAchievements(email, 'points', user.points);
        await checkAndAwardAchievements(email, 'level', user.level);
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

/**
 * Khấu trừ điểm EXP (dùng cho đặt cược)
 */
export async function deductPoints(email: string, amount: number, reason: string = "Đặt cược trận đấu", metadata?: any) {
    await connectDB();
    const user = await User.findOne({ email });

    if (user) {
        if (user.points < amount) throw new Error("Không đủ điểm để thực hiện");

        user.points -= amount;
        user.level = Math.floor(user.points / 1000) + 1;
        await user.save();

        // Log Point History
        await PointHistory.create({
            userEmail: email,
            amount: amount,
            reason: reason,
            type: 'deduct',
            metadata: metadata
        });
    }
    return user;
}
