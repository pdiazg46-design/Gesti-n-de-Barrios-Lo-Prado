import React, { useState, useEffect } from 'react';
import { UserX, ShieldAlert, CheckCircle2, UserCheck, Shield, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function NeighborsModerationTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOnlyOffenders, setShowOnlyOffenders] = useState(false);
    
    // Filtros
    const [filterUv, setFilterUv] = useState<string>('');
    const [filterSector, setFilterSector] = useState<string>('');
    const [filterSeat, setFilterSeat] = useState<string>('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setUsers(data.profiles || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (targetUserId: string, targetEmail: string, action: 'MAKE_ADMIN' | 'REMOVE_ADMIN' | 'DELETE_USER') => {
        const confirmMsg = action === 'MAKE_ADMIN' ? '¿Otorgar poderes de moderador a este vecino?' : 
                           action === 'DELETE_USER' ? `🚨 MODO PRUEBA: ¿Borrar por completo al usuario ${targetEmail || targetUserId} de la base de datos?` :
                           '¿Revocar poderes de moderador a este vecino?';
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await fetch('/api/admin/users/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId, targetEmail, action })
            });
            const data = await res.json();
            if (data.success) {
                alert('Acción aplicada con éxito.');
                fetchUsers(); // reload list
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) {
            alert('Error de conexión');
        }
    };

    if (loading) {
        return <div className="py-20 text-center animate-pulse text-slate-400 font-bold">Cargando vecinos...</div>;
    }

    // Opciones Únicas para los Selects
    const uniqueUvs = Array.from(new Set(users.map(u => {
        const m = u.used_vip_code?.match(/UV(\d+)-S(\d+)/);
        return m ? m[1] : null;
    }).filter(Boolean))).sort((a,b) => Number(a) - Number(b));
    
    const uniqueSectors = Array.from(new Set(users.map(u => {
        if(filterUv && u.used_vip_code && !u.used_vip_code.startsWith(`UV${filterUv}-`)) return null;
        const m = u.used_vip_code?.match(/UV(\d+)-S(\d+)/);
        return m ? m[2] : null;
    }).filter(Boolean))).sort((a,b) => Number(a) - Number(b));
    
    const uniqueSeats = Array.from(new Set(users.map(u => {
        let u_uv = '', u_sec = '';
        const m = u.used_vip_code?.match(/UV(\d+)-S(\d+)/);
        if (m) { u_uv = m[1]; u_sec = m[2]; }
        if(filterUv && u_uv !== filterUv) return null;
        if(filterSector && u_sec !== filterSector) return null;
        return u.seat_number ? String(u.seat_number) : null;
    }).filter(Boolean))).sort((a,b) => Number(a) - Number(b));

    const displayedUsers = users.filter(u => {
        if (showOnlyOffenders && (u.warning_count || 0) === 0 && !u.is_banned) return false;
        
        let u_uv = '';
        let u_sec = '';
        if (u.used_vip_code) {
             const m = u.used_vip_code.match(/UV(\d+)-S(\d+)/);
             if (m) { u_uv = m[1]; u_sec = m[2]; }
        }
        
        if (filterUv && u_uv !== filterUv) return false;
        if (filterSector && u_sec !== filterSector) return false;
        if (filterSeat && String(u.seat_number || '') !== filterSeat) return false;
        
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Filter className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Filtros:</span>
                    </div>
                    
                    <select 
                        value={filterUv} 
                        onChange={e => {setFilterUv(e.target.value); setFilterSector(''); setFilterSeat('');}}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none hover:border-indigo-400 transition-colors cursor-pointer"
                    >
                        <option value="">Todas las UV</option>
                        {uniqueUvs.map(uv => <option key={uv as string} value={uv as string}>Unidad V. {uv}</option>)}
                    </select>

                    <select 
                        value={filterSector} 
                        onChange={e => {setFilterSector(e.target.value); setFilterSeat('');}}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none hover:border-indigo-400 transition-colors cursor-pointer"
                        disabled={!uniqueSectors.length}
                    >
                        <option value="">Todos los Sectores</option>
                        {uniqueSectors.map(sec => <option key={sec as string} value={sec as string}>Sector {sec}</option>)}
                    </select>

                    <select 
                        value={filterSeat} 
                        onChange={e => setFilterSeat(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none hover:border-indigo-400 transition-colors cursor-pointer"
                        disabled={!uniqueSeats.length}
                    >
                        <option value="">Cualquier Asiento</option>
                        {uniqueSeats.map(seat => <option key={seat as string} value={seat as string}>Vecino {seat}</option>)}
                    </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <input 
                        type="checkbox" 
                        checked={showOnlyOffenders} 
                        onChange={(e) => setShowOnlyOffenders(e.target.checked)} 
                        className="w-4 h-4 accent-red-500 rounded"
                    />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hidden sm:inline">
                        Solo Infractores
                    </span>
                </label>
            </div>
            
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-black tracking-widest text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Vecino / Contacto</th>
                            <th className="px-6 py-4">Unidad Vecinal</th>
                            <th className="px-6 py-4">Sector Operativo</th>
                            <th className="px-6 py-4 text-center">N° Vecino</th>
                            <th className="px-6 py-4 text-center">Faltas</th>
                            <th className="px-6 py-4 text-center">Rol en el Barrio</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {displayedUsers.map(u => {
                            let u_uv = '-', u_sec = '-', u_seat = '-';
                            if (u.used_vip_code) {
                                const match = u.used_vip_code.match(/UV(\d+)-S(\d+)/);
                                if (match) {
                                    u_uv = match[1];
                                    u_sec = match[2];
                                } else {
                                    u_uv = u.used_vip_code;
                                }
                            }
                            if (u.seat_number) u_seat = String(u.seat_number);

                            return (
                                <tr key={u.id} className={cx(
                                    "bg-white dark:bg-slate-900 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30",
                                    u.is_banned && "opacity-60 bg-red-50/50 dark:bg-red-900/10"
                                )}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {u.full_name || 'Sin Nombre'}
                                            {u.is_community_admin && <Shield className="w-3.5 h-3.5 text-indigo-500" />}
                                        </div>
                                        <div className="text-xs text-slate-500 flex flex-col mt-0.5">
                                            <span>{u.email || u.id}</span>
                                            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-1">
                                                Ingresó: {u.created_at ? new Date(u.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {u_uv !== '-' ? (
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black tracking-widest text-[10px] uppercase rounded border border-indigo-100 dark:border-indigo-800">
                                                UV {u_uv}
                                            </span>
                                        ) : <span className="text-slate-300">-</span>}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {u_sec !== '-' ? (
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                Sector {u_sec}
                                            </span>
                                        ) : <span className="text-slate-300">-</span>}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        {u_seat !== '-' ? (
                                            <span className="font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                                V {u_seat}
                                            </span>
                                        ) : <span className="text-slate-300">-</span>}
                                    </td>

                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className={cx(
                                            "px-2.5 py-1 rounded-lg font-black text-xs inline-block",
                                            (u.warning_count || 0) === 0 ? "bg-slate-100 text-slate-500" :
                                            (u.warning_count || 0) < 3 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                                        )}>
                                            {u.warning_count || 0}/3
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        {u.is_banned ? (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                                                <UserX className="w-3 h-3" /> Bloqueado
                                            </span>
                                        ) : u.is_community_admin ? (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                                <Shield className="w-3 h-3" /> Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                <CheckCircle2 className="w-3 h-3" /> Vecino
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2">
                                            {!u.is_banned && (
                                                u.is_community_admin ? (
                                                    <button 
                                                        onClick={() => handleAction(u.id, u.email, 'REMOVE_ADMIN')}
                                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Quitar
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleAction(u.id, u.email, 'MAKE_ADMIN')}
                                                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Ascender
                                                    </button>
                                                )
                                            )}
                                            <button 
                                                onClick={() => handleAction(u.id, u.email, 'DELETE_USER')}
                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-1 opacity-80 hover:opacity-100"
                                                title="Borrar completamente de Auth/DB para hacer pruebas"
                                            >
                                                <UserX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {displayedUsers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold bg-slate-50 dark:bg-slate-800/50">
                                    {showOnlyOffenders ? 'No hay infractores activos actualmente en el radar.' : 'No se encontraron registros bajo este filtro.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
