import connectDB from "@/lib/db/mongodb";
import Quiz from "@/models/Quiz";

export async function getQuizzes() {
    await connectDB();
    return Quiz.find({}).lean();
}

export async function getQuizById(id: string) {
    await connectDB();
    return Quiz.findById(id).lean();
}

export async function getQuizByTopic(topicSlug: string) {
    await connectDB();
    return Quiz.findOne({ topicSlug }).lean();
}

export async function createQuiz(data: any) {
    await connectDB();
    return Quiz.create(data);
}

export async function deleteQuiz(id: string) {
    await connectDB();
    return Quiz.findByIdAndDelete(id);
}

export async function updateQuiz(id: string, data: any) {
    await connectDB();
    return Quiz.findByIdAndUpdate(id, data, { new: true }).lean();
}
