import { GoogleGenAI, Type } from "@google/genai";
import { Repository, AnalysisResult, AiProvider, BlogPost } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `You are a world-class senior software engineer and venture capitalist. 
Analyze GitHub repositories and provide insights in strictly valid JSON format.`;

const buildAnalysisPrompt = (repo: Repository) => `
Analyze the following GitHub repository:
Repository: ${repo.full_name}
Description: ${repo.description}
Language: ${repo.language}
Topics: ${repo.topics.join(', ')}
Stars: ${repo.stargazers_count}

Response must be a JSON object with:
1. "summary": (string) 2 sentence overview.
2. "useCases": (array of 3 strings) practical applications.
3. "techStackAnalysis": (string) why this stack matters.
4. "hypeScore": (integer 0-100) based on trends.
5. "nextDirections": (array of 3 strings) feature roadmap.
6. "revenueModels": (array of 3 strings) monetization potential.
7. "competitors": (array of 3 strings) existing alternatives.
8. "riskAssessment": (string) 1 sentence on technical or market risks.
`;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isRetryable = 
      error?.status === 503 || 
      error?.code === 503 ||
      error?.status === 429 || 
      error?.code === 429 ||
      error?.message?.includes('unavailable') ||
      error?.message?.includes('overloaded') ||
      error?.message?.includes('rate limit');

    if (retries > 0 && isRetryable) {
      console.warn(`Operation failed with ${error.status || error.code || 'error'}. Retrying in ${delay}ms...`);
      await wait(delay);
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

const analyzeWithGemini = async (repo: Repository): Promise<AnalysisResult> => {
  return retryOperation(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: buildAnalysisPrompt(repo),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            useCases: { type: Type.ARRAY, items: { type: Type.STRING } },
            techStackAnalysis: { type: Type.STRING },
            hypeScore: { type: Type.INTEGER },
            nextDirections: { type: Type.ARRAY, items: { type: Type.STRING } },
            revenueModels: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskAssessment: { type: Type.STRING }
          },
          required: ["summary", "useCases", "techStackAnalysis", "hypeScore", "nextDirections", "revenueModels", "competitors", "riskAssessment"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as AnalysisResult;
  });
};

const analyzeWithAnthropic = async (repo: Repository): Promise<AnalysisResult> => {
  // Assuming ANTHROPIC_API_KEY is handled or mapped to process.env.API_KEY in proxy setups
  const apiKey = process.env.API_KEY; 
  
  return retryOperation(async () => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildAnalysisPrompt(repo) + "\nOutput ONLY the JSON object." }]
      })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Anthropic API Error: ${response.statusText} ${errorBody}`);
    }
    const data = await response.json();
    const content = data.content[0].text;
    return JSON.parse(content) as AnalysisResult;
  });
};

const analyzeWithOpenRouter = async (repo: Repository): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  return retryOperation(async () => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildAnalysisPrompt(repo) + "\nOutput ONLY the JSON object." }
        ]
      })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter Error: ${response.statusText} ${errorBody}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as AnalysisResult;
  });
};

export const generateBlogPost = async (repo: Repository, analysis: AnalysisResult | null): Promise<BlogPost> => {
  return retryOperation(async () => {
    const prompt = `
      Create a high-quality, engaging blog post about the following GitHub repository:
      Repository: ${repo.full_name}
      Description: ${repo.description}
      Language: ${repo.language}
      Topics: ${repo.topics.join(', ')}
      ${analysis ? `AI Analysis Summary: ${analysis.summary}` : ''}
      ${analysis ? `Key Use Cases: ${analysis.useCases.join(', ')}` : ''}
      ${analysis ? `Tech Stack Insights: ${analysis.techStackAnalysis}` : ''}

      The blog post should be professional yet exciting, suitable for a tech audience.
      It should include:
      1. A catchy title.
      2. An introduction explaining the problem it solves.
      3. A deep dive into features and tech stack.
      4. Potential use cases.
      5. A conclusion with a call to action to check out the repo.

      Response must be a JSON object with:
      1. "title": (string)
      2. "content": (string) Markdown formatted content.
      3. "tags": (array of strings) 3-5 relevant tags.
      4. "summary": (string) 1-2 sentence summary for social media.
      5. "author": (string) "GitTrends AI Assistant"
      6. "date": (string) current date in YYYY-MM-DD format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional tech blogger and developer advocate.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            author: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["title", "content", "tags", "summary", "author", "date"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as BlogPost;
  });
};

export const analyzeRepository = async (repo: Repository, provider: AiProvider = 'gemini'): Promise<AnalysisResult> => {
  try {
    let result: AnalysisResult;
    switch (provider) {
      case 'anthropic':
        result = await analyzeWithAnthropic(repo);
        break;
      case 'openrouter':
        result = await analyzeWithOpenRouter(repo);
        break;
      case 'gemini':
      default:
        result = await analyzeWithGemini(repo);
    }
    return { ...result, provider };
  } catch (error) {
    console.error(`Error analyzing with ${provider}:`, error);
    return {
      summary: "Could not generate analysis at this time. Service may be unavailable.",
      useCases: ["Check back later", "Manual review required", "Service busy"],
      techStackAnalysis: "Data unavailable due to high traffic.",
      hypeScore: 0,
      nextDirections: ["Data unavailable"],
      revenueModels: ["Data unavailable"],
      competitors: ["Data unavailable"],
      riskAssessment: "Analysis incomplete.",
      provider
    };
  }
};