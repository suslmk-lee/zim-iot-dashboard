import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet의 기본 아이콘 경로 설정
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// 커스텀 반짝이는 마커 컴포넌트
const BlinkingMarker = ({ position }) => {
    useEffect(() => {
        const markerElement = document.querySelector('.leaflet-marker-icon');
        let isBlinking = true;

        const blinkInterval = setInterval(() => {
            if (markerElement) {
                markerElement.style.opacity = isBlinking ? '1' : '0.3';
                isBlinking = !isBlinking;
            }
        }, 800);

        return () => clearInterval(blinkInterval); // Cleanup interval on unmount
    }, []);

    return (
        <Marker position={position} icon={defaultIcon}>
            <Popup>Location: {position[0]}, {position[1]}</Popup>
        </Marker>
    );
};

const MapComponent = () => {
    const position = [37.5665, 126.9780]; // 서울의 경도와 위도

    return (
        <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            />
            <BlinkingMarker position={position} />
        </MapContainer>
    );
};

export default MapComponent;
