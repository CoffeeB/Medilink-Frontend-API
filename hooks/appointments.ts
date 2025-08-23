import Cookies from "js-cookie";
import axiosInstance from "../lib/axios";

export const requestAppointment = async (formId: any, date: any) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.post("/api/appointments", {
    formId,
    date,
  });
  return response.data;
};

export const seeAllAppointments = async () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  const response = await axiosInstance.get("/api/appointments", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
