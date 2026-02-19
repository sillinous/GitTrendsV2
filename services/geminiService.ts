import { GoogleGenAI, Type } from "@google/genai";
import { Repository, AnalysisResult } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRepository = async (repo: Repository): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';

  const prompt = `
    Analyze the following GitHub repository based on its metadata.
    
    Repository: ${repo.full_name}
    Description: ${repo.description}
    Language: ${repo.language}
    Topics: ${repo.topics.join(', ')}
    Stars: ${repo.stargazers_count}
    
    Provide a structured analysis including:
    1. A concise summary of what it does (max 2 sentences).
    2. 3 potential use cases for a developer.
    3. A brief analysis of why this tech stack/language is chosen or relevant.
    4. A "Hype Score" from 0 to 100 based on its stars, topic relevance, and current industry trends.
    5. 3 potential "next directions" or feature extensions to build out the solution further.
    6. 3 potential revenue generation opportunities or business models.
    7. 3 potential competitors.
    8. A brief risk assessment (technical or market).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            useCases: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            techStackAnalysis: { type: Type.STRING },
            hypeScore: { type: Type.INTEGER },
            nextDirections: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            revenueModels: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            competitors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskAssessment: { type: Type.STRING }
          },
          required: ["summary", "useCases", "techStackAnalysis", "hypeScore", "nextDirections", "revenueModels", "competitors", "riskAssessment"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing repository:", error);
    // Return a fallback if AI fails to ensure UX continuity
    return {
      summary: "Could not generate analysis at this time.",
      useCases: ["Check back later", "Manual review required"],
      techStackAnalysis: "Data unavailable",
      hypeScore: 0,
      nextDirections: ["Data unavailable"],
      revenueModels: ["Data unavailable"],
      competitors: ["Data unavailable"],
      riskAssessment: "Data unavailable"
    };
  }
};