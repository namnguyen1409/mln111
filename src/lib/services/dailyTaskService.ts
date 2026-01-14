import connectDB from "@/lib/db/mongodb";
import DailyTask, { IDailyTask } from "@/models/DailyTask";
import UserTaskProgress from "@/models/UserTaskProgress";
import { addPoints } from "./userService";
import mongoose from "mongoose";

export async function getActiveDailyTasks() {
    await connectDB();
    const tasks = await DailyTask.find({ isActive: true }).lean();
    return JSON.parse(JSON.stringify(tasks));
}

export async function getUserDailyTaskProgress(email: string) {
    await connectDB();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all active tasks
    const activeTasks = await getActiveDailyTasks();

    // Get user progress for today
    const progressDocs = await UserTaskProgress.find({
        userEmail: email,
        dateKey: today
    }).lean();

    // Map progress to tasks
    const tasksWithProgress = activeTasks.map((task: any) => {
        const progressDoc = progressDocs.find(p => p.taskId.toString() === task._id.toString());
        return {
            ...task,
            currentProgress: progressDoc ? progressDoc.progress : 0,
            isCompleted: progressDoc ? progressDoc.isCompleted : false
        };
    });

    return tasksWithProgress;
}

export async function updateDailyTaskProgress(email: string, type: 'read_article' | 'comment' | 'quiz_complete', increment: number = 1) {
    await connectDB();
    const today = new Date().toISOString().split('T')[0];

    // Find active tasks of this type
    const tasks = await DailyTask.find({ type, isActive: true });
    if (tasks.length === 0) return;

    for (const task of tasks) {
        // Find or create progress for today
        let progressDoc = await UserTaskProgress.findOne({
            userEmail: email,
            taskId: task._id,
            dateKey: today
        });

        if (!progressDoc) {
            progressDoc = new UserTaskProgress({
                userEmail: email,
                taskId: task._id,
                dateKey: today,
                progress: 0,
                isCompleted: false
            });
        }

        if (progressDoc.isCompleted) continue; // Already done

        progressDoc.progress += increment;

        // Check if completed
        if (progressDoc.progress >= task.requirement) {
            progressDoc.progress = task.requirement; // Cap it
            progressDoc.isCompleted = true;
            progressDoc.completedAt = new Date();

            // Award EXP
            await addPoints(email, task.expReward);
        }

        await progressDoc.save();
    }
}

// Admin functions
export async function createDailyTask(data: Partial<IDailyTask>) {
    await connectDB();
    const task = await DailyTask.create(data);
    return JSON.parse(JSON.stringify(task));
}

export async function updateDailyTask(id: string, data: Partial<IDailyTask>) {
    await connectDB();
    const task = await DailyTask.findByIdAndUpdate(id, data, { new: true }).lean();
    return JSON.parse(JSON.stringify(task));
}

export async function deleteDailyTask(id: string) {
    await connectDB();
    await DailyTask.findByIdAndDelete(id);
    return { success: true };
}
