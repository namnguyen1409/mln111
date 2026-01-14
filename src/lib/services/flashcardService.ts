import connectDB from "@/lib/db/mongodb";
import FlashcardCollection from "@/models/FlashcardCollection";

export async function getFlashcardCollections() {
    await connectDB();
    const collections = await FlashcardCollection.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(collections));
}

export async function getFlashcardCollectionBySlug(slug: string) {
    await connectDB();
    const collection = await FlashcardCollection.findOne({ slug }).lean();
    return collection ? JSON.parse(JSON.stringify(collection)) : null;
}

export async function deleteFlashcardCollection(id: string) {
    await connectDB();
    return FlashcardCollection.findByIdAndDelete(id);
}

export async function getFlashcardCollectionById(id: string) {
    await connectDB();
    return FlashcardCollection.findById(id).lean();
}

export async function updateFlashcardCollection(id: string, data: any) {
    await connectDB();
    return FlashcardCollection.findByIdAndUpdate(id, data, { new: true }).lean();
}
