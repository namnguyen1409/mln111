import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
    name: string;
    description: string;
    icon: string; // Lucide icon name or emoji
    type: 'points' | 'level' | 'streak' | 'quizzes_completed' | 'comments_posted';
    requirement: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    createdAt: Date;
    updatedAt: Date;
}

const AchievementSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true },
        type: {
            type: String,
            enum: ['points', 'level', 'streak', 'quizzes_completed', 'comments_posted'],
            required: true
        },
        requirement: { type: Number, required: true },
        rarity: {
            type: String,
            enum: ['common', 'rare', 'epic', 'legendary'],
            default: 'common'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Achievement || mongoose.model<IAchievement>("Achievement", AchievementSchema);
