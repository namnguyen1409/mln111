import connectDB from "@/lib/db/mongodb";
import Topic from "@/models/Topic";

export async function getTopics() {
    await connectDB();
    const topics = await Topic.find({}).sort({ updatedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(topics));
}

export async function getTopicBySlug(slug: string) {
    await connectDB();
    const topic = await Topic.findOne({ slug }).lean();
    return topic ? JSON.parse(JSON.stringify(topic)) : null;
}

export async function getTopicById(id: string) {
    await connectDB();
    const topic = await Topic.findById(id).lean();
    return topic ? JSON.parse(JSON.stringify(topic)) : null;
}

export async function updateTopic(id: string, data: any) {
    await connectDB();
    const updated = await Topic.findByIdAndUpdate(id, data, { new: true }).lean();
    return JSON.parse(JSON.stringify(updated));
}

export async function deleteTopic(id: string) {
    await connectDB();
    return Topic.findByIdAndDelete(id);
}
