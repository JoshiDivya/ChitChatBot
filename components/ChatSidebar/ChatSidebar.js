import { faMessage, faPlus, faRightFromBracket, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export const ChatSidebar = () => {
const [chatList,setChatList]= useState([]);

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch("/api/chat/getChatList", {
        method: "POST",
      });
      const chatList = await response.json();
      setChatList(chatList?.chats || []);

    };
    loadChatList();
  }, []);
  return (
    <div className="bg-gray-900 text-white flex flex-col overflow-hidden">
<Link href="/chat" className="side-menu-items bg-emerald-500 hover:bg-emerald-600"><FontAwesomeIcon icon={faPlus}/>New Chat</Link>
<div className="flex-1 overflow-auto bg-gray-950">
  {chatList.map(chat=> (<Link className="side-menu-items" href={`/chat/${chat._id}`} key={chat._id}><FontAwesomeIcon icon={faMessage}/>{chat.title}</Link>))}
</div>
      <Link href="/api/auth/logout" className="side-menu-items"><FontAwesomeIcon icon={faRightFromBracket}/> Logout</Link>
    </div>
  );
};
