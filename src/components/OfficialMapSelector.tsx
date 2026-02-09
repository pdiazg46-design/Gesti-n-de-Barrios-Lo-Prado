import React from 'react';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';

interface OfficialMapSelectorProps {
    lat: number;
    lng: number;
    radius: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const OfficialMapSelector = ({ lat, lng, radius, onLocationSelect }: OfficialMapSelectorProps) => {
    return (
        <MapContainer
            center={[-33.4489, -70.7256]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            className="z-0 grayscale-[0.2] contrast-[1.1]"
        >
            <TileLayer
                url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                attribution='&copy; Google Maps'
            />
            <Circle
                center={[lat, lng]}
                pathOptions={{
                    fillColor: '#4f46e5',
                    color: '#4f46e5',
                    weight: 4,
                    fillOpacity: 0.15,
                    dashArray: '10, 10'
                }}
                radius={radius}
            />
            <MapClickHandler onLocationSelect={onLocationSelect} />
        </MapContainer>
    );
};

export default OfficialMapSelector;
