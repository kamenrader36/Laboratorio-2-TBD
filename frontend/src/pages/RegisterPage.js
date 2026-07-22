import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../components/LocationPicker.js";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PersonOutlined as PersonIcon,
  EmailOutlined as EmailIcon,
  BadgeOutlined as BadgeIcon,
  HomeOutlined as HomeIcon,
  PhoneOutlined as PhoneIcon,
  AccountCircleOutlined as UsernameIcon,
  LockOutlined as LockIcon,
  CheckCircleOutlined as CheckIcon,
  LocationOnOutlined as LocationIcon,
} from "@mui/icons-material";

const API_URL = "http://localhost:8090/api/auth";

const validateRut = (rut) => {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let sum = 0;
  let mult = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }

  const expected = 11 - (sum % 11);
  const dvExpected =
    expected === 11 ? "0" : expected === 10 ? "K" : String(expected);

  return dv === dvExpected;
};

const formatRut = (value) => {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length <= 1) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

const formatPhone = (value) => {
  let clean = value.replace(/[^\d+]/g, "");
  if (!clean.startsWith("+")) clean = "+" + clean.replace(/\+/g, "");
  return clean.slice(0, 13);
};

const validators = {
  username: (v) => (v.trim().length >= 3 ? "" : "Mínimo 3 caracteres"),
  name_user: (v) =>
    v.trim().length >= 3 ? "" : "Ingresa tu nombre completo",
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? ""
      : "Formato inválido (ej: usuario@dominio.com)",
  password: (v) =>
    v.length >= 8 ? "" : "La contraseña debe tener al menos 8 caracteres",
  confirmPassword: (v, form) =>
    v === form.password ? "" : "Las contraseñas no coinciden",
  rut: (v) => {
    if (!/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v)) {
      return "Formato inválido (ej: 12.345.678-9)";
    }
    if (!validateRut(v)) {
      return "RUT inválido (dígito verificador incorrecto)";
    }
    return "";
  },
  address: (v) => (v.trim().length >= 5 ? "" : "Ingresa una dirección válida"),
  phone: (v) =>
    /^\+\d{8,12}$/.test(v) ? "" : "Formato inválido (ej: +56912345678)",
};

