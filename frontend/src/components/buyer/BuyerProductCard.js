import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import {
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  WarningAmberOutlined as HazardIcon,
  StoreOutlined as StoreIcon,
} from "@mui/icons-material";

const MetaItem = ({ label, value, tone = "default" }) => {
  const styles =
    tone === "primary"
      ? {
          bgcolor: "rgba(21,101,192,0.08)",
          color: "#1565C0",
          border: "1px solid rgba(21,101,192,0.14)",
        }
      : tone === "success"
      ? {
          bgcolor: "rgba(46,125,50,0.10)",
          color: "#2E7D32",
          border: "1px solid rgba(46,125,50,0.16)",
        }
      : {
          bgcolor: "#F8FAFC",
          color: "#475569",
          border: "1px solid #E2E8F0",
        };

  return (
    <Box
      sx={{
        ...styles,
        borderRadius: 2,
        px: 1.25,
        py: 0.9,
      }}
    >
      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, opacity: 0.78 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, lineHeight: 1.3 }}>
        {value}
      </Typography>
    </Box>
  );
};

const BuyerProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E3E8F0",
        borderRadius: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(21,101,192,0.04)",
      }}
    >
      <CardContent
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
            gap: 2,
            flexGrow: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1.25,
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Typography
                fontWeight={700}
                fontSize="0.95rem"
                color="#111827"
                sx={{
                  lineHeight: 1.3,
                  pr: 1,
                }}
              >
                {product.productName}
              </Typography>

              {product.hazardousCategory && (
                <Chip
                  icon={<HazardIcon sx={{ fontSize: "0.95rem !important" }} />}
                  label="Químico"
                  size="small"
                  sx={{
                    bgcolor: "rgba(245,158,11,0.12)",
                    color: "#B45309",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>

            <Typography
              sx={{
                fontSize: "0.82rem",
                color: "#6B7280",
                lineHeight: 1.45,
                mb: 1.25,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.productDescription}
            </Typography>

            <Stack spacing={0.85}>
              <MetaItem
                label="Categoría"
                value={product.categoryName || "Sin categoría"}
                tone="primary"
              />
              <MetaItem label="SKU" value={product.skuProduct || "-"} />
              <MetaItem
                label="Stock total"
                value={product.totalStock ?? 0}
                tone="success"
              />
            </Stack>

            <Typography
              sx={{
                mt: 1.4,
                color: "#1565C0",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              ${Number(product.productPrice || 0).toLocaleString("es-CL")}
            </Typography>
          </Box>

          <Box
            sx={{
              borderLeft: { xs: "none", md: "1px solid #E5E7EB" },
              pl: { xs: 0, md: 2 },
              pt: { xs: 0.5, md: 0 },
              minWidth: 0,
            }}
          >
            <Typography
              fontWeight={700}
              fontSize="0.84rem"
              color="#1F2937"
              sx={{ mb: 1 }}
            >
              Stock por sucursal
            </Typography>

            <Stack spacing={0.85}>
              {product.inventories?.length ? (
                product.inventories.map((item) => (
                  <Box
                    key={`${product.idProduct}-${item.idWarehouse}`}
                    sx={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 2,
                      px: 1.1,
                      py: 0.9,
                      bgcolor: "#FAFBFC",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <StoreIcon sx={{ fontSize: 17, color: "#1565C0" }} />
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#111827",
                          lineHeight: 1.25,
                        }}
                      >
                        {item.warehouseName}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        mt: 0.55,
                        fontSize: "0.78rem",
                        color: "#2E7D32",
                        fontWeight: 700,
                      }}
                    >
                      Cantidad: {item.quantity}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography fontSize="0.82rem" color="text.secondary">
                  Sin inventario asignado.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 1.6 }} />

        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(product)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            Editar
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(product)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            Eliminar
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BuyerProductCard;