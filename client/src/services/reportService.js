import api from "./api";

// @desc  Get reports summary and MongoDB analytics metrics
export const getReportsSummary = async () => {
  const response = await api.get("/reports/summary");
  return response.data;
};
