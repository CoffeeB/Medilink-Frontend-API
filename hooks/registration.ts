import axiosInstance from "../lib/axios";
import { User } from "./auth";

export type SignupResponse = {
  message: string;
  user?: User;
  token?: string;
};

export const signup = async (data: FormData): Promise<SignupResponse> => {
  console.log(data);

  try {
    const response = await axiosInstance.post("/api/auth/signup", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Signup failed");
  }
};
