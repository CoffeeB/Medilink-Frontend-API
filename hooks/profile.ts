import Cookies from "js-cookie";
import axiosInstance from "../lib/axios";

export const getProfile = async () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export async function updateProfile(data: any) {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  const res = await axiosInstance.patch("/api/auth/profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export const getProfileById = async (id: any) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.get(`/api/auth/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
