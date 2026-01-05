import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Locate, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is imported

// Fix for Leaflet default marker icon not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle clicks/drags on the map
const LocationMarker = ({ position, setPosition, setLocation }) => {
  const markerRef = useRef(null);
  const map = useMap();

  // Update map view when position changes programmatically (e.g. via GPS button)
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  // Allow dragging the marker
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          setLocation({ lat: newPos.lat, lng: newPos.lng });
        }
      },
    }),
    [setLocation, setPosition],
  );

  return position === null ? null : (
    <Marker 
        position={position} 
        draggable={true} 
        eventHandlers={eventHandlers}
        ref={markerRef}
    >
      <Popup className="font-sans text-xs">Delivery Location. Drag to adjust.</Popup>
    </Marker>
  );
};

const MapSelector = ({ location, setLocation }) => {
  // Default to Dhaka if no location provided
  const defaultCenter = { lat: 23.8103, lng: 90.4125 }; 
  const [position, setPosition] = useState(location || defaultCenter);
  const [loading, setLoading] = useState(false);

  // Function to trigger Geolocation manually
  const handleLocateMe = (e) => {
    e.preventDefault(); // Prevent form submission if inside a form
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos = { lat: latitude, lng: longitude };
          setPosition(newPos);
          setLocation(newPos);
          setLoading(false);
        },
        (err) => {
          console.error("GPS Error:", err);
          setLoading(false);
          alert("Could not access location. Please enable GPS.");
        },
        { enableHighAccuracy: true }
      );
    } else {
        setLoading(false);
    }
  };

  // Attempt to get real GPS location on load only if no location is set
  useEffect(() => {
    if (!location && navigator.geolocation) {
       // Optional: Auto-locate on mount. 
       // Commented out to prevent annoying permission prompts immediately.
       // handleLocateMe({ preventDefault: () => {} });
    }
  }, [location]);

  return (
    <div className="w-full">
        {/* Map Container Frame */}
        <div className="relative w-full h-64 md:h-80 border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-gray-50 group">
            
            <MapContainer 
                center={position} 
                zoom={13} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                {/* FREE OpenStreetMap Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <LocationMarker 
                    position={position} 
                    setPosition={setPosition} 
                    setLocation={setLocation} 
                />
            </MapContainer>

            {/* Custom Floating "Locate Me" Button */}
            <button
                onClick={handleLocateMe}
                disabled={loading}
                className="absolute top-4 right-4 z-[400] bg-white text-[#1a1a1a] hover:text-[#D96C46] p-2 rounded-lg shadow-md border border-gray-100 transition-all active:scale-95 disabled:opacity-50"
                title="Use Current Location"
                type="button"
            >
                {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                ) : (
                    <Locate size={20} />
                )}
            </button>

            {/* Overlay hint on hover (Desktop) */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-2 text-center text-xs text-gray-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 md:block hidden z-[400]">
                Click and drag the marker to pinpoint exact location
            </div>
        </div>

        {/* Mobile Helper Text */}
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 md:hidden">
            <MapPin size={12} /> Drag marker to adjust location
        </p>
    </div>
  );
};

export default MapSelector;