import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import BattleSession from "@/models/BattleSession";
import Topic from "@/models/Topic";
import Quiz from "@/models/Quiz";
import { addPoints, deductPoints } from "./userService";

export async function createBattleSession(hostEmail: string, topicId?: string, topicSlug: string = 'general', quizId?: string, timerDuration: number = 30, type: 'classic' | 'bet' = 'classic', betAmount: number = 0) {
    await connectDB();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const session = new BattleSession({
        code,
        hostEmail,
        topicId,
        quizId,
        topicSlug,
        timerDuration,
        type,
        betAmount,
        totalPool: 0,
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
        // Handle betting deduction
        if (session.type === 'bet' && session.betAmount > 0) {
            await deductPoints(user.email, session.betAmount);
            session.totalPool += session.betAmount;
        }

        session.participants.push({ ...user, score: 0, finished: false });
        await session.save();
    }
    return session;
}

export async function getBattleStatus(code: string) {
    await connectDB();

    // Aggressive model registration check
    if (!mongoose.models.Topic) {
        await import("@/models/Topic");
    }
    if (!mongoose.models.Quiz) {
        await import("@/models/Quiz");
    }

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

    if (session.type === 'bet' && session.totalPool > 0) {
        // Identify individual winner(s)
        const maxScore = Math.max(...session.participants.map((p: any) => p.score));
        const winners = session.participants.filter((p: any) => p.score === maxScore && maxScore > 0);

        if (winners.length > 0) {
            const rewardPerWinner = Math.floor(session.totalPool / winners.length);
            const rewardPromises = winners.map((w: any) => addPoints(w.email, rewardPerWinner));
            await Promise.allSettled(rewardPromises);
        }
    } else {
        // Classic mode: Distribution is based on earned scores
        const rewardPromises = session.participants.map((p: any) =>
            addPoints(p.email, p.score)
        );
        await Promise.allSettled(rewardPromises);
    }

    return session;
}
