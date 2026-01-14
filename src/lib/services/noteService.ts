import connectDB from "@/lib/db/mongodb";
import Note from "@/models/Note";

export async function getUserNotes(userEmail: string) {
    await connectDB();
    return Note.find({ userEmail }).sort({ updatedAt: -1 }).lean();
}

export async function getNoteById(id: string, userEmail: string) {
    await connectDB();
    return Note.findOne({ _id: id, userEmail }).lean();
}

export async function createNote(data: {
    userEmail: string;
    topicId?: string;
    topicSlug?: string;
    title: string;
    content: string;
    tags?: string[];
}) {
    await connectDB();
    const note = new Note(data);
    await note.save();
    return note;
}

export async function updateNote(id: string, userEmail: string, data: any) {
    await connectDB();
    return Note.findOneAndUpdate(
        { _id: id, userEmail },
        { ...data },
        { new: true }
    );
}

export async function deleteNote(id: string, userEmail: string) {
    await connectDB();
    return Note.findOneAndDelete({ _id: id, userEmail });
}

export async function getNoteByTopic(userEmail: string, topicSlug: string) {
    await connectDB();
    return Note.findOne({ userEmail, topicSlug }).lean();
}
