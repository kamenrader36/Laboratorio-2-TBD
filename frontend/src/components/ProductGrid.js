import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, Button, CircularProgress } from "@mui/material";
import { TrendingUp as TrendingUpIcon, ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import ProductCard from "./ProductCard";

const ProductGrid = ({ selectedCategoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Construimos la URL base
    let url = "http://localhost:8090/api/products";
    
    // Si viene una categoría seleccionada desde el padre/sidebar
    if (selectedCategoryId) {
      url += `?id_category=${selectedCategoryId}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar los productos desde el servidor");
        }
        return res.json();
      })
      .then((data) => {
        // Mapeamos alineando los atributos en camelCase de la entidad JPA
        const mappedProducts = data.map((prod) => ({
          ...prod, // Preservamos los atributos originales

          // Sobrescribimos/Mapeamos con las claves esperadas por ProductCard
          id: prod.idProduct,
          name: prod.productName,
          description: prod.productDescription,
          price: prod.productPrice ?? 0,
          category: prod.category?.categoryName || "General",
          minOrder: 1,
          rating: 4.5,
          reviews: 10,
          verified: true,
          badge: (prod.stock ?? 0) > 0 ? null : "Agotado",
          badgeColor: (prod.stock ?? 0) > 0 ? null : "#E53935",
          image: `https://picsum.photos/seed/${prod.skuProduct || prod.idProduct}/400/300`,
        }));

        setProducts(mappedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error en la petición:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedCategoryId]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUpIcon sx={{ color: "#1565C0", fontSize: 22 }} />
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem", color: "#111827" }}>
            {selectedCategoryId ? "Productos Filtrados" : "Productos Destacados"}
          </Typography>
        </Box>
        <Button
          endIcon={<ArrowForwardIcon sx={{ fontSize: "0.9rem !important" }} />}
          sx={{
            textTransform: "none",
            fontSize: "0.8rem",
            color: "#1565C0",
            fontWeight: 600,
            "&:hover": { bgcolor: "rgba(21,101,192,0.06)" },
          }}
        >
          Ver todos
        </Button>
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: "#E3E8F0" }} />

      {/* Indicador de Carga */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Mensaje de Error */}
      {error && (
        <Typography color="error" textAlign="center" sx={{ py: 3 }}>
          No se pudieron cargar los productos. Asegúrate de que el Backend esté corriendo en el puerto 8090.
        </Typography>
      )}

      {/* Mensaje sin productos */}
      {!loading && !error && products.length === 0 && (
        <Typography textAlign="center" sx={{ py: 3, color: "text.secondary" }}>
          No se encontraron productos disponibles para esta categoría.
        </Typography>
      )}

      {/* Grid de Productos */}
      {!loading && !error && products.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductGrid;