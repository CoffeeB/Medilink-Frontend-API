import { email, z } from "zod";
import Cookies from "js-cookie";
import axiosInstance from "../lib/axios";

export const loginFormSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export const login = async (data: LoginFormValues): Promise<LoginResponse> => {
  const response = await axiosInstance.post("/api/auth/login", {
    email: data.email,
    password: data.password,
  });
  const { token } = response.data;

  Cookies.set("token", token, {
    secure: true,
    sameSite: "strict",
    expires: 7,
  });

  const userResponse = await axiosInstance.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const user = userResponse.data;

  Cookies.set("user", JSON.stringify({ id: user._id, email: user.email, role: user.role }), {
    secure: true,
    sameSite: "strict",
    expires: 7,
  });

  return { user, token };
};

export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
};

export const getStoredUser = (): User | null => {
  const userStr = Cookies.get("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!Cookies.get("token");
};

export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role === "ADMIN";
};

export const sendForgotPassword = async (data: { email: string }): Promise<{ message: string }> => {
  const response = await axiosInstance.post("/api/auth/forgot-password", {
    email: data.email,
  });
  return response.data;
};

export const sendResetPassword = async (data: { password: string; token: string }): Promise<{ message: string }> => {
  const response = await axiosInstance.post("/api/auth/reset-password", {
    password: data.password,
    token: data.token,
  });
  return response.data;
};

export const marketerSignUp = async (data: any) => {
  const response = await axiosInstance.post("/api/auth/signup", data);
  return response.data;
};
