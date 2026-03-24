import React, { useState, useEffect } from 'react';
import { UserX, ShieldAlert, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function NeighborsModerationTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
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

    const handleAction = async (targetUserId: string, targetEmail: string, action: 'MAKE_ADMIN' | 'REMOVE_ADMIN') => {
        const confirmMsg = action === 'MAKE_ADMIN' ? '¿Otorgar poderes de moderador a este vecino?' : '¿Revocar poderes de moderador a este vecino?';
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

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-black tracking-widest text-slate-500">
                    <tr>
                        <th className="px-6 py-4">Vecino (Email / Nombre)</th>
                        <th className="px-6 py-4 text-center">Faltas Reales</th>
                        <th className="px-6 py-4 text-center">Rol en el Barrio</th>
                        <th className="px-6 py-4 text-right">Delegación de Poder</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {users.map(u => (
                        <tr key={u.id} className={cx(
                            "bg-white dark:bg-slate-900 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30",
                            u.is_banned && "opacity-60 bg-red-50/50 dark:bg-red-900/10"
                        )}>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {u.full_name || 'Sin Nombre'}
                                    {u.is_community_admin && <Shield className="w-3.5 h-3.5 text-indigo-500" />}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                    <span>{u.email || u.id}</span>
                                    {u.used_vip_code && (
                                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black tracking-widest text-[9px] uppercase rounded border border-indigo-100 dark:border-indigo-800">
                                            {u.used_vip_code}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={cx(
                                    "px-2.5 py-1 rounded-lg font-black text-xs",
                                    (u.warning_count || 0) === 0 ? "bg-slate-100 text-slate-500" :
                                    (u.warning_count || 0) < 3 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                                )}>
                                    {u.warning_count || 0} / 3
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                {u.is_banned ? (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                                        <UserX className="w-3 h-3" /> Bloqueado
                                    </span>
                                ) : u.is_community_admin ? (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                        <Shield className="w-3 h-3" /> Admin Vecinal
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                        <CheckCircle2 className="w-3 h-3" /> Vecino
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {!u.is_banned && (
                                        u.is_community_admin ? (
                                            <button 
                                                onClick={() => handleAction(u.id, u.email, 'REMOVE_ADMIN')}
                                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Quitar Permisos
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAction(u.id, u.email, 'MAKE_ADMIN')}
                                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Hacer Moderador
                                            </button>
                                        )
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">
                                No hay usuarios registrados o error cargando base de datos.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
