import { useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import { useJsApiLoader } from "@react-google-maps/api";

const MapSection = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Default location - Change these to your actual salon coordinates
  const center = {
    lat: 40.7128, // New York City latitude
    lng: -74.006, // New York City longitude
  };

  const containerStyle = {
    width: "100%",
    height: "450px",
    borderRadius: "12px",
  };

  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    version: "weekly",
  });

  // Create modern custom pin icon
  const getModernPinIcon = () => {
    const svgString = `<svg width="45" height="45" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow2"><feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.4" floodColor="black"/></filter><linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:rgb(255,71,87);stop-opacity:1" /><stop offset="100%" style="stop-color:rgb(238,90,111);stop-opacity:1" /></linearGradient></defs><g filter="url(#shadow2)"><path d="M 30 8 C 18.954 8 10 16.954 10 28 C 10 42 30 56 30 56 C 30 56 50 42 50 28 C 50 16.954 41.046 8 30 8 Z" fill="url(#pinGradient)" stroke="white" stroke-width="2"/><circle cx="30" cy="28" r="8" fill="white"/><circle cx="30" cy="28" r="5" fill="none" stroke="rgb(255,71,87)" stroke-width="1"/></g></svg>`;
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  };

  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: center,
        zoom: 15,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      });

      // Create marker with modern custom pin icon
      const marker = new google.maps.Marker({
        map: mapInstanceRef.current,
        position: center,
        title: "Beauty Salon - Click for directions",
        icon: {
          url: getModernPinIcon(),
          scaledSize: new google.maps.Size(45, 45),
          anchor: new google.maps.Point(22.5, 45),
        },
      });

      // Add click event to open Google Maps directions
      marker.addListener("click", () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
        window.open(url, "_blank");
      });
    }
  }, [isLoaded]);

  if (loadError) {
    return (
      <Container fluid="lg" className="my-5">
        <div className="alert alert-danger">Error loading map</div>
      </Container>
    );
  }

  if (!isLoaded) {
    return (
      <Container fluid="lg" className="my-5">
        <div className="text-center">Loading map...</div>
      </Container>
    );
  }

  return (
    <Container fluid="lg" className="my-5">
      <div className="mb-4">
        <h2 className="text-center mb-2">Find Us</h2>
        <p className="text-center text-muted">
          Visit our salon at the location below
        </p>
      </div>

      <div ref={mapRef} style={containerStyle} />

      <div className="text-center mt-3">
        <p className="text-muted mb-2">
          <i className="bi bi-geo-alt-fill me-2"></i>
          123 Beauty Street, New York, NY 10001
        </p>
        <small className="text-muted">
          💡 Click the red pin on the map for directions
        </small>
      </div>
    </Container>
  );
};

export default MapSection;
