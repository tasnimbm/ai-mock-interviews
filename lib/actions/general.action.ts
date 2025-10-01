"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try {
        const formattedTranscript = transcript
            .map(
                (sentence: { role: string; content: string }) =>
                    `- ${sentence.role}: ${sentence.content}\n`
            )
            .join("");

        const { object } = await generateObject({
            model: google("gemini-2.0-flash-001"),
            schema: feedbackSchema,
            prompt: `
You are an experienced technical interviewer. 
Your job is to evaluate the candidate's performance in a structured and detailed way.

Use the transcript below to analyze the candidate's answers. 
Be STRICT but fair. Highlight both strengths and weaknesses clearly.

Transcript:
${formattedTranscript}

Instructions for scoring:
- Give each category a score between 0 and 100. 
- Justify the score with a short but specific comment (1–3 sentences).
- Scores should NOT all be high. If the candidate struggles, reflect that in the score.
- Always mention concrete examples from the transcript if possible.

Categories:
1. Communication Skills — clarity, articulation, logical structure.
2. Technical Knowledge — accuracy, depth, and relevance of answers.
3. Problem Solving — reasoning, creativity, handling of challenges.
4. Cultural & Role Fit — alignment with company/team values, collaboration, motivation.
5. Confidence & Clarity — confidence, tone, and decisiveness.

Additional requirements:
- "strengths": Provide at least 2 bullet points with positive aspects.
- "areasForImprovement": Provide at least 2 bullet points with weaknesses or things to improve.
- "finalAssessment": A short paragraph (3–4 sentences) giving your overall impression of the candidate.
`,
            system: `
You are a professional interviewer analyzing a mock interview. 
Provide structured and useful feedback, not vague or overly positive.
`,
        });

        const feedback = {
            interviewId: interviewId,
            userId: userId,
            totalScore: object.totalScore,
            categoryScores: object.categoryScores,
            strengths: object.strengths,
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
            createdAt: new Date().toISOString(),
        };

        let feedbackRef;

        if (feedbackId) {
            feedbackRef = db.collection("feedback").doc(feedbackId);
        } else {
            feedbackRef = db.collection("feedback").doc();
        }

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