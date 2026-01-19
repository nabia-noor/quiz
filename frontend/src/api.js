const API_URL = "http://localhost:4000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem("token");
const getAdminToken = () => localStorage.getItem("adminToken");
const getUserToken = () => localStorage.getItem("userToken");

// Admin Auth API
export const adminAPI = {
  register: async (data) => {
    const response = await fetch(`${API_URL}/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (data) => {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/admin/profile`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },
};

// Class API
export const classAPI = {
  create: async (data) => {
    const response = await fetch(`${API_URL}/class`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/class`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/class/${id}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/class/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/class/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },
};

// Quiz API
export const quizAPI = {
  create: async (data) => {
    const response = await fetch(`${API_URL}/quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/quiz`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/quiz/${id}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  getByClass: async (classId) => {
    const response = await fetch(`${API_URL}/quiz/class/${classId}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/quiz/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/quiz/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },
};

// Question API
export const questionAPI = {
  create: async (data) => {
    const response = await fetch(`${API_URL}/question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  bulkCreate: async (data) => {
    const response = await fetch(`${API_URL}/question/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getByQuiz: async (quizId) => {
    const response = await fetch(`${API_URL}/question/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/question/${id}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/question/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/question/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },
};

// Result API
export const resultAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/result`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  getByQuiz: async (quizId) => {
    const response = await fetch(`${API_URL}/result/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/result/${id}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/result/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },
};

// User Auth API
export const userAPI = {
  register: async (data) => {
    const response = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (data) => {
    const response = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  logout: () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    });
    return response.json();
  },
};

// User Quiz API
export const userQuizAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/quiz/all`, {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    });
    return response.json();
  },

  getById: async (quizId) => {
    const response = await fetch(`${API_URL}/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    });
    return response.json();
  },

  getQuestions: async (quizId) => {
    const response = await fetch(`${API_URL}/question/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    });
    return response.json();
  },
};

// User Result API
export const userResultAPI = {
  submit: async (data) => {
    const response = await fetch(`${API_URL}/result/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getUserToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getUserResults: async (userId) => {
    const response = await fetch(`${API_URL}/result/user/${userId}`, {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    });
    return response.json();
  },

  getUserStats: async (userId) => {
    const response = await fetch(`${API_URL}/result/user-stats/${userId}`, {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    });
    return response.json();
  },

  getResultById: async (resultId) => {
    const response = await fetch(`${API_URL}/result/${resultId}`, {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    });
    return response.json();
  },
};
