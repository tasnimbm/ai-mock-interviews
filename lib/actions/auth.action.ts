'use server';

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7 * 1000; // milliseconds

// ---------------- SIGN UP ----------------
export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        // Get user document by UID
        const userDoc = await db.collection("users").doc(uid).get();

        if (userDoc.exists) {
            return {
                success: false,
                message: "User already exists. Please sign in instead.",
            };
        }

        // Create the user document
        await db.collection("users").doc(uid).set({
            name,
            email,
        });

        return {
            success: true,
            message: "Account created successfully. Please sign in.",
        };
    } catch (e: any) {
        console.error("Error creating a user:", e);

        if (e.code === "auth/email-already-exists") {
            return {
                success: false,
                message: "This email is already in use.",
            };
        }

        return {
            success: false,
            message: "Failed to create account.",
        };
    }
}

// ---------------- SIGN IN ----------------
export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        const userRecord = await auth.getUserByEmail(email);

        if (!userRecord) {
            return {
                success: false,
                message: "User does not exist. Create an account instead.",
            };
        }

        // Set session cookie
        await setSessionCookie(idToken);

        return {
            success: true,
            message: "Signed in successfully.",
        };
    } catch (e: any) {
        console.error("Error logging in:", e);
        return {
            success: false,
            message: "Failed to log into an account.",
        };
    }
}

// ---------------- SESSION COOKIE ----------------
export async function setSessionCookie(idToken: string) {
    const cookieStore = cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK, // milliseconds
    });

    cookieStore.set("session", sessionCookie, {
        maxAge: ONE_WEEK / 1000, // maxAge is in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    });
}

// ---------------- GET CURRENT USER ----------------
export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        const userDoc = await db
            .collection("users")
            .doc(decodedClaims.uid) // use uid, not a second argument
            .get();

        if (!userDoc.exists) return null;

        return {
            ...userDoc.data(),
            id: userDoc.id,
        } as User;
    } catch (e) {
        console.error("Error getting current user:", e);
        return null;
    }
}

// ---------------- CHECK AUTH ----------------
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}
