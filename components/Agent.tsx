"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const Agent = ({
                   userName,
                   userId,
                   interviewId,
                   feedbackId,
                   type,
                   questions,
               }: AgentProps) => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Listen to Vapi events
    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message: Message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (error: Error) => console.error("VAPI Error:", error);

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);

    // Handle feedback or redirect after call ends
    useEffect(() => {
        const handleGenerateFeedback = async () => {
            if (!interviewId || !userId) return;
            const { success, feedbackId: id } = await createFeedback({
                interviewId,
                userId,
                transcript: messages,
                feedbackId,
            });

            if (success && id) {
                router.push(`/interview/${interviewId}/feedback`);
            } else {
                console.error("Error saving feedback");
                router.push("/");
            }
        };

        if (callStatus === CallStatus.FINISHED) {
            if (type === "generate") {
                router.push("/");
            } else {
                handleGenerateFeedback();
            }
        }
    }, [callStatus, messages, interviewId, feedbackId, router, type, userId]);

    // Start the call
    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        try {
            if (type === "generate") {
                // Start workflow directly, without an Agent
                await vapi.start(
                    undefined, // Agent ID
                    undefined, // Second param (context?)
                    undefined, // Third param
                    process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, // Workflow ID
                    {
                        variableValues: {
                            username: userName,
                            userid: userId,
                        },
                    }
                );
            } else {
                // Format questions safely
                const formattedQuestions = Array.isArray(questions)
                    ? questions.map((q) => `- ${q}`).join("\n")
                    : "";

                await vapi.start(interviewer, {
                    variableValues: {
                        questions: formattedQuestions,
                    },
                });
            }
        } catch (error) {
            console.error("Error starting call:", error);
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    return (
        <>
            <div className="call-view">
                {/* AI Interviewer Card */}
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="profile-image"
                            width={65}
                            height={54}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                {/* User Profile Card */}
                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="profile-image"
                            width={120}
                            height={120}
                            className="rounded-full object-cover"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {/* Transcript */}
            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript space-y-2">
                        {messages.map((msg, idx) => (
                            <p
                                key={idx}
                                className={cn(
                                    msg.role === "user" ? "text-blue-500" : "text-gray-800",
                                    "transition-opacity duration-300"
                                )}
                            >
                                {msg.role}: {msg.content}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Call Buttons */}
            <div className="w-full flex justify-center mt-4">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call" onClick={handleCall}>
            <span
                className={cn(
                    "absolute animate-ping rounded-full opacity-75",
                    callStatus !== CallStatus.CONNECTING && "hidden"
                )}
            />
                        <span className="relative">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                  ? "Call"
                  : ". . ."}
            </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;
