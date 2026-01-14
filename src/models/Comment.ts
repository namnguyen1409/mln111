import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    topicSlug: string;
    user: {
        name: string;
        email: string;
        image?: string;
    };
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
    {
        topicSlug: {
            type: String,
            required: true,
            index: true
        },
        user: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            image: { type: String }
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
