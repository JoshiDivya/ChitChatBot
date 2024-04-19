// import OpenAI from "openai";
import { OpenAIEdgeStream } from "openai-edge-stream";
// const openai = new OpenAI(process.env.OPENAI_API_KEY);

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { message } = await req.json();
  const initialChatMessage = {
    role: "system",
    content:
      "Your name is Genify. An incredible intelligent and quick-thinking AI,that always reply with enthusiastic and Energy. You were created by a nerdy developer. Your response must be formatted as markdown.",
  };

  const response = await fetch(
    `${req.headers.get("origin")}/api/chat/createNewChat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie"),
      },
      body: JSON.stringify({
        message,
      }),
    }
  );
  const json = await response.json();
  console.log("response on createNewChat", json);
  const chatId = json.data._id;
  console.log("chatId from createNewChat response", chatId);

  const stream = await OpenAIEdgeStream(
    "https://api.openai.com/v1/chat/completions",
    {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [initialChatMessage, { role: "user", content: message }],
      }),
    },
    {
      onBeforeStream: ({ emit }) => {
        emit(chatId, "NewChatId");
      },
      onAfterStream: async ({ fullContent }) => {
        await fetch(`${req.headers.get("origin")}/api/chat/addMessageToChat`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: req.headers.get("cookie"),
          },
          body: JSON.stringify({
            chatId,
            role: "assistant",
            content: fullContent,
          }),
        });
      },
    }
  );
  return new Response(stream);
}
