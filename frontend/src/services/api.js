import axios from "axios";

const API_URL = "http://13.60.241.5:3001" || "http://localhost:3001";

export const registerUser = async (email, passwordHash, fingerprintHash) => {
  return axios.post(`${API_URL}/register-init`, { email, passwordHash, fingerprintHash });
};

export const verifyOTP = async (email, otp) => {
  return axios.post(`${API_URL}/register-verify`, { email, otp });
};

export const loginUser = async (email, passwordHash, fingerprintHash) => {
  return axios.post(`${API_URL}/login`, { email, passwordHash, fingerprintHash });
};

export const requestOTP = async (email) => {
  return axios.post(`${API_URL}/request-otp`, { email });
};