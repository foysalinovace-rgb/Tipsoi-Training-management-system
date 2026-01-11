
import { GoogleGenAI, Type } from "@google/genai";
import { TrainingBooking, Trainer } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const checkScheduleConflicts = async (
  newBooking: Partial<TrainingBooking>,
  existingBookings: TrainingBooking[],
  trainers: Trainer[]
) => {
  const prompt = `
    Analyze the following training booking and existing schedule for conflicts.
    New Booking: ${JSON.stringify(newBooking)}
    Existing Bookings: ${JSON.stringify(existingBookings)}
    Trainers: ${JSON.stringify(trainers)}

    Identify if the assigned trainer is already booked for the same date and overlapping time.
    If there is a conflict, suggest 3 alternative time slots or dates within the same week.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasConflict: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["hasConflict", "reason", "suggestions"]
        }
      }
    });

    /* Safely access and trim text from response before parsing as JSON */
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI Conflict Detection Failed:", error);
    return { hasConflict: false, reason: "Unable to analyze", suggestions: [] };
  }
};

export const generateTrainingOutline = async (title: string, category: string) => {
  const prompt = `Generate a professional 4-point training outline for a corporate session titled "${title}" in the category "${category}".`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Outline could not be generated at this time.";
  } catch (error) {
    console.error("AI Outline Generation Failed:", error);
    return "Outline could not be generated at this time.";
  }
};
