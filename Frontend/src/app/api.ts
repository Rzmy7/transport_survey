export type SurveyPayload = {
  busType: string;
  route: string;
  demographic: string;
  seatType: string;
  hasPainPoints: boolean | null;
  painPoints: string[];
  sleepComfort: string;
};

export type Analytics = {
  total: number;
  busType: Array<{ name: string; value: number }>;
  demographic: Array<{ name: string; value: number }>;
  seatType: Array<{ name: string; value: number }>;
  sleepComfort: Array<{ name: string; value: number }>;
  topPains: Array<{ name: string; value: number }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const ADMIN_TOKEN_KEY = "pces_admin_token";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data as T;
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function submitSurvey(payload: SurveyPayload) {
  return request<{ message: string; id: number }>("/survey-responses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminLogin(email: string, password: string) {
  return request<{ token: string; admin: { email: string; name: string } }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchAdminAnalytics(token: string) {
  return request<Analytics>("/admin/analytics", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function adminLogout(token: string) {
  return request<{ message: string }>("/admin/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function downloadAdminCsv(token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/survey-responses/export`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to export survey responses.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PCES_Survey_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function deleteAllSurveyResponses(token: string) {
  return request<{ message: string; deleted: number }>("/admin/survey-responses", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
