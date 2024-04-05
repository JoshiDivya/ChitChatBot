
import OpenAI from "openai";
import { NextResponse } from "next/server";
const openai = new OpenAI(process.env.OPENAI_API_KEY);

export const config = {
  runtime: "edge",
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req) {
  try {
    const {message} =await req.json();
    const response = await openai.completions.create({
      messages: [
        {"role": "user", "content": message}
      ],
      model: "gpt-3.5-turbo",
    stream:true,
    });

    return new Response(response);

  } catch (error) {
    console.error(error);
   
  }
}


