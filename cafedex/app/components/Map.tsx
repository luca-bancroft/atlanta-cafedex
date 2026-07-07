"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { cafes, type Cafe } from "../data/cafes";

export default function CafeMap() {
  const [viewState, setViewState] = useState({
    longitude: -84.388,
    latitude: 33.749,
    zoom: 11,
  });
  const [selected, setSelected] = useState<Cafe | null>(null);

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />

      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          longitude={cafe.longitude}
          latitude={cafe.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelected(cafe);
          }}
        >
          <span
            style={{ cursor: "pointer", fontSize: "1.5rem", lineHeight: 1 }}
            role="img"
            aria-label={cafe.name}
          >
            ☕
          </span>
        </Marker>
      ))}

      {selected && (
        <Popup
          longitude={selected.longitude}
          latitude={selected.latitude}
          anchor="bottom"
          offset={28}
          onClose={() => setSelected(null)}
          closeOnClick={false}
        >
          <strong>{selected.name}</strong>
          <br />
          {selected.neighborhood}
        </Popup>
      )}
    </Map>
  );
}
