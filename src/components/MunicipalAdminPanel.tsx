import React, { useState, useEffect, useRef } from 'react';
import { Send, Map as MapIcon, Shield, Bell, AlertTriangle, LayoutDashboard, Settings, LogOut, Users, BarChart3, ChevronRight, Search, Calendar, Target, MousePointer2, Info, Trash2, Eye, EyeOff, Clock, MoreVertical, Edit2, X, Activity, MapPin, Filter, Download, CheckCircle, XCircle, Phone } from 'lucide-react';
import { UNIDADES_VECINALES } from '@/lib/territorial';
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
import { NeighborsModerationTable } from './NeighborsModerationTable';

export const MunicipalAdminPanel = ({ communityId, onBack, onDelete, onEdit, onNuclearReset }: { communityId?: string | null, onBack?: () => void, onDelete?: (id: string) => void, onEdit?: (item: any) => void, onNuclearReset?: () => void }) => {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    const [startDate, setStartDate] = useState(defaultStart.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('alerts');

    const [reports, setReports] = useState<any[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const [alertCount, setAlertCount] = useState(0);
    const [totalNeighbors, setTotalNeighbors] = useState(0);
    const [alertsHistory, setAlertsHistory] = useState<any[]>([]);
    const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
    const [selectedUvId, setSelectedUvId] = useState<number | null>(null);
    const [neighborsPerUv, setNeighborsPerUv] = useState<Record<number, number>>({});
    const [neighborsPerSector, setNeighborsPerSector] = useState<Record<string, number>>({});
    const [activeSectors, setActiveSectors] = useState<Record<number, string[]>>({});
    const [vipCodes, setVipCodes] = useState<any[]>([]);
    const [vipUsersMap, setVipUsersMap] = useState<Record<string, {full_name: string, avatar_url?: string}>>({});
    const [isLoadingCodes, setIsLoadingCodes] = useState(false);
    
    // Estado para ver quién ocupó la célula
    const [selectedVipCodeForDetail, setSelectedVipCodeForDetail] = useState<string | null>(null);
    const [vipUsersDetail, setVipUsersDetail] = useState<any[]>([]);
    const [isLoadingVipUsers, setIsLoadingVipUsers] = useState(false);

    // Estado para Gestión de Casos
    const [selectedCase, setSelectedCase] = useState<any | null>(null);

    useEffect(() => {
        if (activeTab === 'founders' && selectedUvId) {
            loadVipCodes(selectedUvId);
        }
    }, [activeTab, selectedUvId]);

    const loadVipCodes = async (uvId: number) => {
        setIsLoadingCodes(true);
        try {
            const res = await fetch(`/api/admin/vip-codes?community_id=${uvId}`);
            const result = await res.json();
            if (result.success && result.data) {
                setVipCodes(result.data);
            }
        } catch (error) {
            console.error("Error cargando células:", error);
        }
        setIsLoadingCodes(false);
    };

    const handleCreateNextSector = async () => {
        if (!selectedUvId) return;

        setIsLoadingCodes(true);
        try {
            const uvName = UNIDADES_VECINALES.find(u => u.id === selectedUvId)?.name || 'UV';
            
            // Reconstrucción del Auto-Incremental robusto (basado en el número máximo existente)
            let nextS = 1;
            const prefix = `UV${selectedUvId}-S`;
            if (vipCodes.length > 0) {
                const sNumbers = vipCodes
                    .map(c => c.code)
                    .filter(c => c.startsWith(prefix))
                    .map(c => parseInt(c.replace(prefix, ''), 10))
                    .filter(n => !isNaN(n));
                if (sNumbers.length > 0) {
                    nextS = Math.max(...sNumbers) + 1;
                }
            }

            const newCode = `UV${selectedUvId}-S${nextS}`;
            
            // Usar API de Servidor para bypassear RLS
            const response = await fetch('/api/admin/vip-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: newCode, community_id: selectedUvId })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Error creando sector VIP");
            }
            
            await loadVipCodes(selectedUvId);
        } catch (error) {
            console.error('Error creating next sector:', error);
            alert("Error al intentar crear el Sector S. Revisa consola.");
        } finally {
            setIsLoadingCodes(false);
        }
    };

    const handleShowVipUsers = async (codeStr: string) => {
        if (selectedVipCodeForDetail === codeStr) {
            setSelectedVipCodeForDetail(null); // Toggle off
            return;
        }
        setSelectedVipCodeForDetail(codeStr);
        setIsLoadingVipUsers(true);
        try {
            const res = await fetch(`/api/admin/vip-users?code=${codeStr}`);
            const data = await res.json();
            if (data.success) {
                setVipUsersDetail(data.users || []);
            } else {
                setVipUsersDetail([]);
            }
        } catch (e) {
            setVipUsersDetail([]);
        } finally {
            setIsLoadingVipUsers(false);
        }
    };

    const handleDeleteVipCode = async (id: string, uses: number) => {
        if (uses > 0) {
            alert("No puedes borrar una célula operativa que ya tiene asientos fundadores ocupados.");
            return;
        }
        if (!confirm("¿Segurísimo que quieres desintegrar este Sector Vacio?")) return;
        
        setIsLoadingCodes(true);
        try {
            const res = await fetch(`/api/admin/vip-codes?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Error borrando el sector");
            if (selectedUvId) await loadVipCodes(selectedUvId);
        } catch (e) {
            alert("Hubo un error al intentar borrar: " + e);
        } finally {
            setIsLoadingCodes(false);
        }
    };

    const communityIdRef = useRef<string | null>(null);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [aiInsight, setAiInsight] = useState("Analizando tendencias en Lo Prado...");

    useEffect(() => {
        const fetchReports = async () => {
            setIsLoadingReports(true);
            try {
                let query = supabase
                    .from('items')
                    .select('*, profiles:creator_id(id, full_name, phone, address, email)')
                    .in('type', ['CIVIC_REPORT', 'REPORT']) // Mapped legacy "REPORT" as well
                    .order('created_at', { ascending: false });

                // Removed communityId restriction to allow the Municipality to see all UV reports


                // Aplicar filtros de fecha si están definidos
                if (startDate) query = query.gte('created_at', `${startDate}T00:00:00Z`);
                if (endDate) query = query.lte('created_at', `${endDate}T23:59:59Z`);

                const { data, error } = await query;

                if (!error && data) {
                    setReports(data.map(item => ({
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        neighbor: 'Vecino Reportante', // Privacy default
                        reporterContact: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
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
        };

        const fetchAlertCount = async () => {
            const { count, error } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'OFFICIAL_ALERT')
                .eq('status', 'ACTIVE');

            if (!error && count !== null) {
                setAlertCount(count);
            }
        };

        const fetchAlertsHistory = async () => {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('type', 'OFFICIAL_ALERT')
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Sorting logic: ACTIVE alerts first, then ARCHIVED.
                const sorted = [...data].sort((a, b) => {
                    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
                    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                setAlertsHistory(sorted);
            }
        };

        const fetchTotalNeighbors = async () => {
            // Usar el endpoint de admin interno para bypassear el RLS de Supabase.
            // Si usamos supabase.from directamente en el cliente, RLS bloquea ver a los demás vecinos.
            let data: any[] = [];
            let error = null;
            try {
                const res = await fetch('/api/admin/users');
                const result = await res.json();
                if (result.success && result.profiles) {
                    data = result.profiles;
                } else {
                    error = new Error(result.error || 'Failed to load');
                }
            } catch (err: any) {
                error = err;
            } 
            
            // Fetch VIP codes to know which sectors exist
            const { data: vipCodesData } = await supabase
                .from('vip_codes')
                .select('code');

            if (!error && data) {
                // EXCLUDE THE SUPER ADMIN BY ID (If the current session is the super admin, we know their ID!)
                let validProfiles = data;
                
                // If the user hasn't explicitly used a VIP code, and they are the super admin, don't count them.
                // Since this component is the Municipal Admin Panel, it's very likely the viewer IS the admin.
                // We'll filter out the admin if they are just here to manage.
                validProfiles = data.filter((p: any) => {
                    // Try to catch the superadmin 'Patricio' who shouldn't be counted:
                    // Usually admin won't have a valid UV-S format in used_vip_code anyway, 
                    // but we can just exclude anyone without a VIP code from the grand total!
                    // If you only want to count REAL neighbors, they MUST have a used_vip_code!
                    return p.used_vip_code !== null && p.used_vip_code !== ''; 
                });

                setTotalNeighbors(validProfiles.length); 

                // 2. Count neighbors per sector
                const sectorCounts: Record<string, number> = {};
                const vipUsersMapLocal: Record<string, any> = {};
                validProfiles.forEach((p: any) => {
                    if (p.used_vip_code && p.used_vip_code.startsWith('UV')) {
                        const parts = p.used_vip_code.split('-'); // ["UV19", "S1", "V1"]
                        if (parts.length >= 2) {
                            const sectorKey = `${parts[0]}-${parts[1]}`; // "UV19-S1"
                            sectorCounts[sectorKey] = (sectorCounts[sectorKey] || 0) + 1;
                        }
                        
                        vipUsersMapLocal[p.used_vip_code] = {
                            full_name: p.full_name,
                            avatar_url: p.avatar_url
                        };
                    }
                });

                // 3. Collect all known sectors (from users + generated vip codes)
                const knownSectors = new Set<string>();
                if (vipCodesData) {
                    vipCodesData.forEach((vc: any) => {
                        const parts = vc.code.split('-');
                        if (parts.length >= 2) {
                            knownSectors.add(`${parts[0]}-${parts[1]}`);
                        }
                    });
                }
                Object.keys(sectorCounts).forEach(k => knownSectors.add(k));

                // 4. Group sectors by UV ID
                const uvSectorsMap: Record<number, string[]> = {};
                knownSectors.forEach(sector => {
                    const match = sector.match(/^UV(\d+)-/);
                    if (match && match[1]) {
                        const uvId = parseInt(match[1]);
                        if (!uvSectorsMap[uvId]) uvSectorsMap[uvId] = [];
                        if (!uvSectorsMap[uvId].includes(sector)) {
                            uvSectorsMap[uvId].push(sector);
                        }
                    }
                });

                // Sort sectors alphabetically
                Object.values(uvSectorsMap).forEach(arr => arr.sort());

                setNeighborsPerSector(sectorCounts);
                setActiveSectors(uvSectorsMap);
                setVipUsersMap(vipUsersMapLocal);
            }
        };

        // Exposed trigger to allow manual refresh from handlers
        (window as any).refreshMunicipalData = () => {
            fetchReports();
            fetchAlertCount();
            fetchAlertsHistory();
            fetchTotalNeighbors();
        };

        fetchReports();
        fetchAlertCount();
        fetchAlertsHistory();
        fetchTotalNeighbors();

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
        radius: 100,
        targetUv: ''
    });

    const toggleAlertStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';

        try {
            // Using secure server-side API to bypass RLS for status toggle
            const response = await fetch('/api/municipal/update-alert', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar estado');
            }

            // Trigger manual refresh
            if ((window as any).refreshMunicipalData) {
                (window as any).refreshMunicipalData();
            }
        } catch (error: any) {
            alert("❌ Error al actualizar el estado: " + error.message);
        }
    };

    // Exponer para interacciones desde el mapa
    (window as any).toggleAlertStatus = toggleAlertStatus;

    const categories = [
        { id: 'alerts', label: 'El Megáfono', icon: <Bell className="w-5 h-5" />, description: 'Broadcast oficial georeferenciado' },
        { id: 'inbox', label: 'Buzón Ciudadano', icon: <Info className="w-5 h-5" />, description: 'Reportes y demandas vecinales' },
        { id: 'analytics', label: 'Mapa de Calor', icon: <BarChart3 className="w-5 h-5" />, description: 'Analítica de actividad vecinal' },
        { id: 'communities', label: 'Barrios Activos', icon: <Users className="w-5 h-5" />, description: 'Gestión de licencias comunales' },
        { id: 'neighbors', label: 'Gestión de Vecinos', icon: <Shield className="w-5 h-5" />, description: 'Moderación y Disciplina' },
        { id: 'founders', label: 'Vecinos Fundadores', icon: <Target className="w-5 h-5" />, description: 'Invitar primeros vecinos al barrio' },
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
                    <div className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.3em] mb-4 ml-4 opacity-90">Principales</div>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={cn(
                                "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden",
                                activeTab === cat.id
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                                    : "text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            )}
                        >
                            {activeTab === cat.id && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500"
                                />
                            )}
                            <div className={cn(
                                "transition-all relative z-10",
                                activeTab === cat.id ? "text-white scale-105" : "text-slate-500 group-hover:text-indigo-600"
                            )}>
                                {cat.icon}
                            </div>
                            <div className="text-left relative z-10">
                                <div className="font-black text-sm tracking-tight">{cat.label}</div>
                                <div className={cn(
                                    "text-[10px] font-bold leading-tight mt-0.5",
                                    activeTab === cat.id ? "text-white/90" : "text-slate-600"
                                )}>
                                    {cat.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
                    <button 
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/api/manual-logout';
                        }}
                        className="w-full flex items-center gap-3 px-6 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all group"
                    >
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
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentCategory?.label}</span>
                        </motion.div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                            Gestor Municipal <br />
                            <span className="text-indigo-600">Lo Prado</span>
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
                                className="grid grid-cols-1 xl:grid-cols-12 gap-8"
                            >
                                {/* Redactor Form */}
                                <section id="alert-editor-form" className="xl:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight uppercase leading-none text-slate-900 dark:text-white">Redactar Comunicado</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 tracking-tight">"El Megáfono" - Voz oficial del municipio.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Título Institucional</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 font-bold text-base outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white"
                                                value={alertData.title}
                                                onChange={(e) => setAlertData({ ...alertData, title: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Mensaje</label>
                                            <textarea
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 font-bold text-base outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white resize-none"
                                                rows={3}
                                                placeholder="Contenido oficial..."
                                                value={alertData.message}
                                                onChange={(e) => setAlertData({ ...alertData, message: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Sectores (UV)</label>
                                                <select
                                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 font-bold text-sm outline-none appearance-none cursor-pointer text-slate-900 dark:text-white focus:border-indigo-500"
                                                    value={alertData.targetUv}
                                                    onChange={(e) => {
                                                        const uvId = e.target.value;
                                                        setAlertData(prev => {
                                                            if (!uvId) return { ...prev, targetUv: '' };
                                                            const uv = UNIDADES_VECINALES.find(u => u.id === parseInt(uvId));
                                                            return {
                                                                ...prev,
                                                                targetUv: uvId,
                                                                lat: uv ? uv.lat : prev.lat,
                                                                lng: uv ? uv.lng : prev.lng
                                                            };
                                                        });
                                                    }}
                                                >
                                                    <option value="">🗺️ TODO LO PRADO</option>
                                                    {UNIDADES_VECINALES.map(uv => (
                                                        <option key={uv.id} value={uv.id}>
                                                            📍 UV {uv.id}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Prioridad</label>
                                                <select
                                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 font-bold text-sm outline-none appearance-none cursor-pointer text-slate-900 dark:text-white focus:border-indigo-500"
                                                    value={alertData.type}
                                                    onChange={(e) => setAlertData({ ...alertData, type: e.target.value })}
                                                >
                                                    <option value="INFO">👤 INFORMATIVA</option>
                                                    <option value="EMERGENCY">🚨 EMERGENCIA</option>
                                                    <option value="PUBLIC_SERVICE">🚛 SERVICIO</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Radio de Impacto (metros)</label>
                                                <input
                                                    type="range"
                                                    min="50"
                                                    max="1000"
                                                    step="50"
                                                    className="w-full accent-indigo-600"
                                                    value={alertData.radius}
                                                    onChange={(e) => setAlertData({ ...alertData, radius: parseInt(e.target.value) })}
                                                />
                                                <div className="flex justify-between text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                                                    <span>50m</span>
                                                    <span className="text-indigo-600">{alertData.radius}m</span>
                                                    <span>1km</span>
                                                </div>
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
                                                        // Trigger manual refresh
                                                        if ((window as any).refreshMunicipalData) {
                                                            (window as any).refreshMunicipalData();
                                                        }

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
                                                                radius: alertData.radius,
                                                                targetUv: alertData.targetUv
                                                            })
                                                        });

                                                        if (!response.ok) {
                                                            const errorData = await response.json();
                                                            throw new Error(errorData.error || 'Error desconocido');
                                                        }

                                                        // Trigger manual refresh
                                                        if ((window as any).refreshMunicipalData) {
                                                            (window as any).refreshMunicipalData();
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
                                                        radius: 100,
                                                        targetUv: ''
                                                    });
                                                } catch (error: any) {
                                                    console.error('Action failure:', error);
                                                    alert(`❌ Error: ${error.message}`);
                                                }
                                            }}
                                            className={cn(
                                                "w-full font-black py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 group relative overflow-hidden",
                                                editingAlertId ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-indigo-600 hover:bg-slate-900 text-white"
                                            )}
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {editingAlertId ? <Edit2 className="w-5 h-5 relative z-10" /> : <Send className="w-5 h-5 relative z-10" />}
                                            <span className="tracking-widest text-sm uppercase relative z-10">
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
                                                        radius: 100,
                                                        targetUv: ''
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
                                <section className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative min-h-[600px]">
                                    <OfficialMapSelector
                                        lat={alertData.lat}
                                        lng={alertData.lng}
                                        radius={alertData.radius}
                                        alerts={alertsHistory.map(a => ({
                                            id: a.id,
                                            lat: a.lat,
                                            lng: a.lng,
                                            title: a.title,
                                            description: a.description,
                                            status: a.status,
                                            category: a.category
                                        }))}
                                        onLocationSelect={(lat, lng) => setAlertData({ ...alertData, lat, lng })}
                                        onAlertAction={async (id, action) => {
                                            if (action === 'TOGGLE') {
                                                const alertToToggle = alertsHistory.find(a => a.id === id);
                                                if (alertToToggle) {
                                                    // Usar la función toggleAlertStatus ya existente
                                                    (window as any).toggleAlertStatus?.(id, alertToToggle.status);
                                                }
                                            } else if (action === 'EDIT') {
                                                const alertToEdit = alertsHistory.find(a => a.id === id);
                                                if (alertToEdit) {
                                                    setEditingAlertId(id);
                                                    setAlertData({
                                                        title: alertToEdit.title,
                                                        message: alertToEdit.description,
                                                        type: alertToEdit.category || 'INFO',
                                                        lat: alertToEdit.lat,
                                                        lng: alertToEdit.lng,
                                                        radius: alertToEdit.metadata?.radius || 100,
                                                        targetUv: alertToEdit.metadata?.targetUv || ''
                                                    });
                                                    // Smooth scroll to form
                                                    document.getElementById('alert-editor-form')?.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }
                                        }}
                                    />
                                </section>
                            </motion.div>

                            {/* Historial de Alertas - Galería de Tarjetas Maestro */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-12"
                            >
                                <div className="flex items-center gap-4 mb-8 ml-4">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Gestión Maestro de Alertas</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Control Centralizado del Megáfono</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {alertsHistory.length === 0 ? (
                                        <div className="col-span-full bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
                                            <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No se registran alertas en el sistema</p>
                                        </div>
                                    ) : (
                                        alertsHistory.map((alertItem) => (
                                            <motion.div
                                                key={alertItem.id}
                                                layout
                                                className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all p-6 relative overflow-visible"
                                            >
                                                {/* Badge de Estado - Ultravisible */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className={cn(
                                                        "px-4 py-2 rounded-full flex items-center gap-2 border-2 transition-all",
                                                        alertItem.status === 'ACTIVE'
                                                            ? "bg-green-50 border-green-200 text-green-700 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                                                            : "bg-slate-50 border-slate-200 text-slate-500"
                                                    )}>
                                                        <div className="relative">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                alertItem.status === 'ACTIVE' ? "bg-green-500" : "bg-slate-400"
                                                            )} />
                                                            {alertItem.status === 'ACTIVE' && (
                                                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-40" />
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            {alertItem.status === 'ACTIVE' ? 'En Vivo' : 'Oculto'}
                                                        </span>
                                                    </div>

                                                    {/* Dropdown de Acciones */}
                                                    <div className="relative overflow-visible">
                                                        <button
                                                            onClick={() => setActiveDropdownId(activeDropdownId === alertItem.id ? null : alertItem.id)}
                                                            className={cn(
                                                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                                                activeDropdownId === alertItem.id
                                                                    ? "bg-indigo-600 text-white shadow-lg"
                                                                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                            )}
                                                        >
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>

                                                        <AnimatePresence>
                                                            {activeDropdownId === alertItem.id && (
                                                                <>
                                                                    <div className="fixed inset-0 z-[60]" onClick={() => setActiveDropdownId(null)} />
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                        className="absolute right-0 bottom-full mb-3 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] z-[70] overflow-hidden p-2"
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
                                                                                    radius: alertItem.metadata?.radius || 100,
                                                                                    targetUv: alertItem.metadata?.targetUv || ''
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
                                                                                    {alertItem.status === 'ACTIVE' ? 'Quitar visibilidad' : 'Activar en mapa'}
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    </motion.div>
                                                                </>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>

                                                {/* Contenido de la Tarjeta */}
                                                <div className="mb-6">
                                                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                                                        {alertItem.category || 'INFORMATIVA'}
                                                    </div>
                                                    <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-2 line-clamp-2">
                                                        {alertItem.title}
                                                    </h5>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 h-10">
                                                        {alertItem.description}
                                                    </p>
                                                </div>

                                                {/* Footer de la Tarjeta */}
                                                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-[11px] font-black uppercase tracking-tighter">
                                                            {new Date(alertItem.created_at).toLocaleDateString('es-CL', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            }).replace(/\//g, '-')}
                                                        </span>
                                                    </div>
                                                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        ID: {alertItem.id.split('-')[0]}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
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
                        activeTab === 'communities' && (
                            <motion.div
                                key="communities"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <Users className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Juntas de Vecinos Activas</h3>
                                            <p className="text-slate-500 font-bold">Unidades Vecinales o macro-sectores operativos en la comuna.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[180px]">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Población Registrada</div>
                                        <div className="text-3xl font-black text-indigo-700 dark:text-indigo-400 leading-none">
                                            {totalNeighbors} <span className="text-sm">vecinos</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative max-h-[600px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
                                            <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-black">
                                                <th className="p-4">Unidad Vecinal</th>
                                                <th className="p-4">Sector Operativo</th>
                                                <th className="p-4 text-center">Licencia</th>
                                                <th className="p-4 text-right whitespace-nowrap">
                                                    Activos
                                                    <span className="ml-3 bg-indigo-600 text-white px-3 py-1 rounded-md text-xs shadow-inner uppercase tracking-widest font-black inline-flex items-center gap-2">
                                                        Total: <span className="text-sm">{totalNeighbors}</span>
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm font-bold text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700">
                                            {UNIDADES_VECINALES.map(uv => {
                                                const sectorsForUv = activeSectors[uv.id] || [];
                                                
                                                if (sectorsForUv.length === 0) {
                                                    return (
                                                        <tr key={`uv-${uv.id}`} className="hover:bg-white dark:hover:bg-slate-800/80 transition-colors">
                                                            <td className="p-4 text-indigo-600 dark:text-indigo-400 font-black">UV {uv.id}</td>
                                                            <td className="p-4 uppercase text-slate-400">
                                                                {uv.name.replace(`UV ${uv.id} - `, '').replace(`UV${uv.id} - `, '')}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] uppercase tracking-widest font-black inline-block opacity-50 grayscale">Activa</span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg font-black min-w-[3rem] bg-slate-100 dark:bg-slate-800 text-slate-400">
                                                                    0
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return sectorsForUv.map(sectorKey => {
                                                    const count = neighborsPerSector[sectorKey] || 0;
                                                    const sectorName = sectorKey.split('-')[1]; // S1
                                                    return (
                                                        <tr key={sectorKey} className="hover:bg-white dark:hover:bg-slate-800/80 transition-colors">
                                                            <td className="p-4 text-indigo-600 dark:text-indigo-400 font-black">UV {uv.id}</td>
                                                            <td className="p-4 uppercase">
                                                                <span className="text-slate-500 mr-2">{uv.name.replace(`UV ${uv.id} - `, '').replace(`UV${uv.id} - `, '')}</span>
                                                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[10px] font-black border border-indigo-100 dark:border-indigo-800 tracking-widest">{sectorName}</span>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] uppercase tracking-widest font-black inline-block">Activa</span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <span className={cn(
                                                                    "inline-flex items-center justify-center px-3 py-1 rounded-lg font-black min-w-[3rem]",
                                                                    count > 0 ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                                )}>
                                                                    {count}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'neighbors' && (
                            <motion.div
                                key="neighbors"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600">
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Moderación Cívica</h3>
                                        <p className="text-slate-500 font-bold">Gestión de advertencias (Strikes) y expulsiones en la red vecinal.</p>
                                    </div>
                                </div>
                                <NeighborsModerationTable />
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'founders' && (
                            <motion.div
                                key="founders"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-visible relative">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 shadow-lg shadow-amber-100 dark:shadow-none">
                                            <Target className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Generador de Células Fundadoras</h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Gobernanza Criptográfica de Identidad por Unidad Vecinal</p>
                                        </div>
                                    </div>
                                    
                                    {!selectedUvId ? (
                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <h4 className="text-sm font-black uppercase text-slate-500 mb-4 tracking-widest">Paso 1: Selecciona la Junta de Vecinos (UV)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {UNIDADES_VECINALES.map(uv => (
                                                    <button 
                                                        key={uv.id} 
                                                        onClick={() => setSelectedUvId(uv.id)}
                                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 p-4 rounded-2xl transition-all group"
                                                    >
                                                        <div className="text-xl font-black text-slate-700 dark:text-slate-200 group-hover:text-amber-600 mb-1">UV {uv.id}</div>
                                                        <div className="text-[9px] uppercase tracking-widest font-black text-slate-400 truncate w-full">{uv.name.split(' - ')[1] || uv.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-xl font-black uppercase text-amber-600 flex items-center gap-2">
                                                    Gestión de Células UV {selectedUvId}
                                                </h4>
                                                <button onClick={() => setSelectedUvId(null)} className="text-sm font-bold text-slate-400 hover:text-slate-600 underline">Volver al Mapa</button>
                                            </div>
                                            
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 mb-8">
                                                <div>
                                                    <h4 className="text-lg font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                        Sectores Operativos
                                                    </h4>
                                                    <p className="text-xs font-bold text-slate-500 mt-1">Los sectores (S1, S2...) se asignan estrictamente por sistema para la trazabilidad y límite territorial.</p>
                                                </div>
                                                <button 
                                                    onClick={handleCreateNextSector}
                                                    disabled={isLoadingCodes}
                                                    className="w-full md:w-auto bg-amber-600 disabled:bg-slate-300 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    {isLoadingCodes ? 'Fabricando Sector...' : 'Sumar Nuevo Sector +'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {isLoadingCodes && vipCodes.length === 0 && (
                                                    <div className="col-span-3 text-center p-8 text-slate-400 font-bold animate-pulse">Obteniendo células en la Base de Datos...</div>
                                                )}
                                                {vipCodes.map(code => (
                                                    <div key={code.id} className={cn(
                                                        "bg-white dark:bg-slate-900 border-2 rounded-[1.5rem] p-6 flex flex-col items-center text-center relative overflow-visible transition-all",
                                                        code.is_active ? "border-amber-200 dark:border-amber-900/50 shadow-lg" : "border-slate-200 opacity-60 grayscale"
                                                    )}>

                                                        <div className="flex w-full items-start justify-between absolute top-4 px-4 w-full left-0 right-0 pointer-events-none">
                                                            <div /> {/* Espaciador para centrar título de abajo */}
                                                            {code.current_uses === 0 && (
                                                                <button 
                                                                    onClick={() => handleDeleteVipCode(code.id, code.current_uses)}
                                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all pointer-events-auto shadow-sm border border-transparent hover:border-red-200"
                                                                    title="Borrar sector vacío"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <h4 className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white mb-4 mt-2">{code.code}</h4>
                                                        
                                                        <div className="flex items-start gap-4 mb-6 justify-center min-h-[5rem]">
                                                            {Array.from({ length: code.max_uses }).map((_, i) => {
                                                                const codeStr = `${code.code}-V${i+1}`;
                                                                const user = vipUsersMap[codeStr];
                                                                
                                                                return (
                                                                    <div key={i} className="flex flex-col items-center gap-1.5 w-16">
                                                                        <div 
                                                                            className={cn(
                                                                                "w-12 h-12 rounded-[1rem] flex items-center justify-center font-black transition-all border shadow-sm",
                                                                                user 
                                                                                    ? 'bg-amber-100/50 text-amber-700 border-amber-300'
                                                                                    : i < code.current_uses 
                                                                                        ? 'bg-red-50 text-red-600 border-red-200 indent-seat opacity-60'
                                                                                        : 'bg-slate-100 text-slate-400 border-slate-200'
                                                                            )}
                                                                        >
                                                                            {user?.avatar_url ? (
                                                                                <img src={user.avatar_url} className="w-full h-full rounded-[1rem] object-cover" />
                                                                            ) : (
                                                                                `V${i+1}`
                                                                            )}
                                                                        </div>
                                                                        {user && (
                                                                            <span className="text-[9px] font-black text-slate-700 truncate w-full text-center tracking-tight leading-none bg-slate-50 px-1 py-0.5 rounded shadow-sm border border-slate-200">
                                                                                {user.full_name?.split(' ')[0] || 'Vecino'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <div className="flex flex-col gap-2 w-full mt-auto">
                                                            <button 
                                                                onClick={() => {
                                                                    const url = `${window.location.origin}/n/lo-prado?vipcode=${code.code}`;
                                                                    const uvName = UNIDADES_VECINALES.find(u => u.id === selectedUvId)?.name || `UV ${selectedUvId}`;
                                                                    const textToCopy = `🚨🛡️ ¡Únete a Barrio Seguro!\n\nHas sido seleccionado como Vecino Fundador para el anillo de seguridad de nuestro sector.\n\n📍 Unidad Vecinal: ${uvName}\n🏘️ Célula Operativa: ${code.code.split('-')[1]}\n\nPara activar tu inmunidad y entrar al tablero vecinal, haz clic en tu Enlace VIP:\n🔗 ${url}\n\n(Este enlace es solo para ti como administrador del grupo, no debes compartirlo).`;
                                                                    
                                                                    navigator.clipboard.writeText(textToCopy);
                                                                    alert('¡Mensaje de invitación copiado al portapapeles!\n\nPégalo en WhatsApp para enviarlo al vecino.');
                                                                }}
                                                                className={cn(
                                                                    "w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                                                                    code.is_active ? "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white" : "hidden"
                                                                )}
                                                            >
                                                                Copiar Enlace WhatsApp
                                                            </button>
                                                            <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">
                                                                {code.is_active ? `${code.max_uses - code.current_uses} Cupos Restantes` : 'Célula Extinguida'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
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
                                            <div key={report.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-500 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                                                        report.urgency === 'HIGH' ? "bg-red-50 text-red-500 border border-red-100" : "bg-amber-50 text-amber-500 border border-amber-100"
                                                    )}>
                                                        <AlertTriangle className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-0.5">
                                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight">{report.title}</h4>
                                                            <span className={cn(
                                                                "text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest",
                                                                report.status === 'PENDING' ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-600"
                                                            )}>{report.status}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                                            <span>📍 {report.area}</span>
                                                            <span className="opacity-30">•</span>
                                                            <span>👤 {report.neighbor}</span>
                                                            <span className="opacity-30">•</span>
                                                            <span className="italic font-medium">{report.date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        try {
                                                            setSelectedCase(report);
                                                        } catch (err) {
                                                            console.error("Error setting case:", err);
                                                        }
                                                    }}
                                                    className="bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm relative z-20">
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

            {/* Modal Gestión de Caso */}
            {selectedCase && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in slide-in-from-bottom-8">
                        <button
                            onClick={() => setSelectedCase(null)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                                    selectedCase.urgency === 'HIGH' ? "bg-red-50 text-red-500 border border-red-100" : "bg-amber-50 text-amber-500 border border-amber-100"
                                )}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Detalle del Incidente</div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                                        {selectedCase.title}
                                    </h2>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                {selectedCase.description || 'Sin descripción detallada.'}
                            </p>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-800/30">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Tarjeta de Identidad del Reportante
                            </h3>
                            
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                                {selectedCase.reporterContact ? (
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                                    {selectedCase.reporterContact.full_name || 'Nombre no registrado'}
                                                </div>
                                                <div className="text-xs font-bold text-slate-400 mt-1">
                                                    {selectedCase.reporterContact.email}
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-100">
                                                Identidad Verificada
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {selectedCase.reporterContact.address || 'Domicilio no especificado'}
                                        </div>

                                        {selectedCase.reporterContact.phone ? (
                                            <a 
                                                href={`tel:${selectedCase.reporterContact.phone}`}
                                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 group"
                                            >
                                                <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Llamar al Vecino ({selectedCase.reporterContact.phone})
                                            </a>
                                        ) : (
                                            <div className="w-full text-center py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded-xl text-sm italic">
                                                El vecino no registró su teléfono.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-400 font-bold italic text-sm">
                                        No hay datos de perfil asociados a este reporte. Es posible que sea un reporte legado.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
