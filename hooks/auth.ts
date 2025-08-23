import { z } from "zod";
import Cookies from "js-cookie";
import axiosInstance from "../lib/axios";

// ✅ Zod validation schema for login form
export const loginFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
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

// ✅ Since axiosInstance already has `/api` baseURL, keep API_URL relative
const API_URL = "/auth";

// ✅ Login
export const login = async (data: LoginFormValues): Promise<LoginResponse> => {
  const response = await axiosInstance.post(`${API_URL}/login`, data);

  const { user, token } = response.data;

  Cookies.set("token", token, {
    secure: true,
    sameSite: "strict",
    expires: 7,
  });

  Cookies.set("user", JSON.stringify(user), {
    secure: true,
    sameSite: "strict",
    expires: 7,
  });

  return response.data;
};

// ✅ Logout
export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
};

// ✅ Get stored user
export const getStoredUser = (): User | null => {
  const userStr = Cookies.get("user");
  return userStr ? JSON.parse(userStr) : null;
};

// ✅ Check authentication
export const isAuthenticated = (): boolean => {
  return !!Cookies.get("token");
};

// ✅ Role check (doctor lowercase)
export const isDoctor = (): boolean => {
  const user = getStoredUser();
  return user?.role?.toLowerCase() === "doctor";
};

// ✅ Forgot password
export const sendForgotPassword = async (data: {
  email: string;
}): Promise<{ message: string }> => {
  const response = await axiosInstance.post(
    `${API_URL}/forgot-password`,
    { email: data.email }
  );
  return response.data;
};

// ✅ Reset password
export const sendResetPassword = async (data: {
  password: string;
  token: string;
}): Promise<{ message: string }> => {
  const response = await axiosInstance.post(
    `${API_URL}/reset-password`,
    { password: data.password, token: data.token }
  );
  return response.data;
};
