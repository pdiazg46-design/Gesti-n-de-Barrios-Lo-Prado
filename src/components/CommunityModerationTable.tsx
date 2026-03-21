import React, { useState, useEffect } from 'react';
import { UserX, ShieldAlert, CheckCircle2, UserCheck, Trash2, Shield } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function CommunityModerationTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/community/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.profiles || []);
                setErrorMsg('');
            } else {
                setErrorMsg(data.error);
            }
        } catch (e) {
            setErrorMsg('Error de conexión obteniendo la red vecinal');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (targetUserId: string, targetEmail: string, action: 'WARN' | 'BAN' | 'UNBAN' | 'DELETE') => {
        const confirmMsg = 
            action === 'BAN' ? '¿Suspender el acceso a este vecino?' : 
            action === 'WARN' ? '¿Añadir un STRIKE a este vecino?' : 
            action === 'DELETE' ? 'Exilio total: ¿Eliminar y archivar definitivamente este usuario de la aplicación?' :
            '¿Perdonar y restaurar la cuenta de este vecino?';

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await fetch('/api/community/users/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId, targetEmail, action })
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers(); // reload list
            } else {
                alert('Denegado: ' + data.error);
            }
        } catch (e) {
            alert('Error de conexión ejecutando orden');
        }
    };

    if (loading) {
        return <div className="py-20 text-center animate-pulse text-indigo-400 font-bold tracking-widest uppercase text-xs">Cargando Red Vecinal...</div>;
    }

    if (errorMsg) {
         return <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-center border-2 border-red-100">{errorMsg}</div>;
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-black tracking-widest text-slate-500">
                    <tr>
                        <th className="px-6 py-4">Vecino (Email / Nombre)</th>
                        <th className="px-6 py-4 text-center">Faltas</th>
                        <th className="px-6 py-4 text-center">Estatus</th>
                        <th className="px-6 py-4 text-right">Mazo de Moderación</th>
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
                                    {u.is_community_admin && <span title="Admin Vecinal"><Shield className="w-3.5 h-3.5 text-indigo-500" /></span>}
                                </div>
                                <div className="text-xs text-slate-500">{u.email || u.id}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={cx(
                                    "px-2.5 py-1 rounded-lg font-black text-xs space-x-1",
                                    (u.warning_count || 0) === 0 ? "bg-slate-100 text-slate-500" :
                                    (u.warning_count || 0) < 3 ? "bg-amber-100 text-amber-600 shadow-sm" : "bg-red-600 text-white shadow-md animate-pulse"
                                )}>
                                    <span>{u.warning_count || 0}</span>
                                    <span className="opacity-50">/ 3</span>
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                {u.is_banned ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 px-2.5 py-1 rounded-lg">
                                        <UserX className="w-3.5 h-3.5" /> Suspendido
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 px-2.5 py-1 rounded-lg">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {!u.is_banned ? (
                                        <>
                                            <button 
                                                onClick={() => handleAction(u.id, u.email, 'WARN')}
                                                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors border border-amber-100"
                                                title="Añadir Strike"
                                            >
                                                <ShieldAlert className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleAction(u.id, u.email, 'BAN')}
                                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100"
                                                title="Suspender Acceso"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                        <button 
                                            onClick={() => handleAction(u.id, u.email, 'UNBAN')}
                                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200"
                                            title="Perdonar y Restaurar Cuenta"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                        </button>
                                        { (u.warning_count >= 3 || u.warning_count === 99) && (
                                            <button 
                                                onClick={() => handleAction(u.id, u.email, 'DELETE')}
                                                className="p-2 bg-black hover:bg-slate-800 text-white rounded-lg transition-colors shadow-lg active:scale-95"
                                                title="Eliminar Cuenta para Siempre (Tercer Strike Mínimo)"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">
                                Eres el primer vecino.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
