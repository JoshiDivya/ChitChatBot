import Chat from "@/models/chat";
import { getSession } from "@auth0/nextjs-auth0";
import dbConnect from "lib/mongodb";


export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const { message } = req.body;
    const newUserMsg = {
      role: "user",
      content: message,
    };
    await dbConnect();
    const userChatMessage = {
      userId: user.sub,
      messages: [newUserMsg],
      title: message,
    };
    const chat = Chat(userChatMessage);
    await chat.save();
    // Respond with success
    res.status(201).json({
      message: "New chat saved successfully",
      data: {
        _id: chat._id.toString(),
        messages: [newUserMsg],
        title: message,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occured while creating a new chat" });
    console.error("Error occured during creating a new chat", error);
  }
}
