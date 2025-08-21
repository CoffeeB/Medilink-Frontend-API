import Cookies from 'js-cookie';
import axiosInstance from '../lib/axios';

export const messages = async () => {
  const token = Cookies.get('token');
  if (!token) {
    throw new Error('Token is required');
  }
  const response = await axiosInstance.get('/api/conversations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const message = async (conversationId: string | null) => {
  if (!conversationId) {
    throw new Error('Conversation ID is required');
  }
  const token = Cookies.get('token');
  if (!token) {
    throw new Error('Token is required');
  }
  const response = await axiosInstance.get(`/api/message/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
