import Cookies from "js-cookie";
import axiosInstance from "../lib/axios";

export const newAppointment = async (formId: any, date: any) => {
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

export const editClientAppointmentAsDoctor = async (form: any) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.post("/api/appointments/doctor", form);
  return response.data;
};

export const editClientAppointmentAsMarketer = async (form: any) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }
  const response = await axiosInstance.post("/api/appointments/marketer", form);
  return response.data;
};

export const seeAllAppointments = async (doctor: boolean, marketer: boolean) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  let response;

  if (doctor) {
    response = await axiosInstance.get("/api/appointments/doctor", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else if (marketer) {
    response = await axiosInstance.get("/api/appointments/marketer", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return response?.data;
};

export const confirmAppointment = async (formId: string) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  let response;
  response = await axiosInstance.post(`/api/forms/${formId}/accept`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("response", response);
  return response?.data;
};

export const createDoctorAppointment = async (form: any) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  let response;
  response = await axiosInstance.post(`/api/appointments/doctor`, form);

  console.log("response", response);
  return response?.data;
};

export const createMarketerAppointment = async (form: any) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  let response;
  response = await axiosInstance.post(`/api/appointments/marketer`, form);

  console.log("response", response);
  return response?.data;
};

export const clientAppointments = async () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  let response;

  response = await axiosInstance.get("/api/appointments/doctor", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response?.data;
};

export const marketerClientAppointments = async () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token is required");
  }

  let response;

  response = await axiosInstance.get("/api/appointments/marketer", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response?.data;
};
