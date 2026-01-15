import mongoose, { Schema, Document } from "mongoose";
import "./Topic"; // Ensure Topic model is registered
import "./Quiz";  // Ensure Quiz model is registered

export interface IBattleParticipant {
    email: string;
    name: string;
    image?: string;
    score: number;
    lastAnswerCorrect?: boolean;
    finished: boolean;
}

export interface IBattleSession extends Document {
    code: string;
    hostEmail: string;
    topicId?: mongoose.Types.ObjectId;
    quizId?: mongoose.Types.ObjectId;
    topicSlug: string;
    status: 'waiting' | 'in_progress' | 'finished';
    currentQuestionIndex: number;
    questionStartTime?: Date;
    timerDuration: number;
    type: 'classic' | 'bet';
    betAmount: number;
    totalPool: number;
    participants: IBattleParticipant[];
    createdAt: Date;
    updatedAt: Date;
}

const BattleSessionSchema: Schema = new Schema(
    {
        code: { type: String, required: true, unique: true, index: true },
        hostEmail: { type: String, required: true },
        topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
        quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
        topicSlug: { type: String, required: true },
        status: {
            type: String,
            enum: ['waiting', 'in_progress', 'finished'],
            default: 'waiting'
        },
        currentQuestionIndex: { type: Number, default: 0 },
        questionStartTime: { type: Date },
        timerDuration: { type: Number, default: 30 }, // Default 30 seconds per question
        type: { type: String, enum: ['classic', 'bet'], default: 'classic' },
        betAmount: { type: Number, default: 0 },
        totalPool: { type: Number, default: 0 },
        participants: [{
            email: { type: String, required: true },
            name: { type: String, required: true },
            image: { type: String },
            score: { type: Number, default: 0 },
            lastAnswerCorrect: { type: Boolean },
            finished: { type: Boolean, default: false }
        }]
    },
    {
        timestamps: true
    }
);

// Auto-expire sessions after 2 hours to keep DB clean
BattleSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

export default mongoose.models.BattleSession || mongoose.model<IBattleSession>("BattleSession", BattleSessionSchema);
