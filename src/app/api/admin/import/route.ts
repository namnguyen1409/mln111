import { NextRequest, NextResponse } from 'next/server';
import { auth, isAdmin } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Topic from '@/models/Topic';
import Quiz from '@/models/Quiz';
import FlashcardCollection from '@/models/FlashcardCollection';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const { topics, quizzes, flashcards } = data;

        if (!topics || !quizzes || !flashcards) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        await connectDB();

        const results = {
            topics: 0,
            quizzes: 0,
            flashcards: 0
        };

        // 1. Process Topics (Upsert by slug)
        for (const topic of topics) {
            const { _id, __v, createdAt, updatedAt, ...cleanTopic } = topic;
            await Topic.findOneAndUpdate(
                { slug: cleanTopic.slug },
                cleanTopic,
                { upsert: true, new: true }
            );
            results.topics++;
        }

        // 2. Process Quizzes (Upsert by title + topicSlug)
        for (const quiz of quizzes) {
            const { _id, __v, ...cleanQuiz } = quiz;
            await Quiz.findOneAndUpdate(
                { title: cleanQuiz.title, topicSlug: cleanQuiz.topicSlug },
                cleanQuiz,
                { upsert: true, new: true }
            );
            results.quizzes++;
        }

        // 3. Process Flashcards (Upsert by slug)
        for (const collection of flashcards) {
            const { _id, __v, createdAt, updatedAt, ...cleanCollection } = collection;
            await FlashcardCollection.findOneAndUpdate(
                { slug: cleanCollection.slug },
                cleanCollection,
                { upsert: true, new: true }
            );
            results.flashcards++;
        }

        return NextResponse.json({
            message: 'Import successful',
            results
        });

    } catch (error) {
        console.error('[IMPORT_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
