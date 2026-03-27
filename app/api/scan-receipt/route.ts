import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return NextResponse.json({ error: "no file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      you are an expert receipt parser. extract the following information from this receipt:
      1. the merchant or store name.
      2. the date of the receipt (format as YYYY-MM-DD. if year is missing, assume the current year).
      3. guess the most likely category ("food", "transport", "shopping", "entertainment", or "other").
      4. the individual purchased items and their TOTAL prices (include quantity in the name if > 1, e.g., "es teh manis x2").
      5. the FINAL total amount paid (after all taxes, service charges, and discounts).

      CRITICAL: convert all string values (merchant name, item names) to strictly lowercase.

      return the result STRICTLY as a JSON object matching this exact structure:
      {
        "merchantName": "sate taichan senayan",
        "date": "2026-03-27",
        "category": "food",
        "totalAmount": 127600,
        "items": [
          { "name": "t.taichan ori x4", "price": 112000 },
          { "name": "e.lychee tea", "price": 15000 }
        ]
      }
      do not include any markdown formatting (like \`\`\`json) or conversational text. output RAW JSON only.
    `;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const cleanJson = text
      .replace(/\`\`\`json/g, "")
      .replace(/\`\`\`/g, "")
      .trim();
    const parsedData = JSON.parse(cleanJson);

    // we now return the whole parsed object (which includes totalAmount and items)
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("ocr failed:", error);
    return NextResponse.json(
      { error: "failed to parse receipt" },
      { status: 500 },
    );
  }
}
