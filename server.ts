import { questionsData } from "./src/data/questions";
import { gradeLocally } from "./src/grading/localGrader";
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});


const app = express();
app.use(express.json());

// API route to get all questions
app.get('/api/questions', (req, res) => {
  res.json(questionsData);
});

// Robust Local Grader (Offline Fallback Mode)


// API route to grade user answer with Gemini, OpenAI, or Offline fallback
app.post('/api/grade', async (req, res) => {
  try {
    const { questionId, userAnswer, questionData, aiSettings } = req.body;
    
    const provider = aiSettings?.provider || 'gemini';
    const apiKey = aiSettings?.apiKey || process.env.GEMINI_API_KEY;

    if (provider === 'offline' || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json(gradeLocally(userAnswer, questionData));
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

    if (provider === 'openai') {
      const openAiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert math professor grading MAE101 exam answers in JSON format.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const openAiData = await openAiResp.json();
      const content = openAiData.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      return res.json({
        score: parsed.score ?? (parsed.isCorrect ? 1 : 0),
        isCorrect: parsed.isCorrect ?? (parsed.score === 1),
        aiFeedback: parsed.aiFeedback || "Chấm điểm hoàn tất.",
        skillsIdentified: parsed.skillsIdentified || [questionData.topic]
      });
    } else {
      const customAi = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
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
      } catch (e) {
        const cleaned = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }
      return res.json({
        score: parsed.score ?? (parsed.isCorrect ? 1 : 0),
        isCorrect: parsed.isCorrect ?? (parsed.score === 1),
        aiFeedback: parsed.aiFeedback || "Chấm điểm hoàn tất.",
        skillsIdentified: parsed.skillsIdentified || [questionData.topic]
      });
    }

  } catch (error: any) {
    console.warn("AI grading error or offline, falling back to local grading:", error.message);
    return res.json(gradeLocally(req.body.userAnswer, req.body.questionData));
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
