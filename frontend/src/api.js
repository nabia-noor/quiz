const API_URL = "http://localhost:4000/api";

// Get token from localStorage
const getAdminToken = () => localStorage.getItem("adminToken");
const getUserToken = () => localStorage.getItem("userToken");
const getTeacherToken = () => localStorage.getItem("teacherToken");

// Get the appropriate auth token based on who is logged in
const getAuthToken = () => {
  const adminToken = getAdminToken();
  const teacherToken = getTeacherToken();
  const userToken = getUserToken();
  
  return adminToken || teacherToken || userToken;
};
// Subject API (Admin)
export const subjectAPI = {
  create: async (data) => {
    const response = await fetch(`${API_URL}/subject`, {
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
    const response = await fetch(`${API_URL}/subject`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },
  search: async (q) => {
    const url = q ? `${API_URL}/subject/search?q=${encodeURIComponent(q)}` : `${API_URL}/subject/search`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/subject/${id}`, {
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
    const response = await fetch(`${API_URL}/subject/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },
};

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
        Authorization: `Bearer ${getAuthToken()}`,
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
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getByQuiz: async (quizId) => {
    const response = await fetch(`${API_URL}/question/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/question/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/question/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/question/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
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
    const response = await fetch(`${API_URL}/result/admin/${id}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  review: async (id, data) => {
    const response = await fetch(`${API_URL}/result/${id}/review`, {
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

// Teacher Auth API
export const teacherAPI = {
  login: async (data) => {
    const response = await fetch(`${API_URL}/teacher/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/teacher/profile`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  logout: () => {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherEmail");
  },

  // Admin operations
  create: async (data) => {
    const response = await fetch(`${API_URL}/teacher`, {
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
    const response = await fetch(`${API_URL}/teacher`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/teacher/${id}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/teacher/${id}`, {
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
    const response = await fetch(`${API_URL}/teacher/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  assignCourses: async (teacherId, assignments) => {
    const response = await fetch(`${API_URL}/teacher/${teacherId}/assign-courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify({ assignments }),
    });
    return response.json();
  },

  // Admin: Get assignments for a specific teacher
  getAssignmentsForTeacherAdmin: async (teacherId) => {
    const response = await fetch(`${API_URL}/teacher/${teacherId}/assigned-courses`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    return response.json();
  },

  getAssignedCourses: async () => {
    const response = await fetch(`${API_URL}/teacher/assigned-courses`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  getAssignedBatches: async () => {
    const response = await fetch(`${API_URL}/teacher/batches`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  getCoursesForBatch: async (classId) => {
    const response = await fetch(`${API_URL}/teacher/courses/${classId}`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  // Teacher: get subjects assigned for a specific batch
  getSubjectsForBatch: async (classId) => {
    const response = await fetch(`${API_URL}/teacher/subjects/${classId}`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },
};

// Teacher Quiz API
export const teacherQuizAPI = {
  create: async (data) => {
    const response = await fetch(`${API_URL}/quiz/teacher/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getTeacherToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/quiz/teacher/my-quizzes`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  getByClass: async (classId) => {
    const response = await fetch(`${API_URL}/quiz/teacher/class/${classId}`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/quiz/teacher/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getTeacherToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/quiz/teacher/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/quiz/teacher/${id}`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  getQuestions: async (quizId) => {
    const response = await fetch(`${API_URL}/question/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },
};

// Teacher Result API
export const teacherResultAPI = {
  getQuizAttempts: async (quizId) => {
    const response = await fetch(`${API_URL}/result/teacher/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  getAttemptDetails: async (resultId) => {
    const response = await fetch(`${API_URL}/result/teacher/attempt/${resultId}`, {
      headers: { Authorization: `Bearer ${getTeacherToken()}` },
    });
    return response.json();
  },

  markQuiz: async (resultId, data) => {
    const response = await fetch(`${API_URL}/result/teacher/${resultId}/mark`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getTeacherToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  publishResult: async (resultId) => {
    const response = await fetch(`${API_URL}/result/teacher/${resultId}/publish`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getTeacherToken()}`,
      },
      body: JSON.stringify({}),
    });
    return response.json();
  },
};
