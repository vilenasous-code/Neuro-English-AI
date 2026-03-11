import { GoogleGenAI, Type } from '@google/genai';

export const getApiKey = () => {
  // Prioritize the user-selected paid key (API_KEY) if available.
  // Then fallback to the platform's default free key (GEMINI_API_KEY).
  // If deployed externally, use VITE_GEMINI_API_KEY.
  const keys = [
    process.env.API_KEY,
    process.env.GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY
  ];
  
  // The Firebase API key was accidentally leaked and revoked. 
  // If the user pasted it into their secrets, we must ignore it.
  const leakedKey = 'AIzaSyDPAd8p0VCRV0-j9MU6hRQYrYy2Ji4iBN4';
  
  for (const key of keys) {
    if (key && key !== leakedKey && key !== 'MISSING_API_KEY') {
      return key;
    }
  }
  
  return 'MISSING_API_KEY';
};

const getAIClient = () => {
  const apiKey = getApiKey();
  if (apiKey === 'MISSING_API_KEY') {
    throw new Error("API Key is missing. Please configure VITE_GEMINI_API_KEY in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

const parseJSONResponse = (text: string | undefined, defaultVal: any) => {
  if (!text) return defaultVal;
  try {
    const cleaned = text.replace(/```json/i, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    return defaultVal;
  }
};

export const generateMindMapData = async (topic: string, level: string) => {
  const ai = getAIClient();

  const prompt = `Create an English vocabulary and grammar mind map for the topic "${topic}" at CEFR level ${level}.
  
  The mind map should have a central root node for the topic, branching out into 3-4 main categories (e.g., Nouns, Verbs, Adjectives, or specific subtopics).
  Each category should have 3-5 specific vocabulary words or grammar points.
  For each specific word/point, include a short definition and an example sentence appropriate for the ${level} level.
  
  Return the data as a JSON object with two arrays: 'nodes' and 'edges'.
  
  Nodes must have:
  - id: unique string
  - type: 'customNode'
  - data: { label: string, definition?: string, example?: string, category?: string }
  - position: { x: number, y: number } (Arrange them in a radial or hierarchical layout starting from x:0, y:0)
  
  Edges must have:
  - id: unique string
  - source: source node id
  - target: target node id
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                data: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    example: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ['label']
                },
                position: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER }
                  },
                  required: ['x', 'y']
                }
              },
              required: ['id', 'type', 'data', 'position']
            }
          },
          edges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                source: { type: Type.STRING },
                target: { type: Type.STRING }
              },
              required: ['id', 'source', 'target']
            }
          }
        },
        required: ['nodes', 'edges']
      }
    }
  });

  return parseJSONResponse(response.text, { nodes: [], edges: [] });
};

export const generateExercises = async (topic: string, level: string, nodes: any[]) => {
  const ai = getAIClient();

  const vocabulary = nodes.map(n => n.data.label).join(', ');
  const prompt = `Create 5 active recall exercises for an English learner at CEFR level ${level} based on the topic "${topic}".
  Use this vocabulary: ${vocabulary}.
  
  The exercises should be a mix of:
  - 'sentence': Create a sentence using a specific word.
  - 'describe': Describe a situation or concept.
  - 'complete': Complete a fill-in-the-blank sentence.
  
  Return a JSON array of objects, each with 'question', 'type', and a sample 'answer'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            type: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ['question', 'type', 'answer']
        }
      }
    }
  });

  return parseJSONResponse(response.text, []);
};

export const generateDialogue = async (topic: string, level: string, nodes: any[]) => {
  const ai = getAIClient();

  const vocabulary = nodes.map(n => n.data.label).join(', ');
  const prompt = `Create a realistic contextual dialogue between two people about "${topic}" for an English learner at CEFR level ${level}.
  Incorporate as much of this vocabulary as naturally possible: ${vocabulary}.
  
  Return a JSON array of objects representing the dialogue turns. Each object should have 'speaker' (e.g., "Person A", "Waiter", "Customer") and 'text'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            speaker: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ['speaker', 'text']
        }
      }
    }
  });

  return parseJSONResponse(response.text, []);
};
