PrepWise - AI-Powered Interview Feedback Platform

PrepWise** is a web application designed to help candidates prepare for job interviews through AI-powered mock interviews and structured feedback. The platform simulates real interview scenarios, evaluates candidate responses, and provides actionable feedback to help improve technical knowledge, communication skills, problem-solving abilities, and overall interview readiness.

---

## Features

* **AI-Powered Interviewer**

  * Conducts real-time mock interviews using text or voice.
  * Uses Google Gemini to generate structured feedback.

* **Structured Feedback System**

  * Provides detailed scores in key categories:

    1. Communication Skills
    2. Technical Knowledge
    3. Problem Solving
    4. Cultural & Role Fit
    5. Confidence & Clarity
  * Includes strengths, areas for improvement, and a final assessment.

* **Transcript Management**

  * Automatically saves interview transcripts.
  * Analyzes candidate responses to generate precise feedback.

* **User-Friendly Dashboard**

  * View past interviews and feedback.
  * Retake interviews to track improvement over time.

* **Tech Stack Support**

  * Supports multiple technologies like React, Next.js, Node.js, MongoDB, Firebase, and more.

---

## How It Works

1. **Candidate participates in a mock interview**

   * Can be conducted via text or voice.
   * Interviewer asks structured, role-specific questions.

2. **Transcript is saved and analyzed**

   * Only candidate responses are analyzed to generate feedback.
   * AI evaluates responses across multiple categories.

3. **Feedback is generated**

   * Scores each category from 0–100.
   * Lists strengths and areas for improvement.
   * Provides an overall assessment of candidate performance.

4. **View feedback and track progress**

   * Users can see detailed feedback in a dashboard.
   * Allows candidates to retake interviews and improve scores.

---

## Technology Stack

* **Frontend:** React, Next.js, Tailwind CSS
* **Backend:** Node.js, Firebase Firestore
* **AI Integration:** Google Gemini (via `@ai-sdk/google`)
* **Voice & Transcription:** 11Labs (voice), Deepgram (transcription)
* **Validation & Structure:** Zod for schema validation

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/mockmate.git
cd mockmate
```

2. Install dependencies:

```bash
npm install
```

3. Set up Firebase credentials in `.env.local`:

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
```

4. Run the development server:

```bash
npm run dev
```

5. Deploy to Vercel or any preferred platform for production.

---

## Usage

* **Start an interview:** Navigate to the dashboard and select a role.
* **Answer questions:** Respond via text or voice.
* **Receive feedback:** AI analyzes responses and generates detailed feedback.
* **Track improvement:** Retake interviews and compare past results.

---

## Future Enhancements

* Add **role-specific interview flows** for different industries.
* Improve AI feedback with **context-aware scoring**.
* Implement **progress tracking & analytics** for users.
* Add **multi-language support** for global accessibility.

---



Do you want me to do that?
