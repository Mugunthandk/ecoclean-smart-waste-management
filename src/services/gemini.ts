import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                       (import.meta as any).env?.GEMINI_API_KEY || 
                       '';

interface WasteAnalysis {
  wasteType: string;
  priority: 'Low' | 'Medium' | 'High';
  suggestedAction: string;
}

export async function analyzeWaste(imageBase64: string, description: string = ''): Promise<WasteAnalysis> {
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
  
  const defaultResult: WasteAnalysis = {
    wasteType: 'Other',
    priority: 'Medium',
    suggestedAction: 'Schedule routine cleanup'
  };

  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set, using default analysis');
    return defaultResult;
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const prompt = `Analyze this waste/garbage image and provide a JSON response with the following fields:
    - wasteType: The type of waste (Plastic, Organic, Paper, Metal, Glass, Electronic, or Other)
    - priority: The urgency level (Low, Medium, or High) based on health hazards, volume, and environmental impact
    - suggestedAction: A brief recommended action for cleanup (max 100 characters)
    
    Additional context from user: "${description || 'None provided'}"
    
    Respond ONLY with valid JSON in this exact format:
    {"wasteType": "...", "priority": "...", "suggestedAction": "..."}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        },
      ],
    });

    const text = response.text || '';
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        wasteType: parsed.wasteType || defaultResult.wasteType,
        priority: ['Low', 'Medium', 'High'].includes(parsed.priority) ? parsed.priority : defaultResult.priority,
        suggestedAction: parsed.suggestedAction || defaultResult.suggestedAction,
      };
    }
    
    return defaultResult;
  } catch (error) {
    console.error('Error analyzing waste with Gemini:', error);
    return defaultResult;
  }
}
