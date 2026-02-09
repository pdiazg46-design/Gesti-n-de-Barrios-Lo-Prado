import React, { useState, useEffect } from 'react';
import { Send, Map as MapIcon, Shield, Bell, AlertTriangle, LayoutDashboard, Settings, LogOut, Users, BarChart3, ChevronRight, Search, Calendar, Target, MousePointer2, Info, Trash2, Eye, EyeOff, Clock, MoreVertical, Edit2, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ActivityHeatmap = dynamic(() => import('./ActivityHeatmap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[3rem]" />
});

const OfficialMapSelector = dynamic(() => import('./OfficialMapSelector'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[4rem]" />
});

import { supabase } from '@/lib/supabase';

export const MunicipalAdminPanel = ({ communityId }: { communityId?: string | null }) => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('alerts');

    const [reports, setReports] = useState<any[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const [alertCount, setAlertCount] = useState(0);
    const [alertsHistory, setAlertsHistory] = useState<any[]>([]);
    const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

    // Filtros de fecha
    const [aiInsight, setAiInsight] = useState("Analizando tendencias en Lo Prado...");

    useEffect(() => {
        async function fetchReports() {
            setIsLoadingReports(true);
            try {
                let query = supabase
                    .from('items')
                    .select('*')
                    .eq('type', 'CIVIC_REPORT')
                    .order('created_at', { ascending: false });

                if (communityId) {
                    query = query.eq('community_id', communityId);
                }

                // Aplicar filtros de fecha si están definidos
                if (startDate) query = query.gte('created_at', `${startDate}T00:00:00Z`);
                if (endDate) query = query.lte('created_at', `${endDate}T23:59:59Z`);

                const { data, error } = await query;

                if (!error && data) {
                    setReports(data.map(item => ({
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        neighbor: item.author_email || 'Vecino',
                        area: 'LO PRADO',
                        status: item.status === 'AVAILABLE' ? 'PENDING' : 'RESOLVED',
                        urgency: 'MEDIUM',
                        date: new Date(item.created_at).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }).replace(/\//g, '-') + ' ' + new Date(item.created_at).toLocaleTimeString('es-CL', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        })
                    })));

                    // Generar AI Insight simple basado en datos
                    if (data.length > 0) {
                        setAiInsight(`Se detectan ${data.length} reportes en el periodo seleccionado. Foco principal: Infraestructura vial en zona norte.`);
                    } else {
                        setAiInsight("No hay reportes en este rango. La comuna se mantiene sin incidencias reportadas.");
                    }
                }
            } catch (err) {
                console.error("Error fetching reports:", err);
            } finally {
                setIsLoadingReports(false);
            }
        }

        async function fetchAlertCount() {
            const { count, error } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'OFFICIAL_ALERT');

            if (!error && count !== null) {
                setAlertCount(count);
            }
        }

        async function fetchAlertsHistory() {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('type', 'OFFICIAL_ALERT')
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Sorting logic: ACTIVE alerts first, then ARCHIVED.
                // Within each category, sort by date descending (latest first).
                const sorted = [...data].sort((a, b) => {
                    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
                    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                setAlertsHistory(sorted);
            }
        }

        fetchReports();
        fetchAlertCount();
        fetchAlertsHistory();

        // 3. Suscribirse a cambios en tiempo real
        const channel = supabase
            .channel('items-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'items'
            }, () => {
                console.log("🔄 Cambio detectado en tiempo real, recargando...");
                fetchReports();
                fetchAlertCount();
                fetchAlertsHistory();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [startDate, endDate, activeTab, communityId]);

    const [alertData, setAlertData] = useState({
        title: '',
        message: '',
        type: 'INFO',
        lat: -33.4489,
        lng: -70.7256,
        radius: 100
    });

    const toggleAlertStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
        const { error } = await supabase
            .from('items')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert("❌ Error al actualizar el estado de la alerta: " + error.message);
        }
    };

    const categories = [
        { id: 'alerts', label: 'El Megáfono', icon: <Bell className="w-5 h-5" />, description: 'Broadcast oficial georeferenciado' },
        { id: 'inbox', label: 'Buzón Ciudadano', icon: <Info className="w-5 h-5" />, description: 'Reportes y demandas vecinales' },
        { id: 'analytics', label: 'Mapa de Calor', icon: <BarChart3 className="w-5 h-5" />, description: 'Analítica de actividad vecinal' },
        { id: 'communities', label: 'Barrios Activos', icon: <Users className="w-5 h-5" />, description: 'Gestión de licencias comunales' },
    ];

    const currentCategory = categories.find(c => c.id === activeTab);

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
            {/* Sidebar */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col shrink-0 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.02)]"
            >
                <div className="p-10 pb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                            <Shield className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="font-black text-2xl tracking-tighter leading-none mb-1 text-slate-900 dark:text-white">MUNICIPAL</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Sistema de Gestión</span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-3 overflow-y-auto no-scrollbar">
                    <div className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.3em] mb-4 ml-4 opacity-80">Principales</div>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-5 py-4 rounded-[2rem] transition-all group relative overflow-hidden",
                                activeTab === cat.id
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 active:scale-[0.98]"
                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            )}
                        >
                            {activeTab === cat.id && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"
                                />
                            )}
                            <div className={cn(
                                "transition-all relative z-10",
                                activeTab === cat.id ? "text-white scale-110" : "text-slate-400 group-hover:text-indigo-600"
                            )}>
                                {cat.icon}
                            </div>
                            <div className="text-left relative z-10">
                                <div className="font-black text-base tracking-tight">{cat.label}</div>
                                <div className={cn(
                                    "text-xs font-bold leading-tight mt-1",
                                    activeTab === cat.id ? "text-white" : "text-slate-600 dark:text-slate-400"
                                )}>
                                    {cat.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
                    <button className="w-full flex items-center gap-3 px-6 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-xs uppercase tracking-widest">Cerrar Sesión</span>
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 relative bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-3xl scroll-smooth no-scrollbar">
                <header className="flex justify-between items-end mb-12 border-b border-slate-200/50 dark:border-slate-800/50 pb-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-slate-900 dark:text-slate-100 text-sm font-black uppercase tracking-[0.3em] mb-3"
                        >
                            <LayoutDashboard className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                            <span>Panel Alcaldía</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-indigo-800 dark:text-indigo-200 bg-indigo-200 dark:bg-indigo-900 px-4 py-1.5 rounded-full shadow-md font-black">{currentCategory?.label}</span>
                        </motion.div>
                        <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">
                            Gestor Municipal <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 underline decoration-indigo-500/20 decoration-8 underline-offset-[12px]">Lo Prado</span>
                        </h2>
                    </div>

                    <div className="flex gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-6">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Desde</div>
                                <div className="relative group">
                                    <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                        {startDate.split('-').reverse().join('-')}
                                        <Calendar className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </div>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Hasta</div>
                                <div className="relative group">
                                    <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                        {endDate.split('-').reverse().join('-')}
                                        <Calendar className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl text-right min-w-[140px]">
                            <div className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Alertas Enviadas</div>
                            <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{alertCount}</div>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'alerts' && (
                        <>
                            <motion.div
                                key="alerts"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 xl:grid-cols-12 gap-12"
                            >
                                {/* Redactor Form */}
                                <section className="xl:col-span-5 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="p-5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-[2rem]">
                                            <Bell className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">Redactar Comunicado</h3>
                                            <p className="text-lg text-slate-900 dark:text-slate-100 font-extrabold mt-2 underline decoration-indigo-500/40 underline-offset-4">"El Megáfono" - Voz oficial del municipio.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] block mb-3 ml-2 border-l-4 border-indigo-600 pl-3">Título Institucional</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 rounded-3xl px-8 py-6 font-black text-xl outline-none transition-all placeholder:text-slate-500 dark:text-slate-300 focus:border-indigo-700 text-slate-900 dark:text-white shadow-inner"
                                                value={alertData.title}
                                                onChange={(e) => setAlertData({ ...alertData, title: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] block mb-3 ml-2 border-l-4 border-indigo-600 pl-3">Mensaje</label>
                                            <textarea
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 rounded-3xl px-8 py-6 font-black text-lg outline-none transition-all placeholder:text-slate-500 dark:text-slate-300 focus:border-indigo-700 text-slate-900 dark:text-white shadow-inner resize-none"
                                                rows={4}
                                                placeholder="Escribe el mensaje completo de la alerta..."
                                                value={alertData.message}
                                                onChange={(e) => setAlertData({ ...alertData, message: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] block mb-3 ml-2 border-l-4 border-indigo-600 pl-3">Prioridad</label>
                                                <select
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 rounded-3xl px-6 py-6 font-black outline-none appearance-none cursor-pointer text-slate-900 dark:text-white focus:border-indigo-700 shadow-inner"
                                                    value={alertData.type}
                                                    onChange={(e) => setAlertData({ ...alertData, type: e.target.value })}
                                                >
                                                    <option value="INFO">👤 INFORMATIVA</option>
                                                    <option value="EMERGENCY">🚨 EMERGENCIA</option>
                                                    <option value="PUBLIC_SERVICE">🚛 SERVICIO</option>
                                                    <option value="EVENT">🎉 EVENTO</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] block mb-3 ml-2 border-l-4 border-indigo-600 pl-3">Radio (m)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 rounded-3xl px-8 py-6 font-black outline-none text-slate-900 dark:text-white focus:border-indigo-700 shadow-inner"
                                                    value={alertData.radius}
                                                    onChange={(e) => setAlertData({ ...alertData, radius: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={async () => {
                                                try {
                                                    if (editingAlertId) {
                                                        // UPDATE Logic via Secure Server-side API (Bypass RLS)
                                                        const response = await fetch('/api/municipal/update-alert', {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                id: editingAlertId,
                                                                title: alertData.title,
                                                                description: alertData.message,
                                                                category: alertData.type,
                                                                lat: alertData.lat,
                                                                lng: alertData.lng,
                                                                metadata: {
                                                                    ...alertData,
                                                                    updated_at: new Date().toISOString(),
                                                                    is_official: true
                                                                }
                                                            })
                                                        });

                                                        if (!response.ok) {
                                                            const errorData = await response.json();
                                                            throw new Error(errorData.error || 'Error al actualizar alerta');
                                                        }

                                                        alert('✅ Alerta actualizada correctamente.');
                                                        setEditingAlertId(null);
                                                    } else {
                                                        // CREATE Logic
                                                        const response = await fetch('/api/municipal/send-alert', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                title: alertData.title,
                                                                message: alertData.message || `Alerta de tipo ${alertData.type}`,
                                                                type: alertData.type,
                                                                lat: alertData.lat,
                                                                lng: alertData.lng,
                                                                radius: alertData.radius
                                                            })
                                                        });

                                                        if (!response.ok) {
                                                            const errorData = await response.json();
                                                            throw new Error(errorData.error || 'Error desconocido');
                                                        }
                                                        alert('✅ Alerta oficial publicada correctamente.');
                                                    }

                                                    // Limpiar formulario
                                                    setAlertData({
                                                        title: '',
                                                        message: '',
                                                        type: 'INFO',
                                                        lat: -33.4489,
                                                        lng: -70.7256,
                                                        radius: 100
                                                    });
                                                } catch (error: any) {
                                                    console.error('Action failure:', error);
                                                    alert(`❌ Error: ${error.message}`);
                                                }
                                            }}
                                            className={cn(
                                                "w-full font-black py-7 rounded-[2.5rem] transition-all shadow-xl flex items-center justify-center gap-4 group",
                                                editingAlertId ? "bg-amber-600 hover:bg-black text-white" : "bg-indigo-600 hover:bg-black text-white"
                                            )}
                                        >
                                            {editingAlertId ? <Edit2 className="w-7 h-7" /> : <Send className="w-7 h-7" />}
                                            <span className="tracking-[0.2em] text-xl uppercase">
                                                {editingAlertId ? 'Guardar Cambios' : 'Lanzar Alerta'}
                                            </span>
                                        </motion.button>
                                        {editingAlertId && (
                                            <button
                                                onClick={() => {
                                                    setEditingAlertId(null);
                                                    setAlertData({
                                                        title: '',
                                                        message: '',
                                                        type: 'INFO',
                                                        lat: -33.4489,
                                                        lng: -70.7256,
                                                        radius: 100
                                                    });
                                                }}
                                                className="w-full py-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-red-500 transition-colors"
                                            >
                                                Cancelar Edición
                                            </button>
                                        )}
                                    </div>


                                </section>

                                {/* Map Selector */}
                                <section className="xl:col-span-7 bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative min-h-[600px]">
                                    <OfficialMapSelector
                                        lat={alertData.lat}
                                        lng={alertData.lng}
                                        radius={alertData.radius}
                                        onLocationSelect={(lat, lng) => setAlertData({ ...alertData, lat, lng })}
                                    />
                                </section>
                            </motion.div>

                            {/* Historial de Alertas - Tabla de Ancho Completo */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden mb-12"
                            >
                                <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Historial Maestro de Alertas</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Gestión Unificada del Megáfono Municipal</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estado</th>
                                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Título del Comunicado</th>
                                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha Emisión</th>
                                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                                            {alertsHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">No se registran alertas en el sistema</td>
                                                </tr>
                                            ) : (
                                                alertsHistory.map((alertItem) => (
                                                    <tr key={alertItem.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative">
                                                                    <div className={cn(
                                                                        "w-2.5 h-2.5 rounded-full relative z-10",
                                                                        alertItem.status === 'ACTIVE' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-slate-300"
                                                                    )} />
                                                                    {alertItem.status === 'ACTIVE' && (
                                                                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-20" />
                                                                    )}
                                                                </div>
                                                                <span className={cn(
                                                                    "text-[10px] font-black uppercase tracking-widest",
                                                                    alertItem.status === 'ACTIVE' ? "text-green-600" : "text-slate-400 font-bold"
                                                                )}>
                                                                    {alertItem.status === 'ACTIVE' ? 'Visible' : 'Oculto'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm max-w-md truncate">
                                                                {alertItem.title}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                                Tipo: {alertItem.category || 'INFO'}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
                                                                {new Date(alertItem.created_at).toLocaleDateString('es-CL', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                }).replace(/\//g, '-')}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right overflow-visible">
                                                            <div className="relative inline-block text-left">
                                                                <button
                                                                    onClick={() => setActiveDropdownId(activeDropdownId === alertItem.id ? null : alertItem.id)}
                                                                    className={cn(
                                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                                        activeDropdownId === alertItem.id
                                                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                                                            : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                                                    )}
                                                                >
                                                                    <MoreVertical className="w-5 h-5" />
                                                                </button>

                                                                <AnimatePresence>
                                                                    {activeDropdownId === alertItem.id && (
                                                                        <>
                                                                            <div className="fixed inset-0 z-[60]" onClick={() => setActiveDropdownId(null)} />
                                                                            <motion.div
                                                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                                className="absolute right-0 mt-3 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] z-[70] overflow-hidden p-2"
                                                                            >
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingAlertId(alertItem.id);
                                                                                        setAlertData({
                                                                                            title: alertItem.title,
                                                                                            message: alertItem.description,
                                                                                            type: alertItem.category || 'INFO',
                                                                                            lat: alertItem.lat,
                                                                                            lng: alertItem.lng,
                                                                                            radius: alertItem.metadata?.radius || 100
                                                                                        });
                                                                                        setActiveDropdownId(null);
                                                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                                    }}
                                                                                    className="w-full p-4 flex items-center gap-4 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-left group"
                                                                                >
                                                                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                                                        <Edit2 className="w-5 h-5" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Editar Alerta</div>
                                                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Modificar contenido</div>
                                                                                    </div>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        toggleAlertStatus(alertItem.id, alertItem.status);
                                                                                        setActiveDropdownId(null);
                                                                                    }}
                                                                                    className="w-full p-4 flex items-center gap-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
                                                                                >
                                                                                    <div className={cn(
                                                                                        "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                                                                                        alertItem.status === 'ACTIVE'
                                                                                            ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600"
                                                                                            : "bg-green-100 dark:bg-green-900/50 text-green-600"
                                                                                    )}>
                                                                                        {alertItem.status === 'ACTIVE' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                                                            {alertItem.status === 'ACTIVE' ? 'Ocultar Alerta' : 'Mostrar Alerta'}
                                                                                        </div>
                                                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                                                            {alertItem.status === 'ACTIVE' ? 'Quitar visibilidad pública' : 'Activar visualización'}
                                                                                        </div>
                                                                                    </div>
                                                                                </button>
                                                                            </motion.div>
                                                                        </>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </>
                    )}

                    {
                        activeTab === 'analytics' && (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                                <section className="lg:col-span-3 h-[60vh] relative rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                                    <ActivityHeatmap startDate={startDate} endDate={endDate} />
                                </section>
                                <section className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
                                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-[1.5rem] flex items-center justify-center mb-6">
                                        <BarChart3 className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tighter uppercase mb-4 text-slate-900 dark:text-white">Motor Analítico</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 flex-1">
                                        Análisis automático de reportes ciudadanos y actividad vecinal mediante IA.
                                    </p>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 italic text-slate-700 dark:text-slate-300 font-medium">
                                        "{aiInsight}"
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Vital Comunal</div>
                                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">Óptimo</div>
                                    </div>
                                </section>
                            </div>
                        )
                    }

                    {
                        activeTab === 'inbox' && (
                            <motion.div
                                key="inbox"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 gap-4">
                                    {isLoadingReports ? (
                                        <div className="p-10 text-center text-slate-400 font-bold italic animate-pulse">Cargando reportes del barrio...</div>
                                    ) : reports.length === 0 ? (
                                        <div className="p-10 text-center text-slate-400 font-bold italic">No hay reportes pendientes.</div>
                                    ) : (
                                        reports.map((report) => (
                                            <div key={report.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between group hover:border-indigo-500 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                                                        report.urgency === 'HIGH' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                                                    )}>
                                                        <AlertTriangle className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tighter">{report.title}</h4>
                                                            <span className={cn(
                                                                "text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                                report.status === 'PENDING' ? "bg-slate-200 text-slate-600" : "bg-green-100 text-green-700"
                                                            )}>{report.status}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                                                            <span>📍 {report.area}</span>
                                                            <span>👤 {report.neighbor}</span>
                                                            <span className="italic">{report.date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="bg-slate-100 dark:bg-slate-800 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                    Gestionar Caso
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                            </motion.div>
                        )
                    }
                </AnimatePresence >
            </main >
        </div >
    );
};
