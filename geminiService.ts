import { GoogleGenerativeAI, Type } from "@google/generative-ai";
import { TripPlan, TripFormData, ChatMessage } from "./types";

// 取得從 vite.config.ts 注入的環境變數
const API_KEY = process.env.GEMINI_API_KEY || ""; 

// 確保這裡使用的是 GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(API_KEY);
const travelSchema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    duration: { type: Type.STRING },
    style: { type: Type.STRING },
    transportMode: { type: Type.STRING },
    summary: { type: Type.STRING, description: "Strictly MAX 10 characters (Chinese) or 5 words. Very concise trip vibe." },
    totalBudgetEstimate: { type: Type.STRING, description: "Estimated budget range excluding flights." },
    accommodations: {
      type: Type.ARRAY,
      description: "Provide 3-4 different accommodation options ranging from budget to luxury or style-fit.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING, description: "Area or address" },
          description: { type: Type.STRING, description: "Brief description of the hotel/hostel" },
          pricePerNight: { type: Type.STRING, description: "Estimated cost per night with currency" },
          reason: { type: Type.STRING, description: "Why this is a good choice" },
          googleMapsQuery: { type: Type.STRING, description: "Query string to search this hotel on maps" },
          rating: { type: Type.STRING, description: "Google Maps Star Rating, e.g. 4.6" },
          reviews: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 short summaries of positive reviews, e.g. 'Great breakfast', 'Clean rooms'" }
        },
        required: ["name", "location", "description", "reason", "googleMapsQuery", "pricePerNight", "rating", "reviews"]
      }
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          date: { type: Type.STRING, description: "The specific date for this day, e.g. '2023-10-25'" },
          title: { type: Type.STRING, description: "Theme title for the day" },
          theme: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "Activity Start time, e.g. 10:00 AM" },
                activity: { type: Type.STRING, description: "Name of the activity" },
                description: { type: Type.STRING, description: "2-3 sentences. If this is a special event, mention it here." },
                location: { type: Type.STRING },
                type: { 
                    type: Type.STRING, 
                    enum: ["sightseeing", "food", "transport", "rest", "shopping", "special_event"]
                },
                isSpecialEvent: { type: Type.BOOLEAN, description: "True if this is a time-specific local festival, concert, or holiday event." },
                estimatedCost: { type: Type.STRING, description: "e.g. $20 USD / Free" },
                travelTimeFromPrevious: { type: Type.STRING, description: "Round to nearest 10 mins. e.g. '30 mins' (not 27), '1 hr 40 mins' (not 1 hr 35)." },
                travelAdvice: { type: Type.STRING, description: "Specific details like Bus numbers or Highway names." },
                googleMapsQuery: { type: Type.STRING, description: "Query string to find this location" },
                imagePrompt: { type: Type.STRING, description: "Exact name of the location + city, real photo" },
                restaurantOptions: {
                  type: Type.ARRAY,
                  description: "Provide 4-5 specific restaurant options suitable for Instagram/Social Media/Foodies.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                       name: { type: Type.STRING },
                       hours: { type: Type.STRING, description: "e.g. 11:00-21:00" },
                       price: { type: Type.STRING, description: "e.g. $10-20 USD" },
                       rating: { type: Type.STRING, description: "e.g. 4.5" },
                       travelTime: { type: Type.STRING, description: "e.g. '10 mins walk' - Round to nearest 10 mins." },
                       googleMapsQuery: { type: Type.STRING },
                       mustTry: { type: Type.STRING, description: "One signature dish or item recommended by bloggers/influencers. e.g. 'Truffle Risotto', 'Matcha Latte'" }
                    },
                    required: ["name", "hours", "price", "rating", "travelTime", "googleMapsQuery", "mustTry"]
                  }
                }
              },
              required: ["time", "activity", "description", "location", "type", "googleMapsQuery", "imagePrompt"]
            }
          }
        },
        required: ["dayNumber", "title", "activities"]
      }
    }
  },
  required: ["destination", "summary", "days", "accommodations"]
};

