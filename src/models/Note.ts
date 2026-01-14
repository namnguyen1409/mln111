import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
    userEmail: string;
    topicId?: mongoose.Types.ObjectId;
    topicSlug?: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
    {
        userEmail: { type: String, required: true, index: true },
        topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
        topicSlug: { type: String }, // For easier lookup and linking
        title: { type: String, required: true },
        content: { type: String, required: true },
        tags: [{ type: String }],
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
