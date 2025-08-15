import React, { useEffect, useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

export interface ShippingSelection {
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  fullAddress: string;
}

interface Props {
  onSelect: (data: ShippingSelection) => void;
  placeholder?: string;
  className?: string;
  isLoaded?: boolean;
}

export const ShippingAddressAutocomplete: React.FC<Props> = ({
  onSelect,
  placeholder = "Start typing your address...",
  className,
  isLoaded = true,
}) => {
  const autoRef = useRef<google.maps.places.Autocomplete | null>(null);
  const webElRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState("");

  const extractField = (
    components: google.maps.GeocoderAddressComponent[],
    type: string,
  ) => components.find((c) => c.types.includes(type as any))?.long_name || "";

  const handlePlaceChanged = () => {
    if (!autoRef.current) return;
    const place = autoRef.current.getPlace();
    const components = (place?.address_components ||
      []) as google.maps.GeocoderAddressComponent[];

    const street = extractField(components, "route");
    const number = extractField(components, "street_number");
    const city =
      extractField(components, "locality") ||
      extractField(components, "sublocality") ||
      extractField(components, "administrative_area_level_2");
    const state = extractField(components, "administrative_area_level_1");
    const zip = extractField(components, "postal_code");
    const country = extractField(components, "country");
    const fullAddress =
      place?.formatted_address ||
      `${street} ${number}, ${city} ${zip}, ${country}`.trim();

    const addressLine1 = `${street} ${number}`.trim();
    setInputValue(addressLine1);
    onSelect({ addressLine1, city, state, zip, country, fullAddress });
  };

  // Load Google Extended Component Library for new PlaceAutocompleteElement
  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window === "undefined") return;
    if ((window as any).gmpxExtendedLoaded) return;
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/@googlemaps/extended-component-library@0.6/dist/index.min.js";
    script.async = true;
    script.onload = () => ((window as any).gmpxExtendedLoaded = true);
    document.head.appendChild(script);
  }, [isLoaded]);

  // Attach listener for the web component when present
  useEffect(() => {
    if (!webElRef.current) return;
    const handler = (e: any) => {
      try {
        const place = e?.target?.value?.place || e?.detail?.place;
        if (!place) return;
        const comps = (place.addressComponents || []) as any[];
        const find = (t: string) =>
          comps.find((c) => (c.types || c.type)?.includes?.(t))?.longText ||
          comps.find((c) => (c.types || c.type)?.includes?.(t))?.long_name || "";
        const street = find("route");
        const number = find("street_number");
        const city = find("locality") || find("sublocality") || find("administrative_area_level_2");
        const state = find("administrative_area_level_1");
        const zip = find("postal_code");
        const country = find("country");
        const fullAddress = place.formattedAddress || place.formatted_address || "";
        const addressLine1 = `${street} ${number}`.trim();
        setInputValue(addressLine1 || fullAddress || "");
        onSelect({
          addressLine1: addressLine1 || fullAddress || "",
          city,
          state,
          zip,
          country,
          fullAddress: fullAddress || `${street} ${number}, ${city} ${zip}, ${country}`,
        });
      } catch {}
    };
    webElRef.current.addEventListener("gmpx-placechange", handler);
    return () => webElRef.current?.removeEventListener("gmpx-placechange", handler);
  }, [onSelect, isLoaded]);

  if (!isLoaded) return null;

  // Prefer new web component if available
  if (typeof window !== "undefined" && customElements.get("gmpx-place-autocomplete")) {
    return (
      // @ts-ignore custom element
      <gmpx-place-autocomplete
        ref={webElRef}
        placeholder={placeholder}
        class={
          className ||
          "mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
        }
        style={{ display: "block" }}
      />
    );
  }

  return (
    <Autocomplete
      onLoad={(ref) => (autoRef.current = ref)}
      onPlaceChanged={handlePlaceChanged}
      options={{ fields: ["address_components", "formatted_address"], types: ["address"] }}
    >
      <input
        type="text"
        placeholder={placeholder}
        className={
          className ||
          "mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
        }
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        autoComplete="shipping street-address"
      />
    </Autocomplete>
  );
};
