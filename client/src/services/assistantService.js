import api from "./api";

// @desc  Fetch user chat history with assistant
export const getChatHistory = async () => {
  const response = await api.get("/assistant/history");
  return response.data;
};

// @desc  Send message and get AI response
// @param {string} prompt - User chat prompt
export const sendChatMessage = async (prompt) => {
  const response = await api.post("/assistant/chat", { prompt });
  return response.data;
};

// @desc  Clear assistant chat history
export const clearChatHistory = async () => {
  const response = await api.delete("/assistant/chat");
  return response.data;
};
