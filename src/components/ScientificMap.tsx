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
        const isOfficial = type === 'OFFICIAL_ALERT' || type === 'CIVIC_REPORT';
        
        return L.divIcon({
            className: 'custom-div-icon bg-transparent border-none',
            html: `
                <div class="relative flex items-center justify-center w-8 h-8">
                    <div class="absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping" style="background-color: ${color}; animation-duration: ${isOfficial ? '1.5s' : '3s'};"></div>
                    <div class="relative inline-flex rounded-full w-4 h-4 shadow-xl border-2 border-white" style="background-color: ${color}; box-shadow: 0 0 12px ${color};"></div>
                </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
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
        <div className="flex flex-col gap-4">
            {/* Margen Superior Fuera del Mapa: Filtros y Toggle Territorial */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {[
                    { id: 'ALL', label: 'Todo', icon: <Filter className="w-3.5 h-3.5" /> },
                    { id: 'OFFICIAL', label: 'Oficial', icon: <Bell className="w-3.5 h-3.5" /> },
                    { id: 'CIVIC', label: 'Seguridad', icon: <Shield className="w-3.5 h-3.5" /> },
                    { id: 'COMMUNITY', label: 'Comunidad', icon: <Users className="w-3.5 h-3.5" /> }
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id as any)}
                        className={`
                            px-3 py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm border
                            ${activeFilter === f.id
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}
                        `}
                    >
                        {f.icon}
                        {f.label}
                    </button>
                ))}

                <button
                    onClick={() => setShowTerritorial(!showTerritorial)}
                    className={`
                        px-3 py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm border ml-auto sm:ml-0
                        ${showTerritorial
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}
                    `}
                >
                    <MapIcon className="w-3.5 h-3.5" />
                    {showTerritorial ? 'Ocultar Sectores' : 'Ver Juntas Vecinales'}
                </button>
            </div>

            {/* Contenedor del Mapa */}
            <div className="w-full h-[300px] sm:h-[550px] rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl relative z-0 flex-shrink-0">

            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
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
                        <Popup className="premium-popup custom-leaflet-popup" minWidth={180} maxWidth={260}>
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: getMarkerConfig(item.type).color }}>
                                    {getMarkerConfig(item.type).label}
                                </h3>
                                <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{item.title}</p>
                                {item.description && (
                                    <p className="text-xs text-slate-500 line-clamp-3 mt-1 leading-relaxed">{item.description}</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <ZoomManager items={filteredItems} />
            </MapContainer>
        </div>

        {/* Margen Inferior Fuera del Mapa: Leyenda */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-4 py-2">
            <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Voz Oficial</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Seguridad</span>
            </div>
            {showTerritorial && (
                <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900/60" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">Unidades Vecinales</span>
                </div>
            )}
        </div>
    </div>
    );
};
