import { NextResponse } from 'next/server';
import { auth, isAdmin } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Topic from '@/models/Topic';
import Quiz from '@/models/Quiz';
import FlashcardCollection from '@/models/FlashcardCollection';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const [topics, quizzes, flashcards] = await Promise.all([
            Topic.find({}).lean(),
            Quiz.find({}).lean(),
            FlashcardCollection.find({}).lean(),
        ]);

        const exportData = {
            topics,
            quizzes,
            flashcards,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="mln111-export-${new Date().toISOString().split('T')[0]}.json"`
            },
        });

    } catch (error) {
        console.error('[EXPORT_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
