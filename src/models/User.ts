import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    image?: string;
    points: number;
    level: number;
    streak: number;
    lastLoginDate?: Date;
    totalLogins: number;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        image: { type: String },
        points: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        streak: { type: Number, default: 0 },
        lastLoginDate: { type: Date },
        totalLogins: { type: Number, default: 0 },
        isAdmin: { type: Boolean, default: false },
        achievements: [
            {
                achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement' },
                earnedAt: { type: Date, default: Date.now }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Indexing for leaderboard performance
UserSchema.index({ points: -1 });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
