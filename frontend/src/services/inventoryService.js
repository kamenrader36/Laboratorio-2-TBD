const API_URL = "http://localhost:8090/api/inventory";

const extractErrorMessage = (text, fallback) => {
  if (!text) return fallback;

  const trimmed = text.trim();

  try {
    const parsed = JSON.parse(trimmed);

    if (typeof parsed === "string" && parsed.trim()) {
      return parsed;
    }

    if (parsed?.message && typeof parsed.message === "string") {
      return parsed.message;
    }

    if (parsed?.error && typeof parsed.error === "string") {
      return parsed.error;
    }
  } catch {
    return trimmed;
  }

  return fallback;
};

export const getInventoryByWarehouse = async (idWarehouse, token) => {
  const response = await fetch(`${API_URL}/warehouse/${idWarehouse}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(text, "No se pudo cargar el inventario de la sucursal.")
    );
  }

  return text ? JSON.parse(text) : [];
};

export const updateWarehouseInventory = async (idInventory, payload, token) => {
  const response = await fetch(`${API_URL}/${idInventory}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(text, "No se pudo actualizar la cantidad del producto.")
    );
  }

  return text;
};

export const deleteWarehouseInventory = async (idInventory, token) => {
  const response = await fetch(`${API_URL}/${idInventory}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(text, "No se pudo eliminar el producto de la sucursal.")
    );
  }

  return text;
};