import dbConnect from "@/lib/mongodb";
import Chat from "@/models/chat";
import { getSession } from "@auth0/nextjs-auth0";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    await dbConnect();
    const chats = await Chat.find(
      { userId: user.sub },
      { projection: { userId: 0, messages: 0 } }
    )
      .sort({ _id: -1 });
    res.status(200).json({ chats });
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json({ message: error });
  }
}
