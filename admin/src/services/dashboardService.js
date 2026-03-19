import axios from "axios";
import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL + "/api/dashboard";

const getDashboardStats = async (token) => {
  const response = await axios.get(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getAnalytics = async (token, period = "6months") => {
  const response = await axios.get(`${API_URL}/analytics`, {
    params: { period },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getQuickStats = async (token) => {
  const response = await axios.get(`${API_URL}/quick-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const dashboardService = {
  getDashboardStats,
  getAnalytics,
  getQuickStats,
};

export default dashboardService;
