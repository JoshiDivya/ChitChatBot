import mongoose from "mongoose";

if (process.env.NODE_ENV === 'development') {
    mongoose.models = {};
    mongoose.modelSchemas = {};
}

const chatSchema = new mongoose.Schema({
  userId : String,
  messages: [{ role: String, content: String }],
  title : String,
});
export default mongoose.models.Chat || mongoose.model('Chat', chatSchema);

