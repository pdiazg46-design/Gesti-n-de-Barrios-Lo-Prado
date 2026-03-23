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
                .eq('id', session?.user?.id)
                .single();

            if (session?.user?.email?.toLowerCase() === 'pdiazg46@gmail.com') {
                router.push('/n/lo-prado'); // Redirigir al barrio principal real
                return;
            }

            // VIP Bypass: Si el usuario trae un código VIP en su bolsillo (localStorage), salta directo a la comunidad principal
            const storedVipCode = localStorage.getItem('barrioloop_vip_code');
            if (storedVipCode) {
                router.push('/n/lo-prado');
                return;
            }

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

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-8 border border-slate-100 dark:border-slate-800 text-center">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Acceso mediante Invitación Oficial</h2>
                    <p className="text-slate-500 font-medium mb-6 text-sm">
                        Para ingresar a tu Unidad Vecinal, debes utilizar el enlace VIP proporcionado por tu Junta de Vecinos o Administrador de Cuadrante.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold">
                        Si ya tienes un enlace, ábrelo directamente en tu navegador para activar tu acceso.
                    </div>
                </div>
            </div>
        </div>
    );
}
