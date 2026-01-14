import connectDB from "@/lib/db/mongodb";
import Comment from "@/models/Comment";

export async function getCommentsByTopic(slug: string) {
    await connectDB();
    return Comment.find({ topicSlug: slug }).sort({ createdAt: -1 }).lean();
}

export async function createComment(data: {
    topicSlug: string;
    user: { name: string; email: string; image?: string };
    content: string;
}) {
    await connectDB();
    return Comment.create(data);
}

export async function deleteComment(id: string, userEmail: string, isAdmin: boolean) {
    await connectDB();
    const comment = await Comment.findById(id);
    if (!comment) return null;

    // Only allow author or admin to delete
    if (comment.user.email !== userEmail && !isAdmin) {
        throw new Error("Unauthorized");
    }

    return Comment.findByIdAndDelete(id);
}

export async function getAllCommentsForAdmin() {
    await connectDB();
    return Comment.find({}).sort({ createdAt: -1 }).limit(100).lean();
}
