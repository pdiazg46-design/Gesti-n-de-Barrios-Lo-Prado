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

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function CommunityPage({ params }: { params: { slug: string } }) {
    const searchParams = useSearchParams();
    const token = searchParams.get('t');

    // UI State
    const [isVerified, setIsVerified] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(true);
    const [isSeniorMode, setIsSeniorMode] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [showMuniDashboard, setShowMuniDashboard] = useState(token === 'admin');

    const communityName = params.slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Mock Items & Alerts
    const initialItems: Item[] = [
        { id: '1', title: 'Taladro Percutor Bosch', category: 'Herramientas', type: 'SALE', creatorName: 'Carlos', description: 'Préstamo por el fin de semana. Solo vecinos.', price: 0, status: 'AVAILABLE' },
        { id: '2', title: 'Silla de Ruedas Plegable', category: 'Salud', type: 'GIFT', creatorName: 'Marta', description: 'Excelente estado. Préstamo indefinido hasta que no se necesite.', price: 0, status: 'AVAILABLE' },
        { id: 'r1', title: 'Luminaria Apagada - Plaza Central', category: 'Seguridad', type: 'REPORT', creatorName: 'Juan P.', description: 'La luminaria del sector norte lleva 3 días apagada. Es un punto oscuro peligroso.', price: 0, status: 'AVAILABLE' }
    ];

    const [items, setItems] = useState<Item[]>(initialItems);

    const officialAlerts = [
        { id: 'a1', title: 'Operativo Retiro de Escombros', message: 'Este sábado desde las 08:00 hrs pasará el camión recolector por calle Las Torres.', type: 'PUBLIC_SERVICE' as const, date: 'Hoy', muniName: 'Lo Prado' },
        { id: 'a2', title: 'Alerta de Seguridad', message: 'Se reporta luminaria apagada en Plaza Lo Prado. Técnicos en camino.', type: 'INFO' as const, date: 'En progreso', muniName: 'Lo Prado' }
    ];

    // Priority View: Municipal Dashboard
    if (showMuniDashboard) {
        return <MunicipalAdminPanel />;
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
        <div className={cn(
            "min-h-screen transition-colors duration-500",
            isSeniorMode ? "bg-amber-50" : "bg-slate-50 dark:bg-slate-950"
        )}>
            <BrandHeader
                communityName={communityName}
                karma={124}
                isSeniorMode={isSeniorMode}
                onToggleSenior={() => setIsSeniorMode(!isSeniorMode)}
                onDashboardToggle={() => {
                    setShowUserPanel(false);
                    setShowMuniDashboard(true);
                }}
            />

            <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
                {/* Official Alerts Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-red-500 rounded-full" />
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Voz Oficial</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {officialAlerts.map(alert => (
                            <OfficialAlertCard key={alert.id} {...alert} isSeniorMode={isSeniorMode} />
                        ))}
                    </div>
                </section>

                {/* Dashboard / User Section */}
                <section>
                    <UserActivityPanel
                        items={items}
                        karma={124}
                        userName="Super Usuario"
                        onBack={() => setShowUserPanel(false)}
                        onConfirm={(id) => {
                            setItems(items.map(item => item.id === id ? { ...item, status: 'COMPLETED' } : item));
                        }}
                        isSeniorMode={isSeniorMode}
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
                                onClick={() => setShowUpload(true)}
                                className="bg-indigo-600 hover:bg-black text-white px-8 py-3 rounded-2xl font-black shadow-xl transition-all active:scale-95"
                            >
                                SUBIR ALGO
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.filter(item => item.type === 'REPORT').map(item => (
                                <ItemCard key={item.id} {...item} isSeniorMode={isSeniorMode} />
                            ))}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.filter(item => item.type !== 'REPORT').map(item => (
                                <ItemCard key={item.id} {...item} isSeniorMode={isSeniorMode} />
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {showUpload && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={() => setShowUpload(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                    >
                        <UploadForm
                            isSeniorMode={isSeniorMode}
                            onClose={() => setShowUpload(false)}
                            onUpload={(data) => {
                                const newItem: Item = {
                                    id: Math.random().toString(),
                                    title: data.title,
                                    description: data.description,
                                    type: data.type,
                                    category: data.type === 'REPORT' ? 'Reporte' : 'Comunidad',
                                    creatorName: 'Yo',
                                    price: data.price ? parseInt(data.price) : 0,
                                    status: 'AVAILABLE'
                                };
                                setItems([newItem, ...items]);
                            }}
                        />
                    </motion.div>
                </div>
            )}

            <footer className="py-20 text-center opacity-30 font-black text-[10px] uppercase tracking-[0.4em]">
                Comunidad Segura • {new Date().getFullYear()} • Lo Prado
            </footer>
        </div>
    );
}
