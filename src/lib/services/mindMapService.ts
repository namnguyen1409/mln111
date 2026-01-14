import connectDB from "@/lib/db/mongodb";
import MindMap from "@/models/MindMap";

export async function getMindMaps() {
    await connectDB();
    return MindMap.find({}).sort({ updatedAt: -1 }).lean();
}

export async function getMindMapBySlug(slug: string) {
    await connectDB();
    return MindMap.findOne({ slug }).lean();
}

export async function createMindMap(data: any) {
    await connectDB();
    return MindMap.create(data);
}

export async function updateMindMap(id: string, data: any) {
    await connectDB();
    return MindMap.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function getMindMapById(id: string) {
    await connectDB();
    return MindMap.findById(id).lean();
}

export async function deleteMindMap(id: string) {
    await connectDB();
    return MindMap.findByIdAndDelete(id);
}
