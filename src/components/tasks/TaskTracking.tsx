"use client";

import { useEffect, useRef } from 'react';

/**
 * TaskTracking Component
 * Tracks active reading time on the page and reports to the API.
 * Reports every 10 seconds of active time.
 */
export default function TaskTracking() {
    const activeTimeRef = useRef(0);
    const lastReportedTimeRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Start tracking
        intervalRef.current = setInterval(() => {
            // Only track if tab is active/visible
            if (document.visibilityState === 'visible') {
                activeTimeRef.current += 1;

                // Report every 10 seconds
                if (activeTimeRef.current - lastReportedTimeRef.current >= 10) {
                    reportProgress(10);
                    lastReportedTimeRef.current = activeTimeRef.current;
                }
            }
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Final report on unmount if there's enough time un-reported
            const remaining = activeTimeRef.current - lastReportedTimeRef.current;
            if (remaining >= 5) {
                reportProgress(remaining);
            }
        };
    }, []);

    const reportProgress = async (seconds: number) => {
        try {
            await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'read_article',
                    increment: seconds
                })
            });
        } catch (error) {
            console.error("Failed to report task progress", error);
        }
    };

    return null; // Invisible component
}
