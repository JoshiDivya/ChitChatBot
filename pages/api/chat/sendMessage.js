// import OpenAI from "openai";
import { data } from "autoprefixer";
import { OpenAIEdgeStream } from "openai-edge-stream";
// const openai = new OpenAI(process.env.OPENAI_API_KEY);

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const initialChatMessage = {
    role: "system",
    content:
      "Your name is Genify. An incredible intelligent and quick-thinking AI,that always reply with enthusiastic and Energy. You were created by a nerdy developer. Your response must be formatted as markdown.",
  };
  const { chatId: chatIdFromParams, message } = await req.json();
  let chatId = chatIdFromParams;
  let newChatId;
  let chatMessages = [];
  if (chatId) {
    const response = await fetch(
      `${req.headers.get("origin")}/api/chat/addMessageToChat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie"),
        },
        body: JSON.stringify({
          chatId,
          role: "user",
          content: message,
        }),
      }
    );

    const json = await response.json();
    chatMessages = json.chat.messages || [];
  } else {
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
    chatId = json.data._id;
    newChatId = json.data._id;
    chatMessages = json.data.messages || [];
  }

  const messageToInclude = [];
  chatMessages.reverse();
  let usedtoken = 0;
  for (let chatMessage of chatMessages) {
    const msgToken = chatMessage.content.length / 4;
    usedtoken += msgToken;
    if (usedtoken <= 2000) {
      messageToInclude.push(chatMessage);
    } else break;
  }
  chatMessages.reverse();

  let historyMessage = messageToInclude.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
  historyMessage.reverse();
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
        messages: [initialChatMessage, ...historyMessage],
      }),
    },
    {
      onBeforeStream: ({ emit }) => {
        if (newChatId) emit(newChatId, "NewChatId");
      },
      onAfterStream: async ({ fullContent }) => {
        console.log("after stream here");
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
