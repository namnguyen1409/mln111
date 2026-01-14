import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
    title: string;
    topicSlug: string;
    questions: {
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
    }[];
    xpReward: number;
}

const QuizSchema: Schema = new Schema({
    title: { type: String, required: true },
    topicSlug: { type: String, required: true },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true },
        explanation: { type: String, required: true }
    }],
    xpReward: { type: Number, default: 100 }
});

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
