import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import SubNav from "./components/SubNav";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import BuyerPage from "./pages/BuyerPage";
import { AuthProvider } from "./context/AuthContext";

const theme = createTheme({
  palette: { primary: { main: "#1565C0" }, background: { default: "#F5F7FB" } },
  typography: { fontFamily: "'Inter', 'Roboto', sans-serif" },
  shape: { borderRadius: 8 },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
        <Header />
        <SubNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/buyer" element={<BuyerPage />} />
        </Routes>
      </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;