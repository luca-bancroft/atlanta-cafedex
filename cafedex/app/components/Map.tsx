"use client";

import { useCallback, useEffect, useState } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  type MapEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Cafe } from "../data/cafes";
import WeickIndexRating from "./WeickIndexRating";

const ROAD_LINE_COLOR = "#6B4F36";

export type FocusRequest = {
  cafe: Cafe;
  requestId: number;
};

type CafeMapProps = {
  cafes: Cafe[];
  selected: Cafe | null;
  onSelect: (cafe: Cafe | null) => void;
  focusRequest?: FocusRequest | null;
};

export default function CafeMap({
  cafes,
  selected,
  onSelect,
  focusRequest,
}: CafeMapProps) {
  const [viewState, setViewState] = useState({
    longitude: -84.388,
    latitude: 33.749,
    zoom: 11,
  });

  const handleLoad = useCallback((event: MapEvent) => {
    const map = event.target;
    const layers = map.getStyle()?.layers ?? [];
    for (const layer of layers) {
      const sourceLayer = (layer as { "source-layer"?: string })[
        "source-layer"
      ];
      if (layer.type === "line" && sourceLayer === "road") {
        map.setPaintProperty(layer.id, "line-color", ROAD_LINE_COLOR);
      }
    }
  }, []);

  useEffect(() => {
    if (!focusRequest) return;
    setViewState((prev) => ({
      ...prev,
      longitude: focusRequest.cafe.longitude,
      latitude: focusRequest.cafe.latitude,
      zoom: Math.max(prev.zoom, 14),
    }));
  }, [focusRequest]);

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      onLoad={handleLoad}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
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
            onSelect(cafe);
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
          onClose={() => onSelect(null)}
          closeOnClick={false}
        >
          <strong>{selected.name}</strong>
          <br />
          {selected.neighborhood}
          <div className="popup-rating">
            <WeickIndexRating
              rating={selected.rating}
              metCriteria={selected.metCriteria}
              distinguished={selected.distinguished}
              distinguishedReason={selected.distinguishedReason}
              detriment={selected.detriment}
              detrimentReason={selected.detrimentReason}
              size="0.8rem"
              showLabel={false}
              showValue={false}
              showReasons={false}
            />
          </div>
        </Popup>
      )}
    </Map>
  );
}
