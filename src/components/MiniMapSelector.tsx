"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon assets
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface MiniMapSelectorProps {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onLocationChange }: MiniMapSelectorProps) {
    const map = useMapEvents({
        click(e) {
            onLocationChange(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return (
        <Marker
            position={[lat, lng]}
            icon={DefaultIcon}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    onLocationChange(position.lat, position.lng);
                }
            }}
        />
    );
}

export const MiniMapSelector = ({ lat, lng, onLocationChange }: MiniMapSelectorProps) => {
    return (
        <div className="w-full h-full min-h-[200px] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 relative z-0">
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution='&copy; Google Maps'
                />
                <LocationMarker lat={lat} lng={lng} onLocationChange={onLocationChange} />
            </MapContainer>
        </div>
    );
};
