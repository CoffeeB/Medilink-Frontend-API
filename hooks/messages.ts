import Cookies from "js-cookie";
import axiosInstance from "../lib/axios";

export const messageContacts = async () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.get("/api/auth/messaging", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const activeMessages = async () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.get("/api/conversations", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const contactMessage = async (recipientId: any) => {
  if (!recipientId) {
    throw new Error("Conversation ID is required");
  }
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.post(
    `/api/conversations`,
    { recipientId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const usersList = async () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.get("/api/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const sendMessage = async (conversationId: string, text: string) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  const response = await axiosInstance.post(
    "/api/conversations",
    {
      conversationId,
      text,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
