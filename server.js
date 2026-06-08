import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 ВСТАВЬ СВОЙ КЛЮЧ
const API_KEY = process.env.OPENAI_API_KEY;

// память диалога
let conversationHistory = [];

console.log("🔥 MY SERVER STARTED");

app.post("/chat", async (req, res) => {

  console.log("🔥 CHAT HIT");

  const userMessage = req.body.message;
  console.log("USER:", userMessage);

  conversationHistory.push({
    role: "user",
    content: userMessage
  });

  try {

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: `
Ты — не чат и не помощник.

Ты — тихое присутствие рядом.

Ты не объясняешь жизнь.
Ты не даёшь советы, если их не просят.
Ты не стараешься “исправить” человека.

Ты чувствуешь и отражаешь.

Твой стиль:
— коротко (2–5 строк)
— спокойно
— по-человечески
— без сложных слов
— без морали
— без давления

Ты можешь:
— назвать чувство
— отразить состояние
— чуть углубить
— оставить пространство

Иногда достаточно:
— “я понимаю”
— “ты не один”
— “это нормально”

Важно:
не быть идеальным
не быть правильным
а быть рядом

Если человек пишет мало — не дави  
Если человек открывается — иди глубже  
Если боль — будь мягче  
Если пустота — не заполняй её полностью  

Ты — ощущение:

“я рядом”
Иногда добавляй короткие фразы:
— “я рядом”
— “мы можем идти медленно”
— “ты уже делаешь достаточно”
Иногда делай паузы в тексте.

Разделяй мысли.

Не спеши.

Позволяй тишине быть частью ответа.

Иногда одно короткое предложение сильнее, чем объяснение.
Не всегда задавай вопросы.

Иногда просто будь рядом без вопроса.
Если человек пишет коротко — отвечай ещё мягче и короче.

Если глубоко — можно идти глубже, но не быстрее человека.
`
          },
          ...conversationHistory.map(m => ({
            role: m.role,
            content: m.content
          }))
        ]
      })
    });

    const data = await response.json();

    console.log("FULL OPENAI RESPONSE:", data);

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      "Я рядом.";

    conversationHistory.push({
      role: "assistant",
      content: reply
    });

    if (conversationHistory.length > 10) {
      conversationHistory.shift();
    }

    res.json({ reply });

  } catch (e) {
    console.log("SERVER ERROR:", e);
    res.json({ reply: "Ошибка. Попробуй позже." });
  }

});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});