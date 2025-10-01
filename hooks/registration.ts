import axiosInstance from "../lib/axios";
import { User } from "./auth";
import Cookies from "js-cookie";

export type SignupResponse = {
  message: string;
  user?: User;
  token?: string;
};

export const registerDoctor = async (data: any): Promise<SignupResponse> => {
  console.log("registration data", data);
  try {
    const response = await axiosInstance.post("/api/users", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Signup failed");
  }
};
