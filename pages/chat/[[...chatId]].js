import { ChatSidebar } from "@/components/ChatSidebar";
import { Message } from "@/components/Message";
import Head from "next/head";
import { streamReader } from "openai-edge-stream";
import { useState } from "react";
import { v4 as uuid } from "uuid";

export default function ChatPage() {
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newMsg, setNewMsg] = useState([]);
  const [generatingPresponse, setGeneratingResponse] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);
    setNewMsg((prev) => {
      const newArr = [
        ...prev,
        {
          _id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
      return newArr;
    });
    setMessageText("");
    try {
      const response = await fetch("/api/chat/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
        }),
      });

      const data = response.body;
      if(!data)
      return;

      const reader = data.getReader();
      await streamReader(reader,async (message)=>{
        console.log("Message",message);
        setIncomingMessage(s=> `${s}${message.content}`);
        setGeneratingResponse(false);
      })

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Head>
        <title>new chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar />
        <div className="bg-gray-700 flex flex-col overflow-hidden">
          <div className="flex-1 text-white overflow-y-scroll">
            {newMsg.map((msg) => (
              <Message key={msg._id} role={msg.role} content={msg.content} />
            ))}
            {!!incomingMessage && (
              <Message role="assistant" content={incomingMessage} />
            )}
          </div>
          <footer className="bg-gray-800 p-10 ">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingPresponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`${generatingPresponse ? "" : "Send a meassage"}`}
                  className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-600"
                ></textarea>
                <button className="btn" type="submit">
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
}
