import mongoose, { Schema, Document } from "mongoose";

export interface IFlashcard {
    front: string;
    back: string;
}

export interface IFlashcardCollection extends Document {
    title: string;
    description: string;
    slug: string;
    topicSlug?: string;
    category: string;
    cards: IFlashcard[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const FlashcardSchema = new Schema({
    front: { type: String, required: true },
    back: { type: String, required: true },
});

const FlashcardCollectionSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        slug: { type: String, required: true, unique: true },
        topicSlug: { type: String },
        category: { type: String, default: "general" },
        cards: [FlashcardSchema],
        createdBy: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.FlashcardCollection ||
    mongoose.model<IFlashcardCollection>("FlashcardCollection", FlashcardCollectionSchema);
