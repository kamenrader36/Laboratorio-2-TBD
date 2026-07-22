import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
} from "@mui/material";
import {
  AddOutlined as AddIcon,
  Inventory2Outlined as InventoryIcon,
  DeleteOutlineOutlined as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import BuyerProductCard from "./BuyerProductCard";
import {
  getMyProducts,
  getCategories,
  createProductWithInventory,
  updateProduct,
  deleteProduct,
} from "../../services/productService";
import { getMyWarehouses } from "../../services/warehouseService";

const initialForm = {
  productName: "",
  productDescription: "",
  productPrice: "",
  skuProduct: "",
  idCategory: "",
  createCategory: false,
  newCategory: {
    categoryName: "",
    categoryDescription: "",
    isHazardous: false,
  },
  warehouseStocks: [{ idWarehouse: "", quantity: "" }],
};

const BuyerProducts = () => {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const [feedback, setFeedback] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const showFeedback = (severity, message) => {
    setFeedback({
      open: true,
      severity,
      message,
    });
  };

  const handleCloseFeedback = (_, reason) => {
    if (reason === "clickaway") return;
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [productsData, categoriesData, warehousesData] = await Promise.all([
        getMyProducts(token),
        getCategories(token),
        getMyWarehouses(token),
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const warehouseOptions = useMemo(
    () => (Array.isArray(warehouses) ? warehouses : []),
    [warehouses]
  );

  const resetForm = () => {
    setForm(initialForm);
    setSelectedProduct(null);
    setFormError("");
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setSelectedProduct(product);
    setForm({
      productName: product.productName || "",
      productDescription: product.productDescription || "",
      productPrice: product.productPrice ?? "",
      skuProduct: product.skuProduct ?? "",
      idCategory: product.idCategory ?? "",
      createCategory: false,
      newCategory: {
        categoryName: "",
        categoryDescription: "",
        isHazardous: false,
      },
      warehouseStocks:
        product.inventories?.length > 0
          ? product.inventories.map((item) => ({
              idWarehouse: item.idWarehouse,
              quantity: item.quantity,
            }))
          : [{ idWarehouse: "", quantity: "" }],
    });
    setFormError("");
    setDialogOpen(true);
  };

  const openDeleteDialog = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const addWarehouseRow = () => {
    setForm((prev) => ({
      ...prev,
      warehouseStocks: [...prev.warehouseStocks, { idWarehouse: "", quantity: "" }],
    }));
  };

  const removeWarehouseRow = (index) => {
    setForm((prev) => {
      if (prev.warehouseStocks.length === 1) {
        return {
          ...prev,
          warehouseStocks: [{ idWarehouse: "", quantity: "" }],
        };
      }

      return {
        ...prev,
        warehouseStocks: prev.warehouseStocks.filter((_, i) => i !== index),
      };
    });
  };

  const updateWarehouseRow = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.warehouseStocks];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return {
        ...prev,
        warehouseStocks: updated,
      };
    });
  };

  const validateForm = () => {
    if (!form.productName.trim()) return "Completa el nombre del producto.";
    if (!form.productDescription.trim()) return "Completa la descripción del producto.";
    if (!form.productPrice || Number(form.productPrice) <= 0) {
      return "El precio debe ser mayor a 0.";
    }
    if (!form.skuProduct || Number(form.skuProduct) <= 0) {
      return "Ingresa un SKU válido.";
    }

    if (form.createCategory) {
      if (!form.newCategory.categoryName.trim()) {
        return "Completa el nombre de la nueva categoría.";
      }
      if (!form.newCategory.categoryDescription.trim()) {
        return "Completa la descripción de la nueva categoría.";
      }
    } else if (!form.idCategory) {
      return "Selecciona una categoría.";
    }

    if (!form.warehouseStocks.length) {
      return "Debes asignar el producto a al menos una sucursal.";
    }

    const selectedWarehouses = new Set();
    let positiveStock = false;

    for (const item of form.warehouseStocks) {
      if (!item.idWarehouse) return "Selecciona una sucursal en cada fila.";

      if (selectedWarehouses.has(item.idWarehouse)) {
        return "No puedes repetir sucursales.";
      }
      selectedWarehouses.add(item.idWarehouse);

      const quantity = Number(item.quantity);
      if (Number.isNaN(quantity) || quantity < 0) {
        return "La cantidad debe ser mayor o igual a 0.";
      }

      if (quantity > 0) {
        positiveStock = true;
      }
    }

    if (!positiveStock) {
      return "Debes ingresar stock mayor a 0 en al menos una sucursal.";
    }

    return "";
  };

  const buildPayload = () => ({
    productName: form.productName.trim(),
    productDescription: form.productDescription.trim(),
    productPrice: Number(form.productPrice),
    skuProduct: Number(form.skuProduct),
    idCategory: form.createCategory ? null : Number(form.idCategory),
    createCategory: form.createCategory,
    newCategory: form.createCategory
      ? {
          categoryName: form.newCategory.categoryName.trim(),
          categoryDescription: form.newCategory.categoryDescription.trim(),
          isHazardous: !!form.newCategory.isHazardous,
        }
      : null,
    warehouseStocks: form.warehouseStocks.map((item) => ({
      idWarehouse: Number(item.idWarehouse),
      quantity: Number(item.quantity || 0),
    })),
  });

  const handleSave = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = buildPayload();

      if (selectedProduct) {
        const message = await updateProduct(selectedProduct.idProduct, payload, token);
        showFeedback("success", message || "Producto actualizado correctamente.");
      } else {
        const message = await createProductWithInventory(payload, token);
        showFeedback("success", message || "Producto creado correctamente.");
      }

      setDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (err) {
      setFormError(err.message || "No se pudo guardar el producto.");
      showFeedback("error", err.message || "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setSaving(true);

    try {
      const message = await deleteProduct(selectedProduct.idProduct, token);
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      await fetchData();
      showFeedback("success", message || "Producto eliminado correctamente.");
    } catch (err) {
      showFeedback("error", err.message || "No se pudo eliminar el producto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#1565C0" }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography fontWeight={700} fontSize="1rem" color="#111827">
            Mis productos
          </Typography>
          <Typography fontSize="0.85rem" color="text.secondary">
            Administra tus publicaciones, categorías y stock por sucursal.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          disabled={!warehouseOptions.length}
          sx={{
            bgcolor: "#1565C0",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { bgcolor: "#0D47A1", boxShadow: "none" },
          }}
        >
          Agregar producto
        </Button>
      </Box>

      {!warehouseOptions.length && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Debes tener al menos una sucursal creada para publicar productos.
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {products.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #E3E8F0",
              borderRadius: 2.5,
              p: 4,
              textAlign: "center",
            }}
          >
            <InventoryIcon sx={{ fontSize: 46, color: "#CBD5E1", mb: 1.5 }} />
            <Typography fontWeight={700} color="#374151" mb={0.5}>
              No tienes productos publicados
            </Typography>
            <Typography fontSize="0.875rem" color="text.secondary">
              Crea productos y distribuye su stock en una o más sucursales.
            </Typography>
          </Paper>
        ) : (
          products.map((product) => (
            <BuyerProductCard
              key={product.idProduct}
              product={product}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))
        )}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle fontWeight={700}>
          {selectedProduct ? "Editar producto" : "Agregar producto"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {formError && <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="Nombre del producto"
              value={form.productName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, productName: e.target.value }))
              }
              fullWidth
              size="small"
              inputProps={{ maxLength: 25 }}
            />

            <TextField
              label="SKU"
              type="number"
              value={form.skuProduct}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, skuProduct: e.target.value }))
              }
              fullWidth
              size="small"
            />

            <TextField
              label="Precio"
              type="number"
              value={form.productPrice}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, productPrice: e.target.value }))
              }
              fullWidth
              size="small"
            />

            <FormControl fullWidth size="small" disabled={form.createCategory}>
              <InputLabel>Categoría existente</InputLabel>
              <Select
                label="Categoría existente"
                value={form.idCategory}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, idCategory: e.target.value }))
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category.idCategory} value={category.idCategory}>
                    {category.categoryName}
                    {category.isHazardous ? " - Química" : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Descripción"
            value={form.productDescription}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, productDescription: e.target.value }))
            }
            fullWidth
            size="small"
            multiline
            minRows={3}
            inputProps={{ maxLength: 150 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={form.createCategory}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    createCategory: e.target.checked,
                  }))
                }
              />
            }
            label="Crear nueva categoría"
          />

          {form.createCategory && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Nombre de categoría"
                value={form.newCategory.categoryName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    newCategory: {
                      ...prev.newCategory,
                      categoryName: e.target.value,
                    },
                  }))
                }
                fullWidth
                size="small"
                inputProps={{ maxLength: 20 }}
              />

              <TextField
                label="Descripción de categoría"
                value={form.newCategory.categoryDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    newCategory: {
                      ...prev.newCategory,
                      categoryDescription: e.target.value,
                    },
                  }))
                }
                fullWidth
                size="small"
                inputProps={{ maxLength: 150 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.newCategory.isHazardous}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        newCategory: {
                          ...prev.newCategory,
                          isHazardous: e.target.checked,
                        },
                      }))
                    }
                  />
                }
                label="Es categoría química/peligrosa"
              />
            </Box>
          )}

          <Divider />

          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <Box>
                <Typography fontSize="0.9rem" fontWeight={700} color="#111827">
                  Stock por sucursal
                </Typography>
                <Typography fontSize="0.82rem" color="text.secondary">
                  Selecciona una o más sucursales e ingresa la cantidad.
                </Typography>
              </Box>

              <Button
                onClick={addWarehouseRow}
                startIcon={<AddIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: "#1565C0",
                }}
              >
                Agregar fila
              </Button>
            </Box>

            <Stack spacing={1.25}>
              {form.warehouseStocks.map((item, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#FAFBFC",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr auto" },
                      gap: 1.25,
                      alignItems: "center",
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel>Sucursal</InputLabel>
                      <Select
                        label="Sucursal"
                        value={item.idWarehouse}
                        onChange={(e) =>
                          updateWarehouseRow(index, "idWarehouse", e.target.value)
                        }
                      >
                        {warehouseOptions.map((warehouse) => (
                          <MenuItem
                            key={warehouse.idWarehouse}
                            value={warehouse.idWarehouse}
                          >
                            {warehouse.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Cantidad"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateWarehouseRow(index, "quantity", e.target.value)
                      }
                      fullWidth
                      size="small"
                      inputProps={{ min: 0 }}
                    />

                    <IconButton
                      onClick={() => removeWarehouseRow(index)}
                      sx={{ color: "#E53935" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: "#1565C0",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: "#0D47A1", boxShadow: "none" },
            }}
          >
            {saving ? (
              <CircularProgress size={18} sx={{ color: "white" }} />
            ) : selectedProduct ? (
              "Guardar cambios"
            ) : (
              "Guardar producto"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !saving && setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle fontWeight={700}>Eliminar producto</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography fontSize="0.9rem" color="text.secondary">
            ¿Estás segura de que deseas eliminar este producto?
          </Typography>

          {selectedProduct && (
            <Typography sx={{ mt: 1 }} fontWeight={700} color="#111827">
              {selectedProduct.productName}
            </Typography>
          )}

          <Typography sx={{ mt: 1 }} fontSize="0.82rem" color="#6B7280">
            También se eliminarán sus relaciones de stock por sucursal.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={saving}
            sx={{
              bgcolor: "#E53935",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: "#C62828", boxShadow: "none" },
            }}
          >
            {saving ? (
              <CircularProgress size={18} sx={{ color: "white" }} />
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BuyerProducts;