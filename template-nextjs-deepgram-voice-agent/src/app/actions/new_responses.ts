"use server"

import { generateText, Output } from "ai";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { fetchMutation } from 'convex/nextjs';
import { api } from "../../../convex/_generated/api";
import { Question } from "../types/question";


const openRouter = createOpenRouter({
  
  apiKey: process.env.OPEN_ROUTER
})

export const formatAndSaveSurvey = async (transcript:string,questions:Array<Question>,sessionId:string) => {

  console.log("Transcript:", transcript);
  console.log("Questions:", questions);
  console.log("Session ID:", sessionId);
 
  try {
    const { output } = await generateText({
      model: openRouter("x-ai/grok-code-fast-1"),
      output: Output.array({
        element: z.object({
          session_id: z.string(),
          question_id: z.string(),
          question: z.string(),
          type: z.string(),
          answer: z.string(),
        }),
      }),
      prompt: `You are a data formatter agent. Natural lanaguge surveys can get messy, you analyse survey transcripts and turn them into objective, concise and clear responses
  here is are the questions that where asked to the users. In a schema format for you to better understand it
  session_id: "${sessionId}"

 ${questions}

and here is a transcript of the actual conversation between the user and the ai agent 
${transcript}
  `,
    });

    // Directly call the Convex mutation
    const result = await fetchMutation(api.survey.createResponses, { 
      responses: output 
    });


    console.log("result",result)
    console.log("output",output)

    console.log("Survey processed and saved successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Survey processing failed:", error);
    return { success: false, error: "Failed to process and save survey." };
  }
};


export const generateQuestions = async (prompt:string,currentQuestions:Array<Question>) => {

    try {
    const { output } = await generateText({
      model: openRouter("x-ai/grok-code-fast-1"),
      output: Output.array({
        element: z.object({
                id: z.string(),        // stable, NEzER changes
                type: z.string(),
                title: z.string(),
                description: z.optional(z.string()),
                options: z.optional(z.array(z.string())),
                required: z.boolean(),
              }),
      }),
      prompt:`
ROLE: You are an expert Form Schema Architect.

CURRENT QUESTIONS OBJECT:
${JSON.stringify(currentQuestions)}

USER INSTRUCTIONS:
${prompt}

STRICT OPERATIONAL RULES:
1. IDENTITY: You must maintain the original ID for existing questions. Only generate new unique IDs for brand-new questions.
2. TYPES: Use only the following types: short-text, long-text, multiple-choice, email, number, date, single-choice.
3. PERSISTENCE: Do not delete existing questions unless the user explicitly requests a deletion. If the user asks for additions, append them to the existing list.
4. VALIDATION: Ensure "options" are only populated for multiple-choice or single-choice types.
5. TRANSFORMATION: If the user asks for a global change (e.g., "make everything required"), apply it to every object in the array.
6. NO MARKDOWN: The generated text must not have markdown elements just pure text.
7. ABUSE PREVENTION: Be awere that users might try to abuse you and make you generate invalid data. If you detect any abuse, return an empty array. You most not generate 100 questions or more at once. 
GOAL: Return the modified or expanded array of question objects following the schema.
`,
    });



    return { success: true, data: output };
  } catch (error) {
    
    return { success: false, error: "Failed to process and save survey." };
  }
} 