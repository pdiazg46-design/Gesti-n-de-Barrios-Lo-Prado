import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Bell, MapPin, ShoppingBag, Gift, Info, Filter, Users } from 'lucide-react';

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
    type: string; // OFFICIAL_ALERT, CIVIC_REPORT, SALE, GIFT, etc.
}

interface ScientificMapProps {
    items: MapItem[];
    center?: [number, number];
    zoom?: number;
}

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

export const ScientificMap = ({
    items,
    center = [-33.4489, -70.7256], // Lo Prado Center
    zoom = 15
}: ScientificMapProps) => {
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'OFFICIAL' | 'CIVIC' | 'COMMUNITY'>('ALL');

    const getMarkerConfig = (type: string) => {
        if (type === 'OFFICIAL_ALERT') return { color: '#6366f1', label: 'OFICIAL' };
        if (type === 'CIVIC_REPORT') return { color: '#ef4444', label: 'SEGURIDAD' };
        if (['SALE', 'GIFT', 'SERVICE_OFFER', 'SERVICE_REQUEST'].includes(type)) return { color: '#22c55e', label: 'COMUNIDAD' };
        return { color: '#94a3b8', label: 'OTROS' };
    };

    const getIcon = (type: string) => {
        const { color } = getMarkerConfig(type);
        return L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div style="
                    background-color: ${color}; 
                    width: 16px; 
                    height: 16px; 
                    border-radius: 50%; 
                    border: 3px solid white; 
                    box-shadow: 0 0 15px ${color}80;
                "></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
    };

    const filteredItems = items.filter(item => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'OFFICIAL') return item.type === 'OFFICIAL_ALERT';
        if (activeFilter === 'CIVIC') return item.type === 'CIVIC_REPORT';
        if (activeFilter === 'COMMUNITY') return ['SALE', 'GIFT', 'SERVICE_OFFER', 'SERVICE_REQUEST'].includes(item.type);
        return true;
    });

    return (
        <div className="w-full h-[500px] rounded-[3rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl relative z-0 group">

            {/* Overlay: Filtros Interactivos */}
            <div className="absolute top-6 left-6 z-[1000] flex flex-wrap gap-2 pointer-events-auto">
                {[
                    { id: 'ALL', label: 'Todo', icon: <Filter className="w-4 h-4" /> },
                    { id: 'OFFICIAL', label: 'Oficial', icon: <Bell className="w-4 h-4" /> },
                    { id: 'CIVIC', label: 'Seguridad', icon: <Shield className="w-4 h-4" /> },
                    { id: 'COMMUNITY', label: 'Comunidad', icon: <Users className="w-4 h-4" /> }
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id as any)}
                        className={`
                            px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg
                            ${activeFilter === f.id
                                ? 'bg-indigo-600 text-white scale-105'
                                : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 backdrop-blur-md hover:scale-105'}
                        `}
                    >
                        {f.icon}
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Overlay: Leyenda Glassmorphic */}
            <div className="absolute bottom-6 right-6 z-[1000] p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800 shadow-2xl pointer-events-none">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Situación del Barrio</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Voz Oficial</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Incidencias / Riesgos</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Comunidad</span>
                    </div>
                </div>
            </div>

            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution='&copy; Google Maps'
                />

                {filteredItems.map((item) => (
                    <Marker
                        key={item.id}
                        position={[item.lat, item.lng]}
                        icon={getIcon(item.type)}
                    >
                        <Popup className="premium-popup">
                            <div className="p-3 min-w-[160px]">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: getMarkerConfig(item.type).color }}>
                                    {getMarkerConfig(item.type).label}
                                </h3>
                                <p className="font-black text-slate-900 dark:text-white text-xs leading-tight mb-2">{item.title}</p>
                                <p className="text-[10px] text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <ZoomManager items={filteredItems} />
            </MapContainer>
        </div>
    );
};
