import { ChatSidebar } from "@/components/ChatSidebar";
import Head from "next/head";
import { streamReader } from "openai-edge-stream";
import { useState } from "react";

export default function ChatPage() {
  const [messageText, setMessageText] = useState("");
  const [choices, setChoices] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const response = await fetch("/api/chat/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText
        }),
      });
  
      const data = response.data;
      if(!data)
      return;
      const reader = data.getReader();
      await streamReader(reader, (message) => {
        console.log("MESSAGE", message);
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
        <ChatSidebar></ChatSidebar>
        <div className="bg-gray-700 flex flex-col">
          <div className="flex-1">
            {choices && choices.map((choice,index) => {return <p key={index}>{choice}</p> })}
          </div>
          <footer className="bg-gray-800 p-10 ">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Send a meassage"
                  className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-600"
                ></textarea>
                <button className="btn" type="submit">
                  Send
                </button>
                {/* <button
                  className="btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    const res = await fetch("/api/chat/sendMessage", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        someData: true,
                      }),
                    });
                   const result = await res.json();
                   setChoices(result.choices);
                  }}
                >
                  Try
                </button> */}
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
}
