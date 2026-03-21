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
import { CommunityModerationTable } from '@/components/CommunityModerationTable';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { BrandHeader } from '@/components/BrandHeader';
import { InviteModal } from '@/components/InviteModal';
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
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const isFounderMode = searchParams.get('founder') === 'true';

    useEffect(() => {
        const enrolled = localStorage.getItem('barrioloop_enrolled');
        if (!enrolled) setIsEnrolled(false);
        
        const verified = localStorage.getItem('barrioloop_verified');
        if (!verified) setIsVerified(false);
        
        if (isFounderMode) {
            setIsVerified(true);
        }
    }, [isFounderMode]);

    const handleAvatarUpdate = async (newBase64Url: string) => {
        if (!session?.user?.id) return;
        
        // 1. Reactive Frontend display immediately
        setUserAvatar(newBase64Url);

        try {
            // 2. Persist bridging securely via Server API (Bypass Client RLS)
            const res = await fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_url: newBase64Url })
            });
            
            if (!res.ok) {
                console.error("No se pudo fijar avatar en el servidor.");
            }
        } catch (e) {
            console.error("Critical Profile Save Error:", e);
        }
    };

    const handleEnrollmentComplete = async (formData?: any) => {
        if (session?.user?.id && formData) {
            try {
                const updateData: any = {};
                if (formData.name) updateData.full_name = formData.name;
                if (formData.avatar_url) updateData.avatar_url = formData.avatar_url;
                
                await fetch('/api/auth/update-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });
            } catch (err) {
                console.error("Critical error saving profile:", err);
            }
        }
        localStorage.setItem('barrioloop_enrolled', 'true');
        setIsEnrolled(true);
    };

    const handleVerificationComplete = () => {
        localStorage.setItem('barrioloop_verified', 'true');
        setIsVerified(true);
    };
    const { data: session } = useSession();
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [showMuniDashboard, setShowMuniDashboard] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [communityId, setCommunityId] = useState<string | null>(null);
    const [userKarma, setUserKarma] = useState(0);
    const [userAvatar, setUserAvatar] = useState('');
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [isCommunityAdmin, setIsCommunityAdmin] = useState(false);
    const [showModerationTable, setShowModerationTable] = useState(false);

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
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = items.filter(item => {
        if (!searchTerm) return true;
        const query = searchTerm.toLowerCase();
        return (item.title?.toLowerCase().includes(query)) ||
               (item.description?.toLowerCase().includes(query)) ||
               (item.category?.toLowerCase().includes(query));
    });

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

                let resolvedCommunityId = null;

                if (community) {
                    resolvedCommunityId = community.id;
                    setCommunityId(community.id);
                }

                // 2. Fetch items for this community OR Global items (ACTIVE or AVAILABLE)
                let query = supabase
                    .from('items')
                    .select('*, profiles:creator_id(full_name)')
                    .in('status', ['ACTIVE', 'AVAILABLE', 'COMPLETED'])
                    .order('created_at', { ascending: false });

                if (resolvedCommunityId) {
                    query = query.eq('community_id', resolvedCommunityId);
                } else {
                    query = query.is('community_id', null);
                }

                const { data: dbItems } = await query;

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
                        createdAt: item.created_at,
                        creator_id: item.creator_id,
                        questions: item.questions || [],
                        author_email: item.author_email,
                        description: item.description || '',
                        type: item.type as any,
                        images: Array.isArray(item.images) ? item.images : (typeof item.images === 'string' ? [item.images] : []),
                        category: item.category || 'Varios',
                        creatorName: item.profiles?.full_name || (item.author_email ? item.author_email.split('@')[0] : 'Vecino'),
                        price: Number(item.price),
                        status: item.status as any
                    })));
                }

                // 3. Fetch user karma & Sync Profile if missing
                // 3. Fetch user karma via robust API
                if (session?.user?.email) {
                    console.log("[Karma] Loading karma for:", session.user.email);
                    
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('is_community_admin')
                        .eq('email', session.user.email)
                        .single();
                        
                    if (profileData) setIsCommunityAdmin(profileData.is_community_admin || false);

                    const res = await fetch('/api/karma/get');
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.success) {
                            console.log("[Karma] Successfully loaded karma:", data.karma);
                            setUserKarma(data.karma);
                            if (data.avatar_url) setUserAvatar(data.avatar_url);
                        }
                    } else {
                        console.error("[Karma] Error response from API:", res.status);
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
                const response = await fetch('/api/karma/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: item.creator_id,
                        amount: 50,
                        email: item.author_email
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    // If I am the creator, update my local karma display
                    if (item.author_email?.toLowerCase() === session?.user?.email?.toLowerCase()) {
                        setUserKarma(data.newKarma);
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

    const handleAskItem = async (id: string, text: string) => {
        try {
            const res = await fetch('/api/items/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, text })
            });
            const data = await res.json();
            
            if (!res.ok) {
                alert(`⚠️ ${data.error}`);
                if (data.isBanned) {
                    window.location.reload(); 
                }
                return;
            }

            setItems(prev => prev.map(i => {
                if (i.id === id) {
                    const newItem = { ...i, questions: [...(i.questions || []), data.question] };
                    if (selectedItem?.id === id) setSelectedItem(newItem);
                    return newItem;
                }
                return i;
            }));
        } catch(e) {
            console.error(e);
            alert("Error de conexión al enviar mensaje.");
        }
    };

    const handleResolveItem = async (id: string) => {
        try {
            const res = await fetch('/api/items/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id })
            });
            const data = await res.json();
            
            if (res.ok) {
                setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'COMPLETED' } : i));
                setSelectedItem(prev => prev?.id === id ? { ...prev, status: 'COMPLETED' } : prev);
                alert("✅ Acuerdo finalizado. La publicación se ha archivado con éxito.");
            } else {
                alert(data.error);
            }
        } catch(e) {
            alert("Error cerrando trato");
        }
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
                radiusMeters={3000}
                communityName={communityName}
                onVerified={handleVerificationComplete}
            />
        );
    }

    if (!isEnrolled) {
        return (
            <EnrollmentForm
                communityName={communityName}
                onComplete={handleEnrollmentComplete}
                isFounderMode={isFounderMode}
            />
        );
    }

    return (
        <div className="min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
            <BrandHeader
                communityName={communityName}
                karma={userKarma}
                avatarUrl={userAvatar}
                isMunicipalView={false}
                onDashboardToggle={() => {
                    setShowUserPanel(false);
                    setShowMuniDashboard(true);
                }}
                onProfileClick={() => setShowUserPanel(true)}
                onInviteClick={() => setIsInviteModalOpen(true)}
                onSearch={(query) => setSearchTerm(query)}
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
                                    items={filteredItems}
                                    karma={userKarma}
                                    userName={session?.user?.name || "Vecino"}
                                    avatarUrl={userAvatar}
                                    isCommunityAdmin={isCommunityAdmin}
                                    onModerationClick={() => setShowModerationTable(true)}
                                    onAvatarUpdate={handleAvatarUpdate}
                                    onBack={() => setShowUserPanel(false)}
                                    onConfirm={handleConfirmItem}
                                    onDelete={handleDeleteItem}
                                    onEdit={handleEditItem}
                                />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Moderation Panel Overlay */}
                <AnimatePresence>
                    {showModerationTable && (
                        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                                onClick={() => setShowModerationTable(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                        Pizarra Disciplinaria Vecinal
                                    </h2>
                                    <button onClick={() => setShowModerationTable(false)} className="p-2 px-4 font-black uppercase tracking-widest text-[10px] bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">
                                        Cerrar
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto">
                                    <CommunityModerationTable />
                                </div>
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
                        items={filteredItems.filter(i => {
                            if (!['ACTIVE', 'AVAILABLE'].includes(i.status || '')) return false;
                            
                            // Expiración 24 hrs para Reportes Civicos en el Mapa
                            if (i.type === 'CIVIC_REPORT') {
                                const isExpired = new Date().getTime() - new Date((i as any).createdAt).getTime() > 24 * 60 * 60 * 1000;
                                if (isExpired) return false;
                            }
                            
                            return true;
                        }).map(i => ({
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

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
                            {filteredItems.filter(item => {
                                if (item.type !== 'CIVIC_REPORT') return false;
                                if (!(item.status === 'ACTIVE' || item.status === 'AVAILABLE')) return false;
                                
                                const isExpired = new Date().getTime() - new Date((item as any).createdAt).getTime() > 24 * 60 * 60 * 1000;
                                if (isExpired) return false;

                                return true;
                            })
                                .sort((a, b) => {
                                    const aIsMine = (a as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() || (a as any).creator_id === session?.user?.id;
                                    const bIsMine = (b as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() || (b as any).creator_id === session?.user?.id;
                                    if (aIsMine && !bIsMine) return -1;
                                    if (!aIsMine && bIsMine) return 1;
                                    return 0;
                                })
                                .map(item => (
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
                                        onClickCard={() => setSelectedItem(item)}
                                    />
                                ))}

                            {/* Empty State if no personal reports */}
                            {filteredItems.filter(item =>
                                item.type === 'CIVIC_REPORT' &&
                                (item.status === 'ACTIVE' || item.status === 'AVAILABLE') &&
                                ((item as any).author_email === session?.user?.email || (item as any).creator_id === session?.user?.id)
                            ).length === 0 && !searchTerm && (
                                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aún no has subido reportes. Mira el mapa para ver lo que otros reportan.</p>
                                    </div>
                                )}
                            
                            {/* Empty state for search */}
                            {filteredItems.filter(i => i.type === 'CIVIC_REPORT' && ['ACTIVE', 'AVAILABLE'].includes(i.status || '')).length === 0 && searchTerm && (
                                <div className="col-span-full py-10 text-center text-slate-500 font-bold text-sm">
                                    No se encontraron Reportes que coincidan con "{searchTerm}".
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

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
                            {filteredItems.filter(item =>
                                item.type !== 'CIVIC_REPORT' &&
                                item.type !== 'OFFICIAL_ALERT' &&
                                (item.status === 'ACTIVE' || item.status === 'AVAILABLE')
                            )
                                .sort((a, b) => {
                                    const aIsMine = (a as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() || (a as any).creator_id === session?.user?.id;
                                    const bIsMine = (b as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() || (b as any).creator_id === session?.user?.id;
                                    if (aIsMine && !bIsMine) return -1;
                                    if (!aIsMine && bIsMine) return 1;
                                    return 0;
                                })
                                .map(item => (
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
                                        onAsk={(text) => handleAskItem(item.id, text)}
                                    />
                                ))}

                            {/* Empty State if no personal items */}
                            {filteredItems.filter(item =>
                                item.type !== 'CIVIC_REPORT' &&
                                item.type !== 'OFFICIAL_ALERT' &&
                                (item.status === 'ACTIVE' || item.status === 'AVAILABLE') &&
                                ((item as any).author_email === session?.user?.email || (item as any).creator_id === session?.user?.id)
                            ).length === 0 && !searchTerm && (
                                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Tus publicaciones de trueque o venta aparecerán aquí.</p>
                                    </div>
                                )}

                            {/* Empty state for search */}
                            {filteredItems.filter(i => !['CIVIC_REPORT', 'OFFICIAL_ALERT'].includes(i.type as string) && ['ACTIVE', 'AVAILABLE'].includes(i.status || '')).length === 0 && searchTerm && (
                                <div className="col-span-full py-10 text-center text-slate-500 font-bold text-sm">
                                    No se encontraron Ofertas que coincidan con "{searchTerm}".
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

            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAsk={(text) => handleAskItem(selectedItem.id, text)}
                    onResolve={() => handleResolveItem(selectedItem.id)}
                    onDelete={
                        ((selectedItem as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() ||
                        (selectedItem as any).creator_id === session?.user?.id) 
                            ? () => { handleDeleteItem(selectedItem.id); setSelectedItem(null); }
                            : undefined
                    }
                    onEdit={
                        ((selectedItem as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() ||
                        (selectedItem as any).creator_id === session?.user?.id)
                            ? () => { handleEditItem(selectedItem); setSelectedItem(null); } 
                            : undefined
                    }
                    isOwner={
                        ((selectedItem as any).author_email?.toLowerCase() === session?.user?.email?.toLowerCase() ||
                        (selectedItem as any).creator_id === session?.user?.id) || false
                    }
                />
            )}
            {isInviteModalOpen && (
                <InviteModal 
                    communityName={communityName}
                    onClose={() => setIsInviteModalOpen(false)}
                />
            )}

            <footer className="py-20 text-center opacity-30 font-black text-[10px] uppercase tracking-[0.4em]">
                Barrio Seguro • {new Date().getFullYear()} • Lo Prado
            </footer>
        </div>
    );
}
