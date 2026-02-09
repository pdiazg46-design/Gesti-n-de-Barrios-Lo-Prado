import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Edit2, Eye, EyeOff, Map as MapIcon } from 'lucide-react';
import { UNIDADES_VECINALES } from '@/lib/territorial';

interface AlertItem {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    status: string;
    category: string;
}

interface OfficialMapSelectorProps {
    lat: number;
    lng: number;
    radius: number;
    alerts?: AlertItem[];
    onLocationSelect: (lat: number, lng: number) => void;
    onAlertAction?: (id: string, action: 'EDIT' | 'TOGGLE') => void;
}

const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Generador de Iconos Dinámicos para el Admin
const getAdminIcon = (status: string, category: string) => {
    const color = status === 'ACTIVE' ? '#4f46e5' : '#94a3b8';
    return L.divIcon({
        className: 'custom-admin-icon',
        html: `
            <div style="
                background-color: ${color}; 
                width: 14px; 
                height: 14px; 
                border-radius: 50%; 
                border: 2px solid white; 
                box-shadow: 0 0 10px ${color}80;
            "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
};

const getUvIcon = (id: number) => {
    return L.divIcon({
        className: 'uv-icon',
        html: `<div style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.4); width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; font-weight: 900;">${id}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });
};

const OfficialMapSelector = ({ lat, lng, radius, alerts = [], onLocationSelect, onAlertAction }: OfficialMapSelectorProps) => {
    const [geojsonData, setGeojsonData] = useState<any>(null);

    useEffect(() => {
        fetch('/data/lo_prado_uvs.geojson')
            .then(res => res.json())
            .then(data => setGeojsonData(data))
            .catch(err => console.error('Error loading municipal UV GeoJSON:', err));
    }, []);

    const onEachFeature = (feature: any, layer: any) => {
        if (feature.properties && feature.properties.NUM_UV) {
            layer.bindPopup(`
                <div style="padding: 8px; font-family: inherit;">
                    <div style="font-size: 9px; font-weight: 900; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 2px; text-transform: uppercase;">Unidad Vecinal</div>
                    <div style="font-size: 11px; font-weight: 900; color: #f97316;">UV ${feature.properties.NUM_UV} - ${feature.properties.NOM_UV}</div>
                    <button 
                        onclick="window.selectUvLocation(${feature.properties.NUM_UV})"
                        style="margin-top: 8px; width: 100%; padding: 6px; background: #4f46e5; color: white; border-radius: 8px; border: none; font-size: 9px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;"
                    >
                        Seleccionar este sector
                    </button>
                </div>
            `);
        }

        layer.on({
            mouseover: (e: any) => {
                const l = e.target;
                l.setStyle({ fillOpacity: 0.2, weight: 3 });
            },
            mouseout: (e: any) => {
                const l = e.target;
                l.setStyle({ fillOpacity: 0.05, weight: 2 });
            },
            click: (e: any) => {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        });
    };

    // Global exposed function for popup button
    useEffect(() => {
        (window as any).selectUvLocation = (numUv: number) => {
            const uv = UNIDADES_VECINALES.find(u => u.id === numUv);
            if (uv) {
                onLocationSelect(uv.lat, uv.lng);
            }
        };
    }, [onLocationSelect]);
    return (
        <MapContainer
            center={[-33.448, -70.725]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            className="z-0 grayscale-[0.2] contrast-[1.1]"
            zoomControl={false}
            scrollWheelZoom={true}
        >
            <TileLayer
                url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                attribution='&copy; Google Maps'
            />

            {/* Referencia Territorial Municipal */}
            {geojsonData && (
                <GeoJSON
                    data={geojsonData}
                    style={{
                        color: '#f97316',
                        weight: 2,
                        fillColor: '#f97316',
                        fillOpacity: 0.05,
                        dashArray: '3'
                    }}
                    onEachFeature={onEachFeature}
                />
            )}

            {/* Etiquetas UV Centroid */}
            {UNIDADES_VECINALES.map(uv => (
                <Marker
                    key={`uv-label-${uv.id}`}
                    position={[uv.lat, uv.lng]}
                    icon={getUvIcon(uv.id)}
                    zIndexOffset={-500}
                >
                    <Popup>
                        <div className="p-2 font-black text-[10px] uppercase tracking-widest text-indigo-600">
                            {uv.name}
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Círculo de Zona de Impacto (Edición Actual) */}
            <Circle
                center={[lat, lng]}
                pathOptions={{
                    fillColor: '#4f46e5',
                    color: '#4f46e5',
                    weight: 4,
                    fillOpacity: 0.15,
                    dashArray: '10, 10'
                }}
                radius={radius}
            />

            {/* Marcadores de Alertas Existentes */}
            {alerts.map((alert) => (
                <Marker
                    key={alert.id}
                    position={[alert.lat, alert.lng]}
                    icon={getAdminIcon(alert.status, alert.category)}
                >
                    <Popup className="premium-popup admin-popup">
                        <div className="p-3 w-48">
                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{alert.status === 'ACTIVE' ? 'ACTIVA' : 'ARCHIVADA'}</h4>
                            <p className="font-black text-slate-900 text-sm mb-1 leading-tight">{alert.title}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mb-4">{alert.description}</p>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAlertAction?.(alert.id, 'EDIT');
                                    }}
                                    className="flex items-center justify-center gap-1 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all"
                                >
                                    <Edit2 className="w-3 h-3" /> Editar
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAlertAction?.(alert.id, 'TOGGLE');
                                    }}
                                    className="flex items-center justify-center gap-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-slate-200 transition-all"
                                >
                                    {alert.status === 'ACTIVE' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {alert.status === 'ACTIVE' ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            <MapClickHandler onLocationSelect={onLocationSelect} />
        </MapContainer>
    );
};

export default OfficialMapSelector;