const FIELDS = [
  {
    name: "username",
    label: "Nombre de usuario",
    icon: <UsernameIcon />,
    placeholder: "ej: empresa_chile",
    type: "text",
  },
  {
    name: "name_user",
    label: "Nombre completo",
    icon: <PersonIcon />,
    placeholder: "ej: Juan Pérez González",
    type: "text",
  },
  {
    name: "email",
    label: "Correo electrónico",
    icon: <EmailIcon />,
    placeholder: "ej: contacto@empresa.cl",
    type: "email",
  },
  {
    name: "password",
    label: "Contraseña",
    icon: <LockIcon />,
    placeholder: "Mínimo 8 caracteres",
    type: "password",
  },
  {
    name: "confirmPassword",
    label: "Confirmar contraseña",
    icon: <LockIcon />,
    placeholder: "Repite tu contraseña",
    type: "password",
  },
  {
    name: "rut",
    label: "RUT",
    icon: <BadgeIcon />,
    placeholder: "ej: 12.345.678-9",
    type: "text",
  },
  {
    name: "address",
    label: "Dirección escrita",
    icon: <HomeIcon />,
    placeholder: "ej: Av. Libertador 1234, Santiago",
    type: "text",
  },
  {
    name: "phone",
    label: "Teléfono",
    icon: <PhoneIcon />,
    placeholder: "ej: +56912345678",
    type: "tel",
  },
];

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    name_user: "",
    rut: "",
    address: "",
    phone: "",
    latitud: null,
    longitud: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "rut") value = formatRut(value);
    if (name === "phone") value = formatPhone(value);

    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError("");

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validators[name](value, { ...form, [name]: value }),
      }));
    }

    if (name === "password" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validators.confirmPassword(
          form.confirmPassword,
          { ...form, password: value }
        ),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validators[name](value, form),
    }));
  };

  const handleLocationUpdate = (coords) => {
    setForm((prev) => ({
      ...prev,
      latitud: coords.lat,
      longitud: coords.lng,
    }));
    setLocationError(false);
  };

  const isFormValid = () => {
    const fieldErrors = Object.fromEntries(
      FIELDS.map((field) => [
        field.name,
        validators[field.name](form[field.name], form),
      ])
    );

    const hasCoordinates = form.latitud !== null && form.longitud !== null;
    return (
      Object.values(fieldErrors).every((error) => !error) && hasCoordinates
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = Object.fromEntries(FIELDS.map((f) => [f.name, true]));
    const allErrors = Object.fromEntries(
      FIELDS.map((f) => [f.name, validators[f.name](form[f.name], form)])
    );

    setTouched(allTouched);
    setErrors(allErrors);
    setSubmitError("");

    if (form.latitud === null || form.longitud === null) {
      setLocationError(true);
      return;
    }

    if (!isFormValid()) return;

    const payload = {
      username: form.username.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      email: form.email.trim(),
      name_user: form.name_user.trim(),
      rut: form.rut.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      latitud: form.latitud,
      longitud: form.longitud,
    };

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "No se pudo registrar el usuario.");
      }

      setSuccess(true);
    } catch (error) {
      setSubmitError(
        error.message || "Ocurrió un error al crear la cuenta."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          bgcolor: "#F5F7FB",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #E3E8F0",
            borderRadius: 3,
            p: 6,
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
          }}
        >
          <CheckIcon sx={{ fontSize: 64, color: "#43A047", mb: 2 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            ¡Registro exitoso!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tu cuenta ha sido creada. Ya puedes iniciar sesión.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/login")}
            sx={{
              bgcolor: "#1565C0",
              textTransform: "none",
              fontWeight: 600,
              py: 1.2,
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": { bgcolor: "#0D47A1", boxShadow: "none" },
            }}
          >
            Ir a Iniciar Sesión
          </Button>
        </Paper>
      </Box>
    );
  }

  const fieldIconColor = (name) =>
    touched[name] && errors[name]
      ? "#d32f2f"
      : touched[name] && !errors[name]
      ? "#43A047"
      : "#9CA3AF";

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      fontSize: "0.88rem",
      bgcolor: "white",
      "&.Mui-focused fieldset": { borderColor: "#1565C0" },
      "&:hover fieldset": { borderColor: "#1565C0" },
    },
    "& .MuiFormHelperText-root": { fontSize: "0.72rem", mx: 0, mt: 0.5 },
  };

  return (
    <Box sx={{ bgcolor: "#F5F7FB", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#1565C0" />
              <path
                d="M8 10 L16 18 L8 26"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 10 H28 V18 H16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="26" r="2.5" fill="white" />
              <circle cx="28" cy="26" r="2.5" fill="white" />
            </svg>
            <Typography variant="h6" fontWeight={700} color="#1565C0">
              Nex<span style={{ fontWeight: 300 }}>Trade</span>
            </Typography>
          </Box>

          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: "#111827", mb: 0.5 }}
          >
            Crear cuenta empresarial
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Completa tus datos y selecciona tu punto en el mapa
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid #E3E8F0",
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: "0 4px 20px rgba(21,101,192,0.07)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {submitError && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {submitError}
                </Alert>
              )}

              {FIELDS.map((field) => (
                <Box key={field.name}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{
                      color: "#374151",
                      mb: 0.5,
                      display: "block",
                      fontSize: "0.8rem",
                    }}
                  >
                    {field.label}
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    error={touched[field.name] && Boolean(errors[field.name])}
                    helperText={touched[field.name] && errors[field.name]}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {React.cloneElement(field.icon, {
                            sx: {
                              fontSize: 18,
                              color: fieldIconColor(field.name),
                            },
                          })}
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Box>
              ))}

              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    color: "#374151",
                    mb: 0.5,
                    display: "block",
                    fontSize: "0.8rem",
                  }}
                >
                  Ubicación geográfica en mapa *
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: "8px",
                    bgcolor: "#FAFAFA",
                    borderColor: locationError ? "#d32f2f" : "#E3E8F0",
                  }}
                >
                  <LocationPicker onUpdateLocation={handleLocationUpdate} />

                  {form.latitud !== null && form.longitud !== null && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 1.5,
                        color: "#2E7D32",
                      }}
                    >
                      <LocationIcon fontSize="small" />
                      <Typography variant="caption" fontWeight={600}>
                        Ubicación capturada: {form.latitud.toFixed(5)},{" "}
                        {form.longitud.toFixed(5)}
                      </Typography>
                    </Box>
                  )}
                </Paper>

                {locationError && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, display: "block", fontSize: "0.72rem" }}
                  >
                    Por favor, selecciona un punto en el mapa para registrar tu
                    dirección geográfica.
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 0.5, borderColor: "#E3E8F0" }} />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  bgcolor: "#1565C0",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  py: 1.3,
                  borderRadius: "8px",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#0D47A1", boxShadow: "none" },
                  "&.Mui-disabled": { bgcolor: "#B0BEC5", color: "white" },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  "Crear cuenta empresarial"
                )}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.8rem"
                >
                  ¿Ya tienes cuenta?{" "}
                  <Button
                    onClick={() => navigate("/login")}
                    sx={{
                      textTransform: "none",
                      color: "#1565C0",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      p: 0,
                      minWidth: 0,
                      "&:hover": {
                        bgcolor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Iniciar sesión
                  </Button>
                </Typography>
              </Box>
            </Box>
          </form>
        </Paper>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            onClick={() => navigate("/")}
            sx={{
              textTransform: "none",
              color: "#6B7280",
              fontSize: "0.8rem",
              "&:hover": { bgcolor: "transparent", color: "#1565C0" },
            }}
          >
            ← Volver al inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;