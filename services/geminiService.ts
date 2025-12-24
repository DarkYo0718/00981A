
import { GoogleGenAI, Type } from "@google/genai";
import { Holding } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Manually parse raw text provided by the user.
 */
export const parseRawHoldings = async (rawText: string, date: string): Promise<Holding[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following raw text which contains ETF holdings data for date ${date}. 
    Extract the stock symbol (or ticker), company name, total shares held, and the percentage weight.
    
    Data Source Content:
    ${rawText}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          holdings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                shares: { type: Type.NUMBER, description: "Total quantity of shares" },
                weight: { type: Type.NUMBER, description: "Percentage weight in the portfolio" },
              },
              required: ["symbol", "name", "shares", "weight"]
            }
          }
        },
        required: ["holdings"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return data.holdings;
};

/**
 * Automatically fetch the latest holdings using Google Search Grounding.
 */
export const autoFetchHoldings = async (): Promise<{ holdings: Holding[], date: string, sourceUrl: string }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "請從統一投信官網找到 00981 (統一全球半導體 ETF) 的最新每日持股清單。你需要提供最新的數據日期、所有持股的代號、公司名稱、持有股數以及權重百分比。",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Data date in YYYY-MM-DD format" },
          holdings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                name: { type: Type.STRING },
                shares: { type: Type.NUMBER },
                weight: { type: Type.NUMBER },
              },
              required: ["symbol", "name", "shares", "weight"]
            }
          }
        },
        required: ["date", "holdings"]
      }
    }
  });

  const data = JSON.parse(response.text);
  const sourceUrl = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web?.uri || "https://www.upam.com.tw/";

  return {
    holdings: data.holdings,
    date: data.date,
    sourceUrl: sourceUrl
  };
};
