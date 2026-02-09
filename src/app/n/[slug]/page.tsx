// FINAL DEMO REBUILD SYNC: 2026-02-09T00:15:00Z
"use client";

import React, { useState, useEffect } from 'react';
import { GeofenceGate } from '@/components/GeofenceGate';
import { EnrollmentForm } from '@/components/EnrollmentForm';
import { ItemCard, type Item } from '@/components/ItemCard';
import { UploadForm } from '@/components/UploadForm';
import { UserActivityPanel } from '@/components/UserActivityPanel';
import { OfficialAlertCard } from '@/components/OfficialAlertCard';
import { MunicipalAdminPanel } from '@/components/MunicipalAdminPanel';
import { BrandHeader } from '@/components/BrandHeader';
import { useSearchParams } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { ScientificMap } from '@/components/ScientificMap';
import dynamic from 'next/dynamic';

// Carga dinámica para evitar errores de SSR con Leaflet
const DynamicMap = dynamic(() => import('@/components/ScientificMap').then(mod => mod.ScientificMap), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />
});


function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Vercel Rebuild Trigger: 2026-02-09
export default function CommunityPage({ params }: { params: { slug: string } }) {
    const searchParams = useSearchParams();
    const token = searchParams.get('t');

    // UI State
    const [isVerified, setIsVerified] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const { data: session } = useSession();
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [showMuniDashboard, setShowMuniDashboard] = useState(false);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [communityId, setCommunityId] = useState<string | null>(null);
    const [userKarma, setUserKarma] = useState(0);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    // Verificar si el usuario es ADMIN municipal
    useEffect(() => {
        if (session?.user?.email) {
            // Importar dinámicamente para evitar errores de SSR
            import('@/lib/municipal-admins').then(({ isMunicipalAdmin }) => {
                const isAdmin = isMunicipalAdmin(session.user.email);
                // Solo activar panel municipal si tiene token admin Y es email autorizado
                if (token === 'admin' && isAdmin) {
                    setShowMuniDashboard(true);
                }
            });
        }
    }, [session?.user?.email, token]);

    const communityName = params.slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCommunityData() {
            setIsLoading(true);
            try {
                // 1. Get community ID
                const { data: community } = await supabase
                    .from('communities')
                    .select('id')
                    .eq('slug', params.slug)
                    .single();

                if (community) {
                    setCommunityId(community.id);
                    // 2. Fetch items for this community (ACTIVE or AVAILABLE)
                    const { data: dbItems } = await supabase
                        .from('items')
                        .select('*')
                        .eq('community_id', community.id)
                        .in('status', ['ACTIVE', 'AVAILABLE'])
                        .order('created_at', { ascending: false });



                    if (dbItems) {
                        setItems(dbItems.map((item: any) => ({
                            id: item.id,
                            title: item.title,
                            lat: item.lat,
                            lng: item.lng,
                            // Robust Chilean Formatting: DD-MM-YYYY
                            date: new Date(item.created_at).toLocaleDateString('es-CL', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            }).replace(/\//g, '-') + ' ' + new Date(item.created_at).toLocaleTimeString('es-CL', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }),
                            creator_id: item.creator_id,
                            questions: item.questions || [],
                            author_email: item.author_email,
                            description: item.description || '',
                            type: item.type as any,
                            images: Array.isArray(item.images) ? item.images : (typeof item.images === 'string' ? [item.images] : []),
                            category: item.category || 'Varios',
                            creatorName: item.author_email ? item.author_email.split('@')[0] : 'Vecino',
                            price: Number(item.price),
                            status: item.status as any
                        })));
                    }
                }

                // 3. Fetch user karma & Sync Profile if missing
                if (session?.user?.id) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('karma_pts')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        setUserKarma(profile.karma_pts);
                    } else if (profileError && profileError.code === 'PGRST116') {
                        // Profile doesn't exist, create it "Lazy Style"
                        const { error: insertError } = await supabase
                            .from('profiles')
                            .insert({
                                id: session.user.id,
                                full_name: session.user.name,
                                avatar_url: session.user.image,
                                karma_pts: 100 // Welcome gift
                            });

                        if (!insertError) setUserKarma(100);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCommunityData();
    }, [params.slug, session?.user?.id]);

    const [officialAlerts, setOfficialAlerts] = useState<any[]>([]);

    // Fetch official alerts from Supabase
    useEffect(() => {
        const fetchOfficialAlerts = async () => {
            const { data } = await supabase
                .from('items')
                .select('*')
                .eq('type', 'OFFICIAL_ALERT')
                .eq('status', 'ACTIVE')
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                setOfficialAlerts(data.map((alert: any) => ({
                    id: alert.id,
                    title: alert.title,
                    message: alert.description,
                    type: alert.category,
                    date: new Date(alert.created_at).toLocaleString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }).replace(/, /g, ' ').replace(/\//g, '-'),
                    muniName: 'Lo Prado'
                })));
            }
        };

        fetchOfficialAlerts();

        // Realtime sync for official alerts
        const channel = supabase
            .channel('official-alerts-sync')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'items',
                filter: 'type=eq.OFFICIAL_ALERT'
            }, () => {
                console.log("📢 Official alert change detected, syncing...");
                fetchOfficialAlerts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleDeleteItem = async (id: string) => {
        try {
            console.log("🚨 INITIATING DELETE for ID:", id);

            // Log local state before delete
            console.log("Current local items count:", items.length);

            // 1. Call custom server API to bypass Client RLS limitations
            const response = await fetch('/api/items/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("🔥 Server API error:", result.error);
                alert(`Error al borrar: ${result.error}`);
                return;
            }

            console.log("✅ Server Delete Success:", result.message);

            // Remove from local state immediately
            setItems(prev => prev.filter(item => item.id !== id));

            // Trigger a manual refresh of the municipal panel if possible, 
            // but here we just show an alert to confirm it's done.
            alert("Eliminado con éxito. Si sigue apareciendo en el mapa, refresca la página.");

        } catch (err: any) {
            console.error("💥 Critical Failure:", err);
            alert(`Error crítico: ${err.message}`);
        }
    };

    const handleConfirmItem = async (id: string) => {
        try {
            // 1. Get the item to find the creator
            const { data: item } = await supabase
                .from('items')
                .select('*')
                .eq('id', id)
                .single();

            if (!item) return;

            // 2. Update status to COMPLETED
            const { error: updateError } = await supabase
                .from('items')
                .update({ status: 'COMPLETED' })
                .eq('id', id);

            if (updateError) throw updateError;

            // 3. Award Karma to the creator if it's a GIFT
            if (item.type === 'GIFT' && item.creator_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('karma_pts')
                    .eq('id', item.creator_id)
                    .single();

                if (profile) {
                    await supabase
                        .from('profiles')
                        .update({ karma_pts: (profile.karma_pts || 0) + 50 })
                        .eq('id', item.creator_id);

                    // If I am the creator, update my local karma display
                    if (item.creator_id === session?.user?.id) {
                        setUserKarma((profile.karma_pts || 0) + 50);
                    }
                }
            }

            // 4. Update local state
            setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'COMPLETED' } : i));

            alert("✅ Confirmado con éxito. ¡Gracias por participar!");
        } catch (err: any) {
            console.error("Confirm error:", err);
            alert("Error al confirmar: " + err.message);
        }
    };

    const handleEditItem = (item: Item) => {
        setEditingItem(item);
        setShowUpload(true);
    };

    // Priority View: Municipal Dashboard
    if (showMuniDashboard) {
        return <MunicipalAdminPanel onBack={() => setShowMuniDashboard(false)} />;
    }

    if (!isVerified) {
        return (
            <GeofenceGate
                targetLat={-33.4489}
                targetLng={-70.7256}
                communityName={communityName}
                onVerified={() => setIsVerified(true)}
            />
        );
    }

    if (!isEnrolled) {
        return (
            <EnrollmentForm
                communityName={communityName}
                onComplete={() => setIsEnrolled(true)}
            />
        );
    }

    return (
        <div className="min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
            <BrandHeader
                communityName={communityName}
                karma={userKarma}
                isMunicipalView={false}
                onDashboardToggle={() => {
                    setShowUserPanel(false);
                    setShowMuniDashboard(true);
                }}
                onProfileClick={() => setShowUserPanel(true)}
            />

            <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
                {/* Official Alerts Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-red-500 rounded-full" />
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Voz Oficial</h2>
                        </div>
                    </div>
                    {officialAlerts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {officialAlerts.map(alert => (
                                <OfficialAlertCard key={alert.id} {...alert} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] p-12 text-center">
                            <p className="text-slate-400 dark:text-slate-500 font-bold text-lg">
                                📢 No hay comunicados oficiales en este momento
                            </p>
                            <p className="text-slate-400 dark:text-slate-600 text-sm mt-2">
                                Las alertas del municipio aparecerán aquí
                            </p>
                        </div>
                    )}
                </section>

                {/* Dashboard / User Overlay */}
                <AnimatePresence>
                    {showUserPanel && (
                        <div className="fixed inset-0 z-[150] flex justify-end">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                                onClick={() => setShowUserPanel(false)}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl h-full overflow-hidden"
                            >
                                <UserActivityPanel
                                    items={items}
                                    karma={userKarma}
                                    userName={session?.user?.name || "Vecino"}
                                    onBack={() => setShowUserPanel(false)}
                                    onConfirm={handleConfirmItem}
                                    onDelete={handleDeleteItem}
                                    onEdit={handleEditItem}
                                />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Scientific Neighborhood Map */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-8 bg-blue-500 rounded-full" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Mapa del Barrio</h2>
                    </div>
                    <DynamicMap
                        items={items.filter(i => ['ACTIVE', 'AVAILABLE'].includes(i.status || '')).map(i => ({
                            id: i.id,
                            title: i.title,
                            description: (i as any).description || '',
                            type: i.type as any,
                            lat: (i as any).lat || -33.4489,
                            lng: (i as any).lng || -70.7256
                        }))}
                    />

                </section>

                {/* Community Boards */}

                <div className="space-y-16">
                    {/* Civic Reports Board */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-red-600 rounded-full" />
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Reportes Cívicos</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingItem(null); // Clear editing state when opening for new upload
                                    setShowUpload(true);
                                }}
                                className="bg-indigo-600 hover:bg-black text-white px-8 py-3 rounded-2xl font-black shadow-xl transition-all active:scale-95"
                            >
                                SUBIR ALGO
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {items.filter(item =>
                                item.type === 'CIVIC_REPORT' &&
                                (item.status === 'ACTIVE' || item.status === 'AVAILABLE')
                            ).map(item => (
                                <ItemCard
                                    key={item.id}
                                    {...item}
                                    onDelete={
                                        ((item as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() ||
                                            (item as any).creator_id === session?.user?.id)
                                            ? () => handleDeleteItem(item.id)
                                            : undefined
                                    }
                                    onEdit={
                                        ((item as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() ||
                                            (item as any).creator_id === session?.user?.id)
                                            ? () => handleEditItem(item)
                                            : undefined
                                    }
                                />
                            ))}

                            {/* Empty State if no personal reports */}
                            {items.filter(item =>
                                item.type === 'CIVIC_REPORT' &&
                                (item.status === 'ACTIVE' || item.status === 'AVAILABLE') &&
                                ((item as any).author_email === session?.user?.email || (item as any).creator_id === session?.user?.id)
                            ).length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aún no has subido reportes. Mira el mapa para ver lo que otros reportan.</p>
                                    </div>
                                )}
                        </div>
                    </section>

                    {/* Circular Economy Board */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Economía Circular</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {items.filter(item =>
                                item.type !== 'CIVIC_REPORT' &&
                                item.type !== 'OFFICIAL_ALERT' &&
                                (item.status === 'ACTIVE' || item.status === 'AVAILABLE')
                            ).map(item => (
                                <ItemCard
                                    key={item.id}
                                    {...item}
                                    onDelete={
                                        ((item as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() ||
                                            (item as any).creator_id === session?.user?.id)
                                            ? () => handleDeleteItem(item.id)
                                            : undefined
                                    }
                                    onEdit={
                                        ((item as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() ||
                                            (item as any).creator_id === session?.user?.id)
                                            ? () => handleEditItem(item)
                                            : undefined
                                    }
                                />
                            ))}

                            {/* Empty State if no personal items */}
                            {items.filter(item =>
                                item.type !== 'CIVIC_REPORT' &&
                                item.type !== 'OFFICIAL_ALERT' &&
                                (item.status === 'ACTIVE' || item.status === 'AVAILABLE') &&
                                ((item as any).author_email === session?.user?.email || (item as any).creator_id === session?.user?.id)
                            ).length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Tus publicaciones de trueque o venta aparecerán aquí.</p>
                                    </div>
                                )}
                        </div>
                    </section>
                </div>
            </main>

            {
                showUpload && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => {
                                setShowUpload(false);
                                setEditingItem(null);
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <UploadForm
                                communityId={communityId}
                                onClose={() => {
                                    setShowUpload(false);
                                    setEditingItem(null);
                                }}
                                initialData={editingItem}
                                onSuccess={() => {
                                    setShowUpload(false);
                                    setEditingItem(null);
                                    // Refetch or update items list (the useEffect [communityId] will trigger if we reset)
                                    // But for better UX let's just trigger a reload or refresh state
                                    window.location.reload();
                                }}
                            />
                        </motion.div>
                    </div>
                )
            }

            <footer className="py-20 text-center opacity-30 font-black text-[10px] uppercase tracking-[0.4em]">
                Barrio Seguro • {new Date().getFullYear()} • Lo Prado
            </footer>
        </div>
    );
}
