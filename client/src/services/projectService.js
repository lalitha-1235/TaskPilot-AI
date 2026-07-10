import api from "./api";

/**
 * Fetch all projects for the logged-in user.
 * Supports optional query params: status, priority
 */
export const getProjects = async (params = {}) => {
  const response = await api.get("/projects", { params });
  return response.data;
};

/**
 * Fetch a single project by ID.
 */
export const getProject = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

/**
 * Create a new project.
 */
export const createProject = async (projectData) => {
  const response = await api.post("/projects", projectData);
  return response.data;
};

/**
 * Update an existing project by ID.
 */
export const updateProject = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

/**
 * Delete a project by ID.
 */
export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};
