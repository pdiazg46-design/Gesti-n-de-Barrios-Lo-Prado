import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Bell, MapPin, ShoppingBag, Gift, Info, Filter, Users, Map as MapIcon } from 'lucide-react';
import { UNIDADES_VECINALES } from '@/lib/territorial';

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
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [items, map]);
    return null;
}

export const ScientificMap = ({
    items,
    center = [-33.448, -70.725], // Centro Comuna Lo Prado
    zoom = 14
}: ScientificMapProps) => {
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'OFFICIAL' | 'CIVIC' | 'COMMUNITY'>('ALL');
    const [showTerritorial, setShowTerritorial] = useState(false);
    const [geojsonData, setGeojsonData] = useState<any>(null);

    useEffect(() => {
        if (showTerritorial && !geojsonData) {
            fetch('/data/lo_prado_uvs.geojson')
                .then(res => res.json())
                .then(data => setGeojsonData(data))
                .catch(err => console.error('Error loading UV GeoJSON:', err));
        }
    }, [showTerritorial, geojsonData]);

    const onEachFeature = (feature: any, layer: any) => {
        if (feature.properties && feature.properties.NUM_UV) {
            layer.bindPopup(`
                <div style="padding: 8px; font-family: inherit;">
                    <div style="font-size: 9px; font-weight: 900; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 2px; text-transform: uppercase;">Unidad Vecinal</div>
                    <div style="font-size: 11px; font-weight: 900; color: #f97316;">UV ${feature.properties.NUM_UV} - ${feature.properties.NOM_UV}</div>
                </div>
            `);
        }

        layer.on({
            mouseover: (e: any) => {
                const l = e.target;
                l.setStyle({
                    fillOpacity: 0.2,
                    weight: 3
                });
            },
            mouseout: (e: any) => {
                const l = e.target;
                l.setStyle({
                    fillOpacity: 0.05,
                    weight: 2
                });
            }
        });
    };

    const getMarkerConfig = (type: string) => {
        if (type === 'OFFICIAL_ALERT') return { color: '#6366f1', label: 'OFICIAL' };
        if (type === 'CIVIC_REPORT') return { color: '#ef4444', label: 'SEGURIDAD' };
        if (['SALE', 'GIFT', 'SERVICE_OFFER', 'SERVICE_REQUEST', 'SERVICE'].includes(type)) return { color: '#22c55e', label: 'COMUNIDAD' };
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

    const getUvIcon = (id: number) => {
        return L.divIcon({
            className: 'uv-icon',
            html: `<div style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.4); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 900;">${id}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });
    };

    const filteredItems = items.filter(item => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'OFFICIAL') return item.type === 'OFFICIAL_ALERT';
        if (activeFilter === 'CIVIC') return item.type === 'CIVIC_REPORT';
        if (activeFilter === 'COMMUNITY') return ['SALE', 'GIFT', 'SERVICE_OFFER', 'SERVICE_REQUEST', 'SERVICE'].includes(item.type);
        return true;
    });

    return (
        <div className="w-full h-[550px] rounded-[3.5rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl relative z-0 group">

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

            {/* Toggle Territorial */}
            <div className="absolute top-6 right-6 z-[1000] pointer-events-auto">
                <button
                    onClick={() => setShowTerritorial(!showTerritorial)}
                    className={`
                        px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg
                        ${showTerritorial
                            ? 'bg-amber-600 text-white scale-105'
                            : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 backdrop-blur-md hover:scale-105'}
                    `}
                >
                    <MapIcon className="w-4 h-4" />
                    {showTerritorial ? 'Ocultar Sectores' : 'Ver Juntas Vecinales'}
                </button>
            </div>

            {/* Overlay: Leyenda Glassmorphic */}
            <div className="absolute bottom-6 right-6 z-[1000] p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800 shadow-2xl pointer-events-none">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Escala Comunal</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Voz Oficial</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Seguridad</span>
                    </div>
                    {showTerritorial && (
                        <div className="flex items-center gap-3 border-t border-slate-200/30 pt-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-900/60" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Unidades Vecinales</span>
                        </div>
                    )}
                </div>
            </div>

            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution='&copy; Google Maps'
                />

                {/* Referencia Territorial (Polígonos Oficiales) */}
                {showTerritorial && geojsonData && (
                    <GeoJSON
                        data={geojsonData}
                        style={{
                            color: '#f97316', // Borde institucional naranja/rojo
                            weight: 2,
                            fillColor: '#f97316',
                            fillOpacity: 0.05,
                            dashArray: '3'
                        }}
                        onEachFeature={onEachFeature}
                    />
                )}

                {/* Etiquetas de centroide (opcional, si los círculos daban contexto mejorado) */}
                {showTerritorial && UNIDADES_VECINALES.map(uv => (
                    <Marker key={uv.id} position={[uv.lat, uv.lng]} icon={getUvIcon(uv.id)}>
                        <Popup>
                            <div className="p-2 font-black text-[10px] uppercase tracking-widest text-indigo-600">
                                {uv.name}
                            </div>
                        </Popup>
                    </Marker>
                ))}

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