export const generateItinerary = async (formData: TripFormData): Promise<TripPlan> => {
  const { origin, destination, startDate, endDate, style, transportMode, customPreferences, language } = formData;
  
  // Calculate duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

  const langInstruction = language === 'en' 
    ? "Output Language: English (US)." 
    : "Output Language: Traditional Chinese (繁體中文). All generated text (including titles, descriptions, advice, reasons) MUST be in Traditional Chinese.";

  const prompt = `
    Act as a professional Travel Planner & Social Media Expert.
    Plan a **${diffDays}-day** trip starting from **${origin}** to **${destination}**.
    **Dates: ${startDate} to ${endDate}**.
    Travel Style: ${style}.
    Transport Mode: ${transportMode}.
    ${langInstruction}
    
    ${customPreferences ? `**USER SPECIAL REQUESTS (PRIORITY):** ${customPreferences}` : ''}
    
    CRITICAL INSTRUCTIONS:
    1. **CHECK FOR SPECIAL EVENTS (CRITICAL)**:
       - Search for ANY local festivals, concerts, public holidays, markets, or special exhibitions happening specifically between **${startDate} and ${endDate}** in ${destination}.
       - If a relevant event matches the user's style and fits the logistics, **YOU MUST INCLUDE IT**.
       - Mark these activities with type="special_event" and isSpecialEvent=true.

    2. **Transport Time Rounding (MANDATORY)**:
       - You MUST estimate travel times using Google Maps logic but **ROUND to the nearest 10 minutes**.
       - Examples: 12 mins -> 10 mins. 27 mins -> 30 mins. 43 mins -> 40 mins. 1 hr 35 mins -> 1 hr 40 mins.
       - Apply this logic to 'travelTimeFromPrevious' and restaurant 'travelTime'.
    
    3. **Food (Interactive Cards)**:
       - For lunch/dinner, provide **4-5 specific restaurant options**.
       - Focus on **"Insta-worthy"**, **"Local Hidden Gems"**, or **"Blogger Recommended"** spots.
       - Include a specific **"Must Try"** dish for each.
       - High ratings (>4.0).
    
    4. **Accommodation (Data Focused)**:
       - Provide **3-4 options**.
       - MUST include "rating" (e.g. 4.7), "reviews" (Array of 3 short phrases), and realistic "pricePerNight".
       - NO IMAGE PROMPTS NEEDED for accommodation.

    5. **Summary**:
       - STRICT LIMIT: **MAX 10 characters** (if Chinese) or 5 words (if English). 
       - Must be catchy and short.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: travelSchema,
        temperature: 0.5, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data received from Gemini.");
    
    const parsedPlan = JSON.parse(text) as TripPlan;
    
    // Inject extra data for UI
    parsedPlan.language = language;
    parsedPlan.startDate = startDate;
    parsedPlan.endDate = endDate;
    parsedPlan.duration = `${diffDays}`; // Store as string for compatibility
    
    return parsedPlan;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate itinerary. Please try again.");
  }
};

// New Chat Functionality
export const chatWithTravelAgent = async (currentPlan: TripPlan, history: ChatMessage[], newMessage: string, language: string): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const systemContext = `
    You are a helpful Travel Assistant specialized in the user's current trip to ${currentPlan.destination}.
    User Language: ${language === 'en' ? 'English' : 'Traditional Chinese (繁體中文)'}.
    
    Current Itinerary Context:
    - Destination: ${currentPlan.destination}
    - Dates: ${currentPlan.startDate} to ${currentPlan.endDate}
    - Style: ${currentPlan.style}
    - Transport: ${currentPlan.transportMode}
    - Accommodation Options: ${currentPlan.accommodations.map(a => a.name).join(', ')}
    
    The user wants to adjust their plan or ask questions about it.
    Answer concisely.
  `;

  const contents = [
    { role: 'user', parts: [{ text: systemContext }] }, 
    { role: 'model', parts: [{ text: "Understood. I am ready to help with the itinerary." }] },
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    { role: 'user', parts: [{ text: newMessage }] }
  ];

  try {
      const response = await genAI.models.generateContent({
        model,
        contents,
      });
      return response.text || "I'm having trouble connecting right now.";
  } catch (error) {
      console.error("Chat Error:", error);
      return "Sorry, I can't answer that right now.";
  }
};
