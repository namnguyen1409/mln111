import connectDB from "@/lib/db/mongodb";
import BattleSession from "@/models/BattleSession";
import { addPoints } from "./userService";

export async function createBattleSession(hostEmail: string, topicId?: string, topicSlug: string = 'general', quizId?: string, timerDuration: number = 30) {
    await connectDB();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const session = new BattleSession({
        code,
        hostEmail,
        topicId,
        quizId,
        topicSlug,
        timerDuration,
        status: 'waiting',
        participants: []
    });
    await session.save();
    return session;
}

export async function joinBattleSession(code: string, user: { email: string; name: string; image?: string }) {
    await connectDB();
    const session = await BattleSession.findOne({ code, status: 'waiting' });
    if (!session) throw new Error("Phòng không tồn tại hoặc đã bắt đầu");

    const existing = session.participants.find((p: any) => p.email === user.email);
    if (!existing) {
        session.participants.push({ ...user, score: 0, finished: false });
        await session.save();
    }
    return session;
}

export async function getBattleStatus(code: string) {
    await connectDB();
    const session = await BattleSession.findOne({ code })
        .populate('topicId')
        .populate('quizId')
        .lean();

    if (session && session.quizId && !session.topicId) {
        // Normalize Quiz questions to match Topic quizContent structure
        const quiz = session.quizId as any;
        (session as any).normalizedQuestions = quiz.questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.options[q.correctAnswer], // Convert index to value
            points: 100 // Default points for quiz questions
        }));
    } else if (session && session.topicId) {
        (session as any).normalizedQuestions = (session.topicId as any).quizContent;
    }

    return session;
}

export async function updateBattleStep(code: string, hostEmail: string, update: any) {
    await connectDB();

    // If moving to in_progress or next question, set start time
    if (update.status === 'in_progress' || update.currentQuestionIndex !== undefined) {
        update.questionStartTime = new Date();
    }

    // Special case: round reset for next question
    if (update.currentQuestionIndex !== undefined) {
        return BattleSession.findOneAndUpdate(
            { code, hostEmail },
            {
                $set: update,
                $unset: { "participants.$[].lastAnswerCorrect": "" } // Reset answer status for everyone
            },
            { new: true }
        );
    }

    return BattleSession.findOneAndUpdate(
        { code, hostEmail },
        { $set: update },
        { new: true }
    );
}

export async function submitBattleAnswer(code: string, userEmail: string, isCorrect: boolean, points: number) {
    await connectDB();
    // Optimized update using positional operator to target specific participant
    return BattleSession.findOneAndUpdate(
        { code, "participants.email": userEmail },
        {
            $inc: { "participants.$.score": isCorrect ? points : 0 },
            $set: { "participants.$.lastAnswerCorrect": isCorrect }
        },
        { new: true }
    );
}

export async function finishBattle(code: string, hostEmail: string) {
    await connectDB();
    const session = await BattleSession.findOne({ code, hostEmail });
    if (!session) throw new Error("Unauthorized or session not found");

    session.status = 'finished';
    await session.save();

    // Batch distribute EXP at the end
    const rewardPromises = session.participants.map((p: any) =>
        addPoints(p.email, p.score)
    );
    await Promise.allSettled(rewardPromises);

    return session;
}
