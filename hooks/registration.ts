import axiosInstance from "../lib/axios";
import { User } from "./auth";
import Cookies from "js-cookie";

export type SignupResponse = {
  message: string;
  user?: User;
  token?: string;
};

export const registerDoctor = async (data: any): Promise<SignupResponse> => {
  console.log(data);
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  try {
    const response = await axiosInstance.post("/api/users", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Signup failed");
  }
};
