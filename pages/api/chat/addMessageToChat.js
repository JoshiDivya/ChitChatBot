import dbConnect from "@/lib/mongodb";
import chat from "@/models/chat";
import { getSession } from "@auth0/nextjs-auth0";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const { chatId, role, content } = req.body;
    await dbConnect();
    const chatData = await chat.findByIdAndUpdate(
      {
        _id: new ObjectId(chatId),
        userId: user.sub,
      },
      {
        $push: {
          messages: {
            role,
            content,
          },
        },
      },
      {
        returnDocument: "after",
      }
    );
    res
      .status(200)
      .json({ chat: { ...chatData.value, _id: chatData.value._id.toString() } });
  } catch (error) {
    res.status(500).json({
      message: "An error occured when adding a message in chat",
      error: error,
    });
  }
}
