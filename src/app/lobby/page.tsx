"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, Users, PlusCircle, Shield, Loader2, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Helper array for UVs
const UNIDADES_VECINALES = Array.from({ length: 45 }, (_, i) => i + 1);

export default function LobbyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [selectedUv, setSelectedUv] = useState<number | null>(null);
    const [existingGroups, setExistingGroups] = useState<any[]>([]);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
        
        if (status === 'authenticated' && session?.user?.email) {
            checkUserCommunity();
        }
    }, [status, session]);

    const checkUserCommunity = async () => {
        try {
            // Check if user already has a neighborhood
            const { data: profile } = await supabase
                .from('profiles')
                .select('neighborhood_id')
                .eq('email', session?.user?.email)
                .single();

            if (profile?.neighborhood_id) {
                // Get that neighborhood's slug
                const { data: community } = await supabase
                    .from('communities')
                    .select('slug')
                    .eq('id', profile.neighborhood_id)
                    .single();

                if (community) {
                    router.push(`/n/${community.slug}`);
                    return; // Prevent showing lobby
                }
            }
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    const handleUvSelection = async (uv: number) => {
        setSelectedUv(uv);
        setIsLoading(true);
        // Fetch groups
        try {
            const res = await fetch(`/api/community/list-by-uv?uv=${uv}`);
            const data = await res.json();
            if (data.success) {
                setExistingGroups(data.groups || []);
            }
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    const handleJoinGroup = async (communityId: string, slug: string) => {
        setIsJoining(true);
        try {
            const res = await fetch('/api/community/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ communityId })
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/n/${slug}`);
            } else {
                alert(data.error);
                setIsJoining(false);
            }
        } catch(e) {
            setIsJoining(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!selectedUv) return;
        setIsJoining(true);
        try {
            const res = await fetch('/api/community/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uvNumber: selectedUv })
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/n/${data.slug}`);
            } else {
                alert(data.error);
                setIsJoining(false);
            }
        } catch(e) {
            setIsJoining(false);
        }
    };

    if (isLoading && !selectedUv) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando tu Perfil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-4 py-12 relative overflow-hidden">
            <div className="absolute top-0 w-full h-96 bg-indigo-600/10 rounded-b-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-lg z-10 space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6 border border-slate-100 dark:border-slate-800">
                        <MapPin className="text-indigo-600 w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Bienvenido a tu Barrio</h1>
                    <p className="text-slate-500 mt-2 font-medium">Asigna tu identidad a un grupo vecinal seguro para comenzar a interactuar.</p>
                </div>

                {!selectedUv ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-8 border border-slate-100 dark:border-slate-800">
                        <h2 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-6 text-center">Selecciona tu Unidad Vecinal (UV)</h2>
                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto px-1 py-2">
                            {UNIDADES_VECINALES.map(uv => (
                                <button
                                    key={uv}
                                    onClick={() => handleUvSelection(uv)}
                                    className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white hover:shadow-lg rounded-2xl text-slate-700 dark:text-slate-300 font-bold transition-all text-sm active:scale-95 border-2 border-transparent hover:border-indigo-500 focus:outline-none"
                                >
                                    {uv}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setSelectedUv(null); setExistingGroups([]); }} className="text-sm font-bold text-slate-400 hover:text-indigo-600">Volver</button>
                            <span className="text-slate-300">/</span>
                            <span className="text-sm font-black text-indigo-600">Unidad Vecinal {selectedUv}</span>
                        </div>

                        {isLoading || isJoining ? (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Sincronizando Vecinos...</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        Selecciona un Grupo Activo
                                    </h3>
                                    
                                    {existingGroups.length === 0 ? (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-6 border border-amber-100 dark:border-amber-800/30 text-center">
                                            <p className="text-amber-700 dark:text-amber-400 font-bold text-sm">Eres el primer vecino de la UV {selectedUv}.</p>
                                        </div>
                                    ) : (
                                        existingGroups.map((g, i) => (
                                            <div key={g.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600">
                                                        <Home className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{g.name}</h4>
                                                        <p className="text-xs text-slate-500 font-medium">{g.members_count || 0} Vecino{g.members_count !== 1 ? 's' : ''} conectado{g.members_count !== 1 ? 's' : ''}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleJoinGroup(g.id, g.slug)}
                                                    className="px-6 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95"
                                                >
                                                    Unirme
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                                    <div className="relative flex justify-center"><span className="px-4 text-[10px] uppercase tracking-widest font-black text-slate-400 bg-slate-50 dark:bg-slate-950">O crea el tuyo</span></div>
                                </div>

                                <button
                                    onClick={handleCreateGroup}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl p-6 shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-slate-900/10 flex items-center justify-center text-current">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-lg text-current tracking-tight">Fundar Grupo {existingGroups.length + 1}</h4>
                                            <p className="text-xs opacity-70 font-medium">Te convertirás en el Administrador y podrás invitar al resto de los vecinos y moderar el chat.</p>
                                        </div>
                                    </div>
                                    <PlusCircle className="text-current opacity-50 w-6 h-6 group-hover:scale-110 transition-transform" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
