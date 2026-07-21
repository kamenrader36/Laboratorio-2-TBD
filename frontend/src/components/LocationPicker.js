import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography } from '@mui/material';

// Solución al problema común de Leaflet en React donde los iconos por defecto no cargan la ruta de la imagen
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Componente auxiliar interno para capturar los clics en el mapa
const LocationMarker = ({ marker, setMarker, onUpdateLocation }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarker([lat, lng]);
      
      // Notificamos al componente padre (RegisterPage)
      if (onUpdateLocation) {
        onUpdateLocation({ lat, lng });
      }
    },
  });

  return marker ? <Marker position={marker} /> : null;
};

const LocationP = ({ onUpdateLocation }) => {
  const [marker, setMarker] = useState(null);
  const center = [-33.4489, -70.6693]; // Coordenadas iniciales (Santiago)
  const zoom = 13;

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "#555", mb: 1, fst: "italic" }}>
        Haz clic en el mapa para fijar tu ubicación:
      </Typography>
      
      <Box
        sx={{
          height: 300,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #ccc",
          // Regla importante para evitar conflictos de z-index con modales o headers de MUI
          zIndex: 0, 
          position: "relative"
        }}
      >
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            marker={marker} 
            setMarker={setMarker} 
            onUpdateLocation={onUpdateLocation} 
          />
        </MapContainer>
      </Box>
    </Box>
  );
};

export default LocationP;