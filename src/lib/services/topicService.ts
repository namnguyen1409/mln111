import connectDB from "@/lib/db/mongodb";
import Topic from "@/models/Topic";

export async function getTopics() {
    await connectDB();
    return Topic.find({}).sort({ updatedAt: -1 }).lean();
}

export async function getTopicBySlug(slug: string) {
    await connectDB();
    return Topic.findOne({ slug }).lean();
}
