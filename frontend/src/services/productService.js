const API_URL = "http://localhost:8090/api/products";

const extractErrorMessage = (text, fallback) => {
  if (!text) return fallback;
  const trimmed = text.trim();

  try {
    const parsed = JSON.parse(trimmed);

    if (typeof parsed === "string" && parsed.trim()) return parsed;
    if (parsed?.message && typeof parsed.message === "string") return parsed.message;
    if (parsed?.error && typeof parsed.error === "string") return parsed.error;
  } catch {
    return trimmed;
  }

  return fallback;
};

const request = async (url, options, fallback) => {
  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(extractErrorMessage(text, fallback));
  }

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const getMyProducts = async (token) => {
  return request(`${API_URL}/my-products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, "No se pudieron cargar tus productos.");
};

export const getCategories = async (token) => {
  return request(`${API_URL}/categories`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, "No se pudieron cargar las categorías.");
};

export const createCategory = async (payload, token) => {
  return request(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "No se pudo crear la categoría.");
};

export const createProductWithInventory = async (payload, token) => {
  return request(`${API_URL}/create-with-inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "No se pudo crear el producto.");
};

export const updateProduct = async (idProduct, payload, token) => {
  return request(`${API_URL}/${idProduct}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }, "No se pudo actualizar el producto.");
};

export const deleteProduct = async (idProduct, token) => {
  return request(`${API_URL}/${idProduct}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, "No se pudo eliminar el producto.");
};