const API_URL = "http://localhost:8090/api/store";

export const getMyWarehouses = async (token) => {
  const response = await fetch(`${API_URL}/my-warehouses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Error ${response.status}: No se pudieron cargar las sucursales.`);
  }

  return text ? JSON.parse(text) : [];
};

export const createWarehouse = async (payload, token) => {
  const response = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Error ${response.status}: No se pudo registrar la sucursal.`);
  }

  return text;
};