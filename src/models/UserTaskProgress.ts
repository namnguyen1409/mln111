import mongoose, { Schema, Document } from "mongoose";

export interface IUserTaskProgress extends Document {
    userEmail: string;
    taskId: mongoose.Types.ObjectId;
    progress: number;
    isCompleted: boolean;
    completedAt?: Date;
    dateKey: string; // YYYY-MM-DD for daily reset logic
    createdAt: Date;
    updatedAt: Date;
}

const UserTaskProgressSchema: Schema = new Schema(
    {
        userEmail: { type: String, required: true, index: true },
        taskId: { type: Schema.Types.ObjectId, ref: 'DailyTask', required: true },
        progress: { type: Number, default: 0 },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date },
        dateKey: { type: String, required: true, index: true }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient daily lookup
UserTaskProgressSchema.index({ userEmail: 1, taskId: 1, dateKey: 1 }, { unique: true });

export default mongoose.models.UserTaskProgress || mongoose.model<IUserTaskProgress>("UserTaskProgress", UserTaskProgressSchema);
