import api from "./api";

// ─── Team Member CRUD (matches /api/team-members) ────────────────────────────

export const getTeamMembers = async () => {
  const response = await api.get("/team-members");
  return response.data;
};

export const getTeamMember = async (id) => {
  const response = await api.get(`/team-members/${id}`);
  return response.data;
};

export const createTeamMember = async (memberData) => {
  const response = await api.post("/team-members", memberData);
  return response.data;
};

export const updateTeamMember = async (id, memberData) => {
  const response = await api.put(`/team-members/${id}`, memberData);
  return response.data;
};

export const deleteTeamMember = async (id) => {
  const response = await api.delete(`/team-members/${id}`);
  return response.data;
};