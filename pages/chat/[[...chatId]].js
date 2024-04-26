import { ChatSidebar } from "@/components/ChatSidebar";
import { Message } from "@/components/Message";
import dbConnect from "@/lib/mongodb";
import chat from "@/models/chat";
import { getSession } from "@auth0/nextjs-auth0";
import { ObjectId } from "mongodb";
import Head from "next/head";
import { useRouter } from "next/router";
import { streamReader } from "openai-edge-stream";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

export default function ChatPage({ chatId, title, messages = [] }) {
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newMsg, setNewMsg] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [fullMessage, setFullMessage] = useState([]);

  const route = useRouter();

  //adding new msg to existing chat
  useEffect(() => {
    if (!generatingResponse && fullMessage) {
      setNewMsg((prev) => [
        ...prev,
        {
          _id: uuid(),
          role: "assistant",
          content: fullMessage,
        },
      ]);
      setFullMessage("");
    }
  }, [generatingResponse, fullMessage]);

  // when out route change
  useEffect(() => {
    setNewMsg([]);
    setNewChatId(null);
  }, [chatId]);

  // when adding a new Chat
  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      route.push(`/chat/${newChatId}`);
    }
  }, [generatingResponse, newChatId, route]);

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
          chatId,
          message: messageText,
        }),
      });

      const data = response.body;
      if (!data) return;

          const reader = data.getReader();
          let content = "";
          await streamReader(reader, async (message) => {
            if (message.event === "NewChatId") {
              setNewChatId(message.content);
            } else {
              setIncomingMessage((s) => `${s}${message.content}`);
              content = content + message.content;
            }
           
          });
          setFullMessage(content);
          setIncomingMessage("");
          setGeneratingResponse(false);
        } catch (error) {
          console.error(error);
        }
      };

      const allMessages = [...messages, ...newMsg];
  //     const reader = data.getReader();
  //     let content = "";
  //     await streamReader(reader, (message) => {
  //       console.log("MESSAGE: ", message);
  //       if (message.event === "newChatId") {
  //         setNewChatId(message.content);
  //       } else {
  //         setIncomingMessage((s) => `${s}${message.content}`);
  //         content = content + message.content;
  //       }
  //     });

  //     setFullMessage(content);
  //     setIncomingMessage("");
  //     setGeneratingResponse(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const allMessages = [...messages, ...newChatMessages];
  return (
    <div>
      <Head>
        <title>new chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} />
        <div className="bg-gray-700 flex flex-col overflow-hidden">
          <div className="flex-1 text-white overflow-y-scroll">
            {allMessages.map((msg) => (
              <Message key={msg._id} role={msg.role} content={msg.content} />
            ))}
            {!!incomingMessage && (
              <Message role="assistant" content={incomingMessage} />
            )}
          </div>
          <footer className="bg-gray-800 p-10 ">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`${generatingResponse ? "" : "Send a meassage"}`}
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

export const getServerSideProps = async (context) => {
  const chatId = context.params?.chatId?.[0] || null;
  if (chatId) {
    const { user } = await getSession(context.req, context.res);
    await dbConnect();
    const chatData = await chat.findOne({
      userId: user.sub,
      _id: new ObjectId(chatId),
    });
    const serializedMessages = chatData.messages.map((message) => ({
      role: message.role,
      content: message.content,
      _id: uuid(),
      // Generate a new UUID for _id
    }));
    return {
      props: {
        chatId,
        title: chatData.title,
        messages: serializedMessages,
      },
    };
  }
  return {
    props: {},
  };
};
