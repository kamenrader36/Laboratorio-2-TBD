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
} from "@mui/material";
import {
  StoreOutlined as StoreIcon,
  AddOutlined as AddIcon,
  LocationOnOutlined as LocationIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { getMyWarehouses, createWarehouse } from "../../services/warehouseService";
import LocationPicker from "../LocationPicker";

const BuyerWarehouses = () => {
  const { token } = useAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: null,
    longitude: null,
  });

  const [formError, setFormError] = useState("");

  const fetchWarehouses = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyWarehouses(token);
      setWarehouses(data);
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
      await createWarehouse(
        {
          name: form.name.trim(),
          address: form.address.trim(),
          latitude: form.latitude,
          longitude: form.longitude,
        },
        token
      );

      setDialogOpen(false);
      setForm({
        name: "",
        address: "",
        latitude: null,
        longitude: null,
      });

      fetchWarehouses();
    } catch (err) {
      setFormError(err.message);
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
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
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
          warehouses.map((warehouse) => (
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
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
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
            </Paper>
          ))
        )}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>Agregar sucursal</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {formError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

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

            <Paper
              variant="outlined"
              sx={{ p: 1.5, borderRadius: 2, bgcolor: "#FAFAFA" }}
            >
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
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
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
    </Box>
  );
};

export default BuyerWarehouses;