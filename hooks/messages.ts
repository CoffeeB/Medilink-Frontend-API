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

export const storePeerId = async (peerId: any) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.post(
    `/api/call/peer`,
    { peerId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const fetchPeerId = async (recipientId: any) => {
  if (!recipientId) {
    throw new Error("Recipient ID is required");
  }
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.get(`/api/call/peer/${recipientId}`);
  return response.data;
};

export const contactMessageHistory = async (conversationId: any) => {
  if (!conversationId) {
    throw new Error("Conversation ID is required");
  }
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.get(`/api/messages/${conversationId}`);
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

export const sendMessage = async (conversationId: string, text: string, type: string, url: string) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  const response = await axiosInstance.post(
    "/api/messages",
    {
      conversationId,
      text,
      type,
      url,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteMessage = async (id: any) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  const response = await axiosInstance.delete(
    `/api/messages/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
