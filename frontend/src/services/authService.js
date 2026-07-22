const API_URL = "http://localhost:8090/api/auth";

export const loginUser = async ({ identifier, password }) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.text();

  if (!response.ok) {
    throw new Error(data || "Usuario o contraseña incorrectos.");
  }

  return data;
};