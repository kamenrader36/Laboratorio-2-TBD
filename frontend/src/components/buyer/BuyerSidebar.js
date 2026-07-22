import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from "@mui/material";
import {
  ShoppingBagOutlined as OrdersIcon,
  PersonOutlineOutlined as ProfileIcon,
  StoreOutlined as StoreIcon,
  HelpOutlineOutlined as HelpIcon,
  LogoutOutlined as LogoutIcon,
  BusinessOutlined as BusinessIcon,
} from "@mui/icons-material";
import LogoutDialog from "../LogoutDialog";

const menuItems = [
  { key: "orders", label: "Mis compras", icon: <OrdersIcon /> },
  { key: "profile", label: "Perfil", icon: <ProfileIcon /> },
  { key: "branches", label: "Sucursales", icon: <StoreIcon /> },
  { key: "help", label: "Ayuda", icon: <HelpIcon /> },
];

const BuyerSidebar = ({ activeSection, onSelect, onLogout }) => {
  const [logoutOpen, setLogoutOpen] = useState(false);

  const itemTextSlotProps = {
    primary: {
      sx: {
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "#374151",
      },
    },
  };

  const selectedTextSlotProps = {
    primary: {
      sx: {
        fontSize: "0.875rem",
        fontWeight: 700,
        color: "#1565C0",
      },
    },
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #E5EAF2",
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            background: "linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)",
          }}
        >
          <Avatar
            sx={{
              width: 46,
              height: 46,
              bgcolor: "rgba(21,101,192,0.10)",
              color: "#1565C0",
            }}
          >
            <BusinessIcon />
          </Avatar>

          <Box>
            <Typography fontWeight={700} fontSize="0.95rem" color="#111827">
              Mi tienda
            </Typography>
            <Typography fontSize="0.78rem" color="text.secondary">
              Panel de comprador B2B
            </Typography>
          </Box>
        </Box>

        <Divider />

        <List sx={{ py: 1.2, px: 1 }}>
          {menuItems.map((item) => {
            const isSelected = activeSection === item.key;

            return (
              <ListItemButton
                key={item.key}
                selected={isSelected}
                onClick={() => onSelect(item.key)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 46,
                  "&.Mui-selected": {
                    bgcolor: "rgba(21,101,192,0.08)",
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "rgba(21,101,192,0.12)",
                  },
                  "&:hover": {
                    bgcolor: "#F8FAFC",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isSelected ? "#1565C0" : "#6B7280",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  slotProps={isSelected ? selectedTextSlotProps : itemTextSlotProps}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Divider />

        <Box sx={{ p: 1 }}>
          <ListItemButton
            onClick={() => setLogoutOpen(true)}
            sx={{
              borderRadius: 2,
              minHeight: 46,
              "&:hover": {
                bgcolor: "rgba(229,57,53,0.06)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "#E53935" }}>
              <LogoutIcon />
            </ListItemIcon>

            <ListItemText
              primary="Cerrar sesión"
              slotProps={{
                primary: {
                  sx: {
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#E53935",
                  },
                },
              }}
            />
          </ListItemButton>
        </Box>
      </Paper>

      <LogoutDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          onLogout();
        }}
      />
    </>
  );
};

export default BuyerSidebar;