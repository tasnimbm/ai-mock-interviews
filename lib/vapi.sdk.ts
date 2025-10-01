import Vapi from "@vapi-ai/web";

// Validate token exists
const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
if (!token) {
    console.error("VAPI token is missing. Check your environment variables.");
}

export const vapi = new Vapi(token!);

// Add initialization check
export const initializeVapi = async () => {
    try {
        await vapi.initialize();
        console.log("✅ VAPI initialized successfully");
        return true;
    } catch (error) {
        console.error("❌ VAPI initialization failed:", error);
        return false;
    }
};