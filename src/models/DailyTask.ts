import mongoose, { Schema, Document } from "mongoose";

export interface IDailyTask extends Document {
    title: string;
    description?: string;
    type: 'read_article' | 'comment' | 'quiz_complete';
    requirement: number; // seconds for reading, count for others
    expReward: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DailyTaskSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        type: {
            type: String,
            enum: ['read_article', 'comment', 'quiz_complete'],
            required: true
        },
        requirement: { type: Number, required: true },
        expReward: { type: Number, required: true },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.DailyTask || mongoose.model<IDailyTask>("DailyTask", DailyTaskSchema);
