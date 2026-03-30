import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { Shield, Info, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HeatPoint {
    lat: number;
    lng: number;
    intensity: number;
    type: 'TRANSACTION' | 'ALERT' | 'MESSAGE' | 'OFFICIAL';
}

interface ActivityHeatmapProps {
    startDate?: string;
    endDate?: string;
}

const ActivityHeatmap = ({ startDate, endDate }: ActivityHeatmapProps) => {
    const [data, setData] = useState<HeatPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchHeatPoints() {
            setIsLoading(true);
            try {
                let query = supabase
                    .from('items')
                    .select('lat, lng, type, status, created_at')
                    .not('lat', 'is', null)
                    .not('lng', 'is', null);

                if (startDate) query = query.gte('created_at', `${startDate}T00:00:00Z`);
                if (endDate) query = query.lte('created_at', `${endDate}T23:59:59Z`);

                const { data: items, error } = await query;

                if (error) throw error;

                if (items && items.length > 0) {
                    const points: HeatPoint[] = items.map(item => ({
                        lat: item.lat!,
                        lng: item.lng!,
                        intensity: 5, // Misma notoriedad para todos
                        type: item.type === 'OFFICIAL_ALERT' ? 'OFFICIAL' : item.type === 'CIVIC_REPORT' ? 'ALERT' : 'TRANSACTION'
                    }));
                    setData(points);
                }
            } catch (err) {
                console.error("Error fetching heat points:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHeatPoints();
    }, []);

    const getColorByType = (type: string) => {
        switch (type) {
            case 'OFFICIAL': return '#6366f1'; // Indigo (Municipalidad)
            case 'ALERT': return '#ef4444'; // Rojo (Vecinos - Seguridad)
            case 'TRANSACTION': return '#22c55e'; // Verde (Vecinos - Economía)
            default: return '#94a3b8';
        }
    };

    return (
        <div className="w-full h-full min-h-[600px] rounded-[3rem] overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-2xl relative group bg-white dark:bg-slate-900">
            {isLoading ? (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 animate-pulse">
                        Agregando Datos Anonimizados...
                    </span>
                </div>
            ) : null}

            <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl w-64">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white">Motor Analítico</h3>
                            <p className="text-[9px] font-bold text-slate-400">Puntajes de Vitalidad Comunal</p>
                        </div>
                    </div>
                </div>
                <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <div className="text-[10px] font-black uppercase tracking-widest leading-none">
                        Privacidad RLS Blindada<br />
                        <span className="opacity-70 font-bold normal-case">Datos 100% anonimizados</span>
                    </div>
                </div>
            </div>

            <MapContainer
                center={[-33.4489, -70.7256]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {!isLoading && data.map((point, idx) => (
                    <CircleMarker
                        key={idx}
                        center={[point.lat, point.lng]}
                        radius={point.intensity * 4}
                        pathOptions={{
                            fillColor: getColorByType(point.type),
                            color: 'white',
                            weight: 1,
                            fillOpacity: 0.6
                        }}
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default ActivityHeatmap;
