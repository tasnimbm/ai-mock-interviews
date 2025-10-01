"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";



export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try {
        // Only include candidate/user messages
        const candidateLines = transcript
            .filter((s: { role: string }) => s.role === "user" || s.role === "candidate")
            .map((s) => `- ${s.content}\n`)
            .join("");

        let feedback: Feedback;

        // Handle empty candidate transcript
        if (!candidateLines.trim()) {
            feedback = {
                interviewId,
                userId,
                totalScore: 0,
                categoryScores: [
                    { name: "Communication Skills", score: 0, comment: "" },
                    { name: "Technical Knowledge", score: 0, comment: "" },
                    { name: "Problem Solving", score: 0, comment: "" },
                    { name: "Cultural & Role Fit", score: 0, comment: "" },
                    { name: "Confidence & Clarity", score: 0, comment: "" },
                ],
                strengths: [],
                areasForImprovement: [],
                finalAssessment:
                    "No feedback could be generated. The candidate did not provide any responses during the interview.",
                createdAt: new Date().toISOString(),
            };
        } else {
            // Call Gemini only if candidate spoke
            const { object } = await generateObject({
                model: google("gemini-2.0-flash-001"),
                schema: feedbackSchema,
                prompt: `
You are an experienced technical interviewer. 
Evaluate the candidate's performance strictly and fairly.

Transcript:
${candidateLines}

Instructions for scoring:
- Give each category a score between 0 and 100. 
- Justify the score with a short but specific comment (1–3 sentences).
- Use concrete examples from the transcript if possible.
- Categories:
1. Communication Skills — clarity, articulation, logical structure.
2. Technical Knowledge — accuracy, depth, and relevance of answers.
3. Problem Solving — reasoning, creativity, handling challenges.
4. Cultural & Role Fit — alignment with company/team values, collaboration, motivation.
5. Confidence & Clarity — confidence, tone, and decisiveness.

Additional:
- Provide at least 2 bullet points for strengths and areas for improvement.
- FinalAssessment: a short paragraph (3–4 sentences) giving your overall impression.
`,
                system: `
You are a professional interviewer analyzing a mock interview. 
Provide structured and realistic feedback, not vague or overly positive.
`,
            });

            feedback = {
                interviewId,
                userId,
                totalScore: object.totalScore,
                categoryScores: object.categoryScores,
                strengths: object.strengths,
                areasForImprovement: object.areasForImprovement,
                finalAssessment: object.finalAssessment,
                createdAt: new Date().toISOString(),
            };
        }

        // Save feedback to Firestore
        const feedbackRef = feedbackId
            ? db.collection("feedback").doc(feedbackId)
            : db.collection("feedback").doc();

        await feedbackRef.set(feedback);

        return { success: true, feedbackId: feedbackRef.id };
    } catch (error) {
        console.error("Error saving feedback:", error);
        return { success: false };
    }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    const interview = await db.collection("interviews").doc(id).get();

    return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    const querySnapshot = await db
        .collection("feedback")
        .where("interviewId", "==", interviewId)
        .where("userId", "==", userId)
        .limit(1)
        .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
    params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db
        .collection("interviews")
        .orderBy("createdAt", "desc")
        .where("finalized", "==", true)
        .where("userId", "!=", userId)
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];
}

export async function getInterviewsByUserId(
    userId: string
): Promise<Interview[] | null> {
    const interviews = await db
        .collection("interviews")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];
}