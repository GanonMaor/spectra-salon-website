import React, { useRef, useState } from "react";
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

  if (!isLoaded) return null;

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
