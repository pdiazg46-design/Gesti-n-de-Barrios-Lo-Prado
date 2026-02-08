import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon assets in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapItem {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description?: string;
    type: 'REPORT' | 'SALE' | 'GIFT' | 'OFFICIAL';
}

interface ScientificMapProps {
    items: MapItem[];
    center?: [number, number];
    zoom?: number;
}

/**
 * ZoomManager: Pattern 3.2 de "Especialista en Mapas Científicos"
 * Ajusta automáticamente los límites para abarcar todos los marcadores.
 */
function ZoomManager({ items }: { items: MapItem[] }) {
    const map = useMap();

    useEffect(() => {
        if (items.length > 0) {
            const bounds = L.latLngBounds(items.map(item => [item.lat, item.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
        }
    }, [items, map]);

    return null;
}

/**
 * ScientificMap: Pattern 13.1 (Motor Híbrido)
 * Combina la estabilidad de Leaflet con la visual oficial de Google.
 */
export const ScientificMap = ({
    items,
    center = [-33.4571546, -70.7105982], // Default: Lo Prado
    zoom = 15
}: ScientificMapProps) => {

    // Generador de Iconos Dinámicos (Pattern 3.3)
    const getIcon = (type: string) => {
        let color = '#3b82f6'; // Azul por defecto
        if (type === 'REPORT') color = '#ef4444'; // Rojo crítico
        if (type === 'SALE') color = '#22c55e'; // Verde comercial
        if (type === 'OFFICIAL') color = '#indigo-600';

        return L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div style="
                    background-color: ${color}; 
                    width: 14px; 
                    height: 14px; 
                    border-radius: 50%; 
                    border: 2px solid white; 
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                "></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
    };

    return (
        <div className="w-full h-[400px] rounded-[2.5rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl relative z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                {/* Capas de Google Maps Tiles (Pattern 21.1) */}
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution='&copy; Google Maps'
                />

                {items.map((item) => (
                    <Marker
                        key={item.id}
                        position={[item.lat, item.lng]}
                        icon={getIcon(item.type)}
                    >
                        <Popup className="premium-popup">
                            <div className="p-2">
                                <h3 className="font-black text-indigo-600 uppercase text-xs mb-1 tracking-tighter">{item.type}</h3>
                                <p className="font-bold text-slate-900 text-sm mb-2">{item.title}</p>
                                <button className="w-full py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">
                                    Ver Detalle
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <ZoomManager items={items} />
            </MapContainer>
        </div>
    );
};
