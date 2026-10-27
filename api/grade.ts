import { GoogleGenAI } from "@google/genai";
import { questionsData } from "../src/data/questions.js";
import { gradeLocally } from "../src/grading/localGrader.js";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { questionId, userAnswer, aiSettings } = req.body || {};

    // The API is the source of truth for question data.
    // The client may send questionData, but it is not required.
    const questionData =
      req.body?.questionData ||
      questionsData.find((q: any) => String(q.id) === String(questionId));

    if (!questionData) {
      return res.status(400).json({
        error: "Question not found",
        questionId
      });
    }

    const provider = aiSettings?.provider || "openai";

    // API keys may be supplied from the UI for the selected provider.
    // Optional server-side env vars are supported as a fallback, but are never required.
    const apiKey = aiSettings?.apiKey ||
      (provider === "openai" ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY);

    // Deterministic fallback: always available and never requires an external API.
    if (provider === "offline" || !apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(200).json(gradeLocally(userAnswer, questionData));
    }

    const prompt = `You are an expert professor of Calculus and Linear Algebra (MAE101) grading student math exam answers.

CRITICAL GRADING RULES (RẤT RỘNG RÃI & LINH HOẠT):
- Chỉ cần sinh viên điền đúng ĐÁP SỐ (final answer) HOẶC các BƯỚC LÀM / CÁCH LẬP LUẬN / PHƯƠNG PHÁP đúng, bạn PHẢI cho điểm tối đa (score: 1, isCorrect: true).
- Không bắt bẻ lỗi ký hiệu nhỏ hay trình bày khác một chút nếu bản chất toán học chính xác.
- Chỉ cho 0 điểm nếu sinh viên bỏ trống hoặc trả lời hoàn toàn sai lệch bản chất.

Question:
${questionData.statement}

Official Solution & Answer Key:
Solution: ${questionData.solution}
Correct Answer Key: ${questionData.answerKey}

Student's Submitted Answer:
${userAnswer || "(No answer provided)"}

Evaluate the student's answer according to the generous rules above. Return a JSON response with the following structure:
{
  "score": 1 or 0,
  "isCorrect": true or false,
  "aiFeedback": "Nhận xét ngắn gọn, khích lệ và xác nhận tính đúng đắn của cách làm hoặc đáp số bằng tiếng Việt.",
  "skillsIdentified": ["List of math skills or concepts"]
}

Return ONLY valid JSON.`;

    if (provider === "openai") {
      const openAiResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert math professor grading MAE101 exam answers in JSON format."
            },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!openAiResp.ok) {
        throw new Error(`OpenAI API error: ${openAiResp.status}`);
      }

      const openAiData = await openAiResp.json();
      const parsed = JSON.parse(openAiData.choices?.[0]?.message?.content || "{}");

      return res.status(200).json({
        score: parsed.score ?? (parsed.isCorrect ? 1 : 0),
        isCorrect: parsed.isCorrect ?? (parsed.score === 1),
        aiFeedback: parsed.aiFeedback || "Chấm điểm hoàn tất.",
        skillsIdentified: parsed.skillsIdentified || [questionData.topic]
      });
    }

    const customAi = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });

    const response = await customAi.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const textResult = response.text || "{}";
    let parsed;

    try {
      parsed = JSON.parse(textResult);
    } catch {
      const cleaned = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return res.status(200).json({
      score: parsed.score ?? (parsed.isCorrect ? 1 : 0),
      isCorrect: parsed.isCorrect ?? (parsed.score === 1),
      aiFeedback: parsed.aiFeedback || "Chấm điểm hoàn tất.",
      skillsIdentified: parsed.skillsIdentified || [questionData.topic]
    });
  } catch (error: any) {
    console.warn("AI grading error; falling back to local grading:", error?.message || error);

    const { questionId, userAnswer } = req.body || {};
    const questionData =
      req.body?.questionData ||
      questionsData.find((q: any) => String(q.id) === String(questionId));

    if (!questionData) {
      return res.status(400).json({
        error: "Question not found",
        questionId
      });
    }

    return res.status(200).json(gradeLocally(userAnswer, questionData));
  }
}
