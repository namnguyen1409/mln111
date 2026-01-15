import mongoose, { Schema, Document } from "mongoose";

export interface IPointHistory extends Document {
    userEmail: string;
    amount: number;
    reason: string;
    type: 'add' | 'deduct';
    metadata?: Record<string, any>;
    createdAt: Date;
}

const PointHistorySchema: Schema = new Schema(
    {
        userEmail: { type: String, required: true, index: true },
        amount: { type: Number, required: true },
        reason: { type: String, required: true },
        type: { type: String, enum: ['add', 'deduct'], required: true },
        metadata: { type: Schema.Types.Mixed },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Index for faster queries
PointHistorySchema.index({ userEmail: 1, createdAt: -1 });

export default mongoose.models.PointHistory || mongoose.model<IPointHistory>("PointHistory", PointHistorySchema);
