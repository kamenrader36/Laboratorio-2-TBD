import React, { useEffect, useState } from "react";
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
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import {
  StoreOutlined as StoreIcon,
  AddOutlined as AddIcon,
  LocationOnOutlined as LocationIcon,
  EditOutlined as EditIcon,
  DeleteOutlineOutlined as DeleteIcon,
  ExpandMoreOutlined as ExpandMoreIcon,
  Inventory2Outlined as InventoryIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import {
  getMyWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../../services/warehouseService";
import {
  getInventoryByWarehouse,
  updateWarehouseInventory,
  deleteWarehouseInventory,
} from "../../services/inventoryService";
import LocationPicker from "../LocationPicker";

const initialForm = {
  name: "",
  address: "",
  latitude: null,
  longitude: null,
};

const BuyerWarehouses = () => {
  const { token } = useAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [inventoryEditDialogOpen, setInventoryEditDialogOpen] = useState(false);
  const [inventoryDeleteDialogOpen, setInventoryDeleteDialogOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);

  const [inventoryEditForm, setInventoryEditForm] = useState({
    quantity: "",
  });

  const [formError, setFormError] = useState("");
  const [editError, setEditError] = useState("");
  const [inventoryEditError, setInventoryEditError] = useState("");

  const [feedback, setFeedback] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const [expandedWarehouse, setExpandedWarehouse] = useState(null);
  const [inventoryByWarehouse, setInventoryByWarehouse] = useState({});
  const [inventoryLoading, setInventoryLoading] = useState({});

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

  const fetchInventory = async (idWarehouse, silent = false) => {
    if (!silent) {
      setInventoryLoading((prev) => ({ ...prev, [idWarehouse]: true }));
    }

    try {
      const data = await getInventoryByWarehouse(idWarehouse, token);
      setInventoryByWarehouse((prev) => ({ ...prev, [idWarehouse]: data }));
      return data;
    } catch (err) {
      if (!silent) {
        showFeedback("error", err.message || "No se pudo cargar el inventario.");
      }
      return [];
    } finally {
      if (!silent) {
        setInventoryLoading((prev) => ({ ...prev, [idWarehouse]: false }));
      }
    }
  };

  const preloadInventories = async (warehouseList) => {
    if (!warehouseList.length) {
      setInventoryByWarehouse({});
      return;
    }

    const loadingMap = warehouseList.reduce((acc, warehouse) => {
      acc[warehouse.idWarehouse] = true;
      return acc;
    }, {});

    setInventoryLoading(loadingMap);

    const results = await Promise.all(
      warehouseList.map(async (warehouse) => {
        try {
          const data = await getInventoryByWarehouse(warehouse.idWarehouse, token);
          return { idWarehouse: warehouse.idWarehouse, data };
        } catch {
          return { idWarehouse: warehouse.idWarehouse, data: [] };
        }
      })
    );

    const inventoryMap = {};
    const loadedMap = {};

    results.forEach(({ idWarehouse, data }) => {
      inventoryMap[idWarehouse] = data;
      loadedMap[idWarehouse] = false;
    });

    setInventoryByWarehouse(inventoryMap);
    setInventoryLoading(loadedMap);
  };

  const fetchWarehouses = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyWarehouses(token);
      setWarehouses(data);
      await preloadInventories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWarehouses();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLocationUpdate = (coords) => {
    setForm((prev) => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
    setFormError("");
  };

  const handleEditLocationUpdate = (coords) => {
    setEditForm((prev) => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
    setEditError("");
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      setFormError("Completa el nombre y la dirección de la sucursal.");
      return;
    }

    if (form.latitude === null || form.longitude === null) {
      setFormError("Selecciona la ubicación de la sucursal en el mapa.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const message = await createWarehouse(
        {
          name: form.name.trim(),
          address: form.address.trim(),
          latitude: form.latitude,
          longitude: form.longitude,
        },
        token
      );

      setDialogOpen(false);
      setForm(initialForm);
      await fetchWarehouses();
      showFeedback("success", message || "Sucursal creada correctamente.");
    } catch (err) {
      setFormError(err.message);
      showFeedback("error", err.message || "No se pudo registrar la sucursal.");
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setEditForm({
      name: warehouse.name || "",
      address: warehouse.address || "",
      latitude: warehouse.latitude ?? null,
      longitude: warehouse.longitude ?? null,
    });
    setEditError("");
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editForm.name.trim() || !editForm.address.trim()) {
      setEditError("Completa el nombre y la dirección de la sucursal.");
      return;
    }

    if (editForm.latitude === null || editForm.longitude === null) {
      setEditError("Selecciona la ubicación de la sucursal en el mapa.");
      return;
    }

    setSaving(true);
    setEditError("");

    try {
      const message = await updateWarehouse(
        selectedWarehouse.idWarehouse,
        {
          name: editForm.name.trim(),
          address: editForm.address.trim(),
          latitude: editForm.latitude,
          longitude: editForm.longitude,
        },
        token
      );

      setEditDialogOpen(false);
      setSelectedWarehouse(null);
      await fetchWarehouses();
      showFeedback("success", message || "Sucursal actualizada correctamente.");
    } catch (err) {
      setEditError(err.message);
      showFeedback("error", err.message || "No se pudo actualizar la sucursal.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedWarehouse) return;

    setSaving(true);

    try {
      const message = await deleteWarehouse(selectedWarehouse.idWarehouse, token);
      setDeleteDialogOpen(false);
      setSelectedWarehouse(null);
      await fetchWarehouses();
      showFeedback("success", message || "Sucursal eliminada correctamente.");
    } catch (err) {
      showFeedback("error", err.message || "No se puede eliminar esta sucursal.");
    } finally {
      setSaving(false);
    }
  };

  const handleAccordionChange = async (idWarehouse, isExpanded) => {
    const nextExpanded = isExpanded ? idWarehouse : null;
    setExpandedWarehouse(nextExpanded);

    if (isExpanded && !inventoryByWarehouse[idWarehouse]) {
      await fetchInventory(idWarehouse);
    }
  };

  const openInventoryEditDialog = (item) => {
    setSelectedInventoryItem(item);
    setInventoryEditForm({
      quantity: String(item.quantity ?? 0),
    });
    setInventoryEditError("");
    setInventoryEditDialogOpen(true);
  };

  const handleInventoryEdit = async () => {
    if (inventoryEditForm.quantity === "" || Number(inventoryEditForm.quantity) < 0) {
      setInventoryEditError("La cantidad debe ser un número mayor o igual a 0.");
      return;
    }

    setSaving(true);
    setInventoryEditError("");

    try {
      const message = await updateWarehouseInventory(
        selectedInventoryItem.idInventory,
        {
          quantity: Number(inventoryEditForm.quantity),
        },
        token
      );

      setInventoryEditDialogOpen(false);
      await fetchInventory(selectedInventoryItem.idWarehouse, true);
      showFeedback("success", message || "Cantidad actualizada correctamente.");
    } catch (err) {
      setInventoryEditError(err.message);
      showFeedback("error", err.message || "No se pudo actualizar la cantidad.");
    } finally {
      setSaving(false);
    }
  };

  const openInventoryDeleteDialog = (item) => {
    setSelectedInventoryItem(item);
    setInventoryDeleteDialogOpen(true);
  };

  const handleInventoryDelete = async () => {
    if (!selectedInventoryItem) return;

    setSaving(true);

    try {
      const message = await deleteWarehouseInventory(selectedInventoryItem.idInventory, token);
      setInventoryDeleteDialogOpen(false);
      await fetchInventory(selectedInventoryItem.idWarehouse, true);
      showFeedback("success", message || "Producto eliminado de la sucursal correctamente.");
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
            Mis sucursales
          </Typography>
          <Typography fontSize="0.85rem" color="text.secondary">
            Administra las tiendas o puntos de venta asociados a tu cuenta.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            bgcolor: "#1565C0",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { bgcolor: "#0D47A1", boxShadow: "none" },
          }}
        >
          Agregar sucursal
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {warehouses.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #E3E8F0",
              borderRadius: 2.5,
              p: 4,
              textAlign: "center",
            }}
          >
            <StoreIcon sx={{ fontSize: 46, color: "#CBD5E1", mb: 1.5 }} />
            <Typography fontWeight={700} color="#374151" mb={0.5}>
              No tienes sucursales adicionales
            </Typography>
            <Typography fontSize="0.875rem" color="text.secondary">
              Tu cuenta puede agregar nuevas sucursales para operar en distintas ubicaciones.
            </Typography>
          </Paper>
        ) : (
          warehouses.map((warehouse) => {
            const inventory = inventoryByWarehouse[warehouse.idWarehouse] || [];
            const isInventoryLoading = inventoryLoading[warehouse.idWarehouse];

            return (
              <Paper
                key={warehouse.idWarehouse}
                elevation={0}
                sx={{
                  border: "1px solid #E3E8F0",
                  borderRadius: 2.5,
                  p: 2.5,
                  boxShadow: "0 2px 8px rgba(21,101,192,0.04)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1 }}>
                    <StoreIcon sx={{ color: "#1565C0", mt: 0.2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700} fontSize="0.95rem" color="#111827">
                        {warehouse.name}
                      </Typography>
                      <Typography fontSize="0.84rem" color="text.secondary" sx={{ mt: 0.35 }}>
                        {warehouse.address}
                      </Typography>

                      {warehouse.latitude != null && warehouse.longitude != null && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                          <Typography fontSize="0.76rem" color="#6B7280">
                            {warehouse.latitude}, {warehouse.longitude}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                    <Tooltip title="Editar sucursal" arrow>
                      <IconButton onClick={() => openEditDialog(warehouse)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar sucursal" arrow>
                      <IconButton onClick={() => openDeleteDialog(warehouse)} sx={{ color: "#E53935" }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Accordion
                  expanded={expandedWarehouse === warehouse.idWarehouse}
                  onChange={(_, isExpanded) => handleAccordionChange(warehouse.idWarehouse, isExpanded)}
                  elevation={0}
                  disableGutters
                  sx={{
                    mt: 2,
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px !important",
                    overflow: "hidden",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <InventoryIcon sx={{ color: "#1565C0" }} />
                      <Typography fontWeight={700} color="#1F2937">
                        Productos en sucursal
                      </Typography>

                      {isInventoryLoading ? (
                        <CircularProgress size={16} sx={{ color: "#1565C0" }} />
                      ) : (
                        <Chip
                          label={inventory.length}
                          size="small"
                          sx={{
                            bgcolor: "rgba(21,101,192,0.10)",
                            color: "#1565C0",
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ bgcolor: "#FAFBFC" }}>
                    {isInventoryLoading ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                        <CircularProgress size={24} sx={{ color: "#1565C0" }} />
                      </Box>
                    ) : inventory.length === 0 ? (
                      <Typography fontSize="0.86rem" color="text.secondary">
                        Esta sucursal no tiene productos asociados.
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                        {inventory.map((item) => (
                          <Paper
                            key={item.idInventory}
                            elevation={0}
                            sx={{
                              border: "1px solid #E5E7EB",
                              borderRadius: 2,
                              p: 1.5,
                              bgcolor: "white",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 2,
                                alignItems: "flex-start",
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography fontWeight={700} fontSize="0.9rem" color="#111827">
                                  {item.productName}
                                </Typography>

                                <Typography
                                  fontSize="0.8rem"
                                  color="text.secondary"
                                  sx={{ mt: 0.35 }}
                                >
                                  {item.productDescription}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                    mt: 1,
                                  }}
                                >
                                  <Chip
                                    size="small"
                                    label={`SKU: ${item.skuProduct}`}
                                    variant="outlined"
                                  />
                                  <Chip
                                    size="small"
                                    label={`Precio: $${item.productPrice}`}
                                    variant="outlined"
                                  />
                                  <Chip
                                    size="small"
                                    label={`Cantidad: ${item.quantity}`}
                                    sx={{
                                      bgcolor: "rgba(46,125,50,0.10)",
                                      color: "#2E7D32",
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              </Box>

                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Tooltip title="Editar cantidad" arrow>
                                  <IconButton onClick={() => openInventoryEditDialog(item)}>
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Eliminar producto de sucursal" arrow>
                                  <IconButton
                                    onClick={() => openInventoryDeleteDialog(item)}
                                    sx={{ color: "#E53935" }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Paper>
            );
          })
        )}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle fontWeight={700}>Agregar sucursal</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {formError && <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>}

          <TextField
            label="Nombre de la sucursal"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            size="small"
          />

          <TextField
            label="Dirección"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            fullWidth
            size="small"
          />

          <Divider />

          <Box>
            <Typography fontSize="0.82rem" fontWeight={600} color="#374151" mb={1}>
              Selecciona la ubicación en el mapa
            </Typography>

            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "#FAFAFA" }}>
              <LocationPicker onUpdateLocation={handleLocationUpdate} />
              {form.latitude !== null && form.longitude !== null && (
                <Typography sx={{ mt: 1.2 }} variant="caption" color="#2E7D32" fontWeight={600}>
                  Ubicación capturada: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                </Typography>
              )}
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving}
            sx={{
              bgcolor: "#1565C0",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: "#0D47A1", boxShadow: "none" },
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Guardar sucursal"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => !saving && setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle fontWeight={700}>Editar sucursal</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {editError && <Alert severity="error" sx={{ borderRadius: 2 }}>{editError}</Alert>}

          <TextField
            label="Nombre de la sucursal"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            size="small"
          />

          <TextField
            label="Dirección"
            value={editForm.address}
            onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
            fullWidth
            size="small"
          />

          <Divider />

          <Box>
            <Typography fontSize="0.82rem" fontWeight={600} color="#374151" mb={1}>
              Actualiza la ubicación en el mapa
            </Typography>

            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "#FAFAFA" }}>
              <LocationPicker onUpdateLocation={handleEditLocationUpdate} />
              {editForm.latitude !== null && editForm.longitude !== null && (
                <Typography sx={{ mt: 1.2 }} variant="caption" color="#2E7D32" fontWeight={600}>
                  Nueva ubicación: {editForm.latitude.toFixed(5)}, {editForm.longitude.toFixed(5)}
                </Typography>
              )}
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditDialogOpen(false)} disabled={saving} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleEdit}
            disabled={saving}
            sx={{
              bgcolor: "#1565C0",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: "#0D47A1", boxShadow: "none" },
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Guardar cambios"}
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
        <DialogTitle fontWeight={700}>Eliminar sucursal</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography fontSize="0.9rem" color="text.secondary">
            ¿Estás segura de que deseas eliminar esta sucursal?
          </Typography>
          {selectedWarehouse && (
            <Typography sx={{ mt: 1 }} fontWeight={700} color="#111827">
              {selectedWarehouse.name}
            </Typography>
          )}
          <Typography sx={{ mt: 1 }} fontSize="0.82rem" color="#6B7280">
            Solo se puede eliminar si no tiene productos asociados.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving} sx={{ textTransform: "none" }}>
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
            {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={inventoryEditDialogOpen}
        onClose={() => !saving && setInventoryEditDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle fontWeight={700}>Editar cantidad</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {inventoryEditError && (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
              {inventoryEditError}
            </Alert>
          )}

          {selectedInventoryItem && (
            <Typography sx={{ mb: 2 }} fontWeight={700} color="#111827">
              {selectedInventoryItem.productName}
            </Typography>
          )}

          <TextField
            label="Cantidad"
            type="number"
            value={inventoryEditForm.quantity}
            onChange={(e) =>
              setInventoryEditForm((prev) => ({
                ...prev,
                quantity: e.target.value,
              }))
            }
            fullWidth
            size="small"
            inputProps={{ min: 0 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setInventoryEditDialogOpen(false)}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleInventoryEdit}
            disabled={saving}
            sx={{
              bgcolor: "#1565C0",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: "#0D47A1", boxShadow: "none" },
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Guardar cantidad"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={inventoryDeleteDialogOpen}
        onClose={() => !saving && setInventoryDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle fontWeight={700}>Eliminar producto</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography fontSize="0.9rem" color="text.secondary">
            ¿Deseas eliminar este producto de la sucursal?
          </Typography>

          {selectedInventoryItem && (
            <Typography sx={{ mt: 1 }} fontWeight={700} color="#111827">
              {selectedInventoryItem.productName}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setInventoryDeleteDialogOpen(false)}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleInventoryDelete}
            disabled={saving}
            sx={{
              bgcolor: "#E53935",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: "#C62828", boxShadow: "none" },
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Eliminar"}
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

export default BuyerWarehouses;