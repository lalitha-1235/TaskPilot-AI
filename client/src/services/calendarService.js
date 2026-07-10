import api from "./api";

// @desc  Fetch all calendar events (tasks, projects, custom) for the logged-in user
// @param {string} [start] - Optional ISO date string "YYYY-MM-DD" range start
// @param {string} [end]   - Optional ISO date string "YYYY-MM-DD" range end
export const getCalendarEvents = async (start, end) => {
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;
  const response = await api.get("/calendar/events", { params });
  return response.data;
};

// @desc  Create a custom calendar event
export const createCalendarEvent = async (eventData) => {
  const response = await api.post("/calendar/events", eventData);
  return response.data;
};

// @desc  Update a custom calendar event by ID
export const updateCalendarEvent = async (id, eventData) => {
  const response = await api.put(`/calendar/events/${id}`, eventData);
  return response.data;
};

// @desc  Delete a custom calendar event by ID
export const deleteCalendarEvent = async (id) => {
  const response = await api.delete(`/calendar/events/${id}`);
  return response.data;
};
