'use client';

import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library itself
import { useEffect, useState } from 'react';

// Fix for default icon issue with Webpack/Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Specific icon for Tees
const teeIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // Can use a custom icon URL
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [15, 25], // Smaller icon size
    iconAnchor: [7, 25], // Point of the icon which will correspond to marker's location
    popupAnchor: [1, -24], // Point from which the popup should open relative to the iconAnchor
    shadowSize: [25, 25],
    className: 'tee-marker-icon' // Add class for potential CSS styling (e.g., filter: hue-rotate)
});

interface MapElement {
    id: number | string; // Unique key for React lists
    position: L.LatLngExpression;
    popupText?: string;
}

interface MapPolygon {
    id: number | string;
    positions: L.LatLngExpression[];
    popupText?: string;
    color?: string;
}

interface MapComponentProps {
  center: L.LatLngExpression;
  zoom?: number;
  userMarkerPosition?: L.LatLngExpression; // Renamed for clarity
  userMarkerPopupText?: string;
  teeMarkers?: MapElement[];
  greenPolygons?: MapPolygon[];
}

type MapLayerType = 'osm' | 'satellite';

// Helper component to get map instance
function MapEffect({ map, setMap }: { map: L.Map | null; setMap: (map: L.Map) => void }) {
  const mapInstance = useMap();
  
  useEffect(() => {
    setMap(mapInstance);
  }, [mapInstance, setMap]);
  
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom = 15,
  userMarkerPosition,
  userMarkerPopupText = "Your Location",
  teeMarkers = [],
  greenPolygons = [],
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('osm'); // Default to OSM

  // Effect to fly to new center when props change
  useEffect(() => {
    if (map && center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);

  // Effect to potentially adjust bounds when course elements are loaded
  useEffect(() => {
      if (map && (teeMarkers.length > 0 || greenPolygons.length > 0)) {
          const bounds = L.latLngBounds([]);
          if (userMarkerPosition) {
              bounds.extend(userMarkerPosition);
          }
          teeMarkers.forEach(m => bounds.extend(m.position));
          greenPolygons.forEach(p => bounds.extend(L.latLngBounds(p.positions)));

          if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [50, 50] }); // Add padding
          }
      }
  }, [map, teeMarkers, greenPolygons, userMarkerPosition]);

  const toggleMapLayer = () => {
    setMapLayer(prev => (prev === 'osm' ? 'satellite' : 'osm'));
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }} // Ensure container has dimensions
      >
        <MapEffect map={map} setMap={setMap} />
        
        {/* Conditional Tile Layer */}
        {mapLayer === 'osm' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {mapLayer === 'satellite' && (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18} // Satellite imagery often has higher zoom levels
          />
        )}

        {/* User Location Marker */}
        {userMarkerPosition && (
          <Marker position={userMarkerPosition}>
            <Popup>{userMarkerPopupText}</Popup>
          </Marker>
        )}

        {/* Tee Markers */}
        {teeMarkers.map((marker) => (
          <Marker key={marker.id} position={marker.position} icon={teeIcon}>
            {marker.popupText && <Popup>{marker.popupText}</Popup>}
          </Marker>
        ))}

        {/* Green Polygons */}
        {greenPolygons.map((polygon) => (
          <Polygon key={polygon.id} pathOptions={{ color: polygon.color || 'green' }} positions={polygon.positions}>
            {polygon.popupText && <Popup>{polygon.popupText}</Popup>}
          </Polygon>
        ))}

      </MapContainer>
      {/* Layer Toggle Button */}
      <button 
        onClick={toggleMapLayer}
        className="absolute bottom-2 right-2 z-[1000] px-3 py-1 bg-white bg-opacity-80 text-black text-xs rounded shadow hover:bg-opacity-100"
      >
        {mapLayer === 'osm' ? 'Satellite View' : 'Map View'}
      </button>
    </div>
  );
};

export default MapComponent; 