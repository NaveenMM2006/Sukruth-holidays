"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Car,
  Users,
  Clock,
  Route,
  Loader2,
  Sparkles,
  Info,
  CheckCircle,
} from "lucide-react";
import {
  Place,
  RouteResult,
  VehicleTier,
  SAMPLE_VEHICLES,
  POPULAR_PLACES,
  searchPlaces,
  getDrivingRoute,
  formatDuration,
} from "@/lib/routing";
import { inr } from "@/lib/format";
import BookingModal from "@/components/BookingModal";
import SafeImage from "@/components/SafeImage";

// Dynamic import for Leaflet map with SSR disabled
const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[380px] w-full items-center justify-center rounded-3xl bg-mist text-ink/40">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="animate-spin" size={18} />
        <span>Loading map...</span>
      </div>
    </div>
  ),
});

export default function FareCalculator() {
  const [startQuery, setStartQuery] = useState("Bengaluru");
  const [endQuery, setEndQuery] = useState("Mysuru");
  const [startPlace, setStartPlace] = useState<Place | null>(POPULAR_PLACES[0]); // Bengaluru
  const [endPlace, setEndPlace] = useState<Place | null>(POPULAR_PLACES[1]); // Mysuru

  const [startSuggestions, setStartSuggestions] = useState<Place[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Place[]>([]);
  const [searchingStart, setSearchingStart] = useState(false);
  const [searchingEnd, setSearchingEnd] = useState(false);

  const [route, setRoute] = useState<RouteResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [vehicles] = useState<VehicleTier[]>(SAMPLE_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTier>(
    SAMPLE_VEHICLES.find((v) => v.default) || SAMPLE_VEHICLES[0]
  );

  const startDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const endDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Compute route when start or end place changes
  useEffect(() => {
    if (!startPlace || !endPlace) {
      setRoute(null);
      return;
    }

    let active = true;
    setCalculating(true);

    getDrivingRoute(startPlace, endPlace)
      .then((res) => {
        if (active) {
          setRoute(res);
          setCalculating(false);
        }
      })
      .catch(() => {
        if (active) setCalculating(false);
      });

    return () => {
      active = false;
    };
  }, [startPlace, endPlace]);

  // Autocomplete search for pickup
  function handleStartInput(val: string) {
    setStartQuery(val);
    setStartPlace(null);
    if (startDebounceRef.current) clearTimeout(startDebounceRef.current);
    if (val.trim().length < 2) {
      setStartSuggestions([]);
      return;
    }
    setSearchingStart(true);
    startDebounceRef.current = setTimeout(async () => {
      const places = await searchPlaces(val);
      setStartSuggestions(places);
      setSearchingStart(false);
    }, 350);
  }

  // Autocomplete search for drop
  function handleEndInput(val: string) {
    setEndQuery(val);
    setEndPlace(null);
    if (endDebounceRef.current) clearTimeout(endDebounceRef.current);
    if (val.trim().length < 2) {
      setEndSuggestions([]);
      return;
    }
    setSearchingEnd(true);
    endDebounceRef.current = setTimeout(async () => {
      const places = await searchPlaces(val);
      setEndSuggestions(places);
      setSearchingEnd(false);
    }, 350);
  }

  // Swap pickup & drop-off
  function handleSwap() {
    const tempQ = startQuery;
    const tempP = startPlace;
    setStartQuery(endQuery);
    setStartPlace(endPlace);
    setEndQuery(tempQ);
    setEndPlace(tempP);
    setStartSuggestions([]);
    setEndSuggestions([]);
  }

  // Quick popular route picker
  function applyQuickRoute(from: Place, to: Place) {
    setStartQuery(from.name);
    setStartPlace(from);
    setEndQuery(to.name);
    setEndPlace(to);
    setStartSuggestions([]);
    setEndSuggestions([]);
  }

  // Distance & fare calculations
  const rawDistance = route?.distanceKm || 0;
  const effectiveDistance = tripType === "round-trip" ? Math.round(rawDistance * 2 * 10) / 10 : rawDistance;
  const ratePerKm = selectedVehicle.pricePerKm;
  const totalEstimatedFare = Math.round(effectiveDistance * ratePerKm);

  const bookingInitialMessage = startPlace && endPlace
    ? `Calculated Trip: ${startPlace.name} to ${endPlace.name} (${effectiveDistance} km, ${tripType === "round-trip" ? "Round Trip" : "One Way"}). Selected vehicle: ${selectedVehicle.name} @ ₹${ratePerKm}/km. Estimated Fare: ${inr(totalEstimatedFare)}.`
    : "";

  return (
    <div className="space-y-8">
      {/* Top Controller Grid: Form (Left) & Map (Right) */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Control Column (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl bg-white p-6 shadow-card sm:p-7">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <h2 className="text-xl font-bold">Route & Distance</h2>
              {/* Trip Type Toggle */}
              <div className="flex rounded-xl bg-mist p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTripType("one-way")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    tripType === "one-way" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("round-trip")}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    tripType === "round-trip" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  Round Trip (2x)
                </button>
              </div>
            </div>

            {/* Inputs Container */}
            <div className="relative mt-5 space-y-3">
              {/* Pickup Input */}
              <div className="relative">
                <label htmlFor="pickup-input" className="block text-xs font-semibold uppercase tracking-wider text-ink/60">
                  Pickup Location
                </label>
                <div className="relative mt-1">
                  <div className="absolute left-3.5 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                    A
                  </div>
                  <input
                    id="pickup-input"
                    type="text"
                    value={startQuery}
                    onChange={(e) => handleStartInput(e.target.value)}
                    placeholder="Enter pickup city or landmark..."
                    className="input !pl-10 !pr-10"
                    autoComplete="off"
                  />
                  {searchingStart && (
                    <Loader2 size={16} className="absolute right-3.5 top-3 animate-spin text-ink/40" />
                  )}
                </div>

                {/* Pickup Suggestions Dropdown */}
                {startSuggestions.length > 0 && !startPlace && (
                  <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-ink/10 bg-white py-1 shadow-2xl">
                    {startSuggestions.map((p, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => {
                            setStartQuery(p.name);
                            setStartPlace(p);
                            setStartSuggestions([]);
                          }}
                          className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-mist"
                        >
                          <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-ink">{p.name}</p>
                            <p className="line-clamp-1 text-xs text-ink/60">{p.label}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-end pr-2">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-1 text-xs font-medium text-ink/70 shadow-sm hover:bg-mist hover:text-ink active:scale-95"
                  title="Swap locations"
                >
                  <ArrowUpDown size={12} /> Swap
                </button>
              </div>

              {/* Drop-off Input */}
              <div className="relative">
                <label htmlFor="drop-input" className="block text-xs font-semibold uppercase tracking-wider text-ink/60">
                  Drop-off Location
                </label>
                <div className="relative mt-1">
                  <div className="absolute left-3.5 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    B
                  </div>
                  <input
                    id="drop-input"
                    type="text"
                    value={endQuery}
                    onChange={(e) => handleEndInput(e.target.value)}
                    placeholder="Enter destination city or landmark..."
                    className="input !pl-10 !pr-10"
                    autoComplete="off"
                  />
                  {searchingEnd && (
                    <Loader2 size={16} className="absolute right-3.5 top-3 animate-spin text-ink/40" />
                  )}
                </div>

                {/* Drop-off Suggestions Dropdown */}
                {endSuggestions.length > 0 && !endPlace && (
                  <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-ink/10 bg-white py-1 shadow-2xl">
                    {endSuggestions.map((p, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => {
                            setEndQuery(p.name);
                            setEndPlace(p);
                            setEndSuggestions([]);
                          }}
                          className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-mist"
                        >
                          <MapPin size={16} className="mt-0.5 shrink-0 text-red-600" />
                          <div>
                            <p className="font-semibold text-ink">{p.name}</p>
                            <p className="line-clamp-1 text-xs text-ink/60">{p.label}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Quick-Pick Popular Routes */}
            <div className="mt-6 border-t border-ink/10 pt-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/60">
                <Sparkles size={14} className="text-marigold" /> Popular Trips:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[
                  { name: "Bengaluru → Mysuru", from: POPULAR_PLACES[0], to: POPULAR_PLACES[1] },
                  { name: "Bengaluru → Coorg", from: POPULAR_PLACES[0], to: POPULAR_PLACES[2] },
                  { name: "Bengaluru → Ooty", from: POPULAR_PLACES[0], to: POPULAR_PLACES[3] },
                  { name: "Bengaluru → Chikmagalur", from: POPULAR_PLACES[0], to: POPULAR_PLACES[4] },
                  { name: "Bengaluru → Wayanad", from: POPULAR_PLACES[0], to: POPULAR_PLACES[5] },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => applyQuickRoute(item.from, item.to)}
                    className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink/80 transition-colors hover:bg-ink hover:text-white"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/60">
                <Route size={15} className="text-lagoon" />
                <span>Road Distance</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-ink">
                {calculating ? (
                  <Loader2 className="animate-spin inline" size={20} />
                ) : route ? (
                  `${effectiveDistance} km`
                ) : (
                  "--"
                )}
              </p>
              {tripType === "round-trip" && route && (
                <p className="text-[11px] text-ink/50">({rawDistance} km x 2 return)</p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/60">
                <Clock size={15} className="text-marigold" />
                <span>Est. Drive Time</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-ink">
                {calculating ? (
                  <Loader2 className="animate-spin inline" size={20} />
                ) : route ? (
                  formatDuration(route.durationMinutes * (tripType === "round-trip" ? 2 : 1))
                ) : (
                  "--"
                )}
              </p>
              <p className="text-[11px] text-ink/50">via best highway</p>
            </div>
          </div>
        </div>

        {/* Right Map Column (7 Cols) */}
        <div className="h-[460px] lg:col-span-7 lg:h-auto">
          <RouteMap start={startPlace} end={endPlace} route={route} />
        </div>
      </div>

      {/* Vehicle Selection & Fare Breakdown */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Select Vehicle & Compare Fares</h2>
          <p className="mt-1 text-sm text-ink/70">
            Per-kilometer pricing includes vehicle, fuel, and experienced driver. Click a vehicle to calculate fare.
          </p>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => {
            const isSelected = selectedVehicle.id === v.id;
            const vehicleFare = route ? Math.round(effectiveDistance * v.pricePerKm) : null;

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border-2 transition-all ${
                  isSelected
                    ? "border-lagoon bg-white shadow-xl ring-2 ring-lagoon/20 -translate-y-1"
                    : "border-transparent bg-white shadow-card hover:border-ink/20 hover:-translate-y-0.5"
                }`}
              >
                {/* Vehicle Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-mist">
                  <SafeImage
                    src={v.image}
                    alt={v.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 350px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    <Users size={12} /> {v.seats} Seats
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-marigold px-2.5 py-1 text-xs font-bold text-ink">
                    ₹{v.pricePerKm}/km
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-ink">{v.name}</h3>
                    <span className="text-xs font-medium text-ink/50 uppercase">{v.type}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/65">{v.description}</p>

                  {/* Calculated Price on Card */}
                  <div className="mt-4 flex items-end justify-between border-t border-ink/10 pt-4">
                    <div>
                      <span className="block text-[11px] font-medium text-ink/50">Base Rate</span>
                      <span className="text-sm font-semibold text-ink">₹{v.pricePerKm} / km</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] font-medium text-ink/50">Estimated Fare</span>
                      <span className="font-display text-xl font-bold text-lagoon-dark">
                        {vehicleFare ? inr(vehicleFare) : `₹${v.pricePerKm}/km`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Fare Summary Banner */}
        <div className="rounded-3xl bg-ink p-6 text-white shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-marigold px-3 py-1 text-xs font-bold text-ink">
                  Selected: {selectedVehicle.name}
                </span>
                <span className="text-xs text-white/70">
                  {tripType === "round-trip" ? "Round Trip" : "One Way"} · {selectedVehicle.seats} seats
                </span>
              </div>
              <p className="text-sm text-white/80">
                {startPlace && endPlace ? (
                  <>
                    From <strong className="text-white">{startPlace.name}</strong> to{" "}
                    <strong className="text-white">{endPlace.name}</strong> ({effectiveDistance} km @ ₹
                    {ratePerKm}/km)
                  </>
                ) : (
                  "Select pickup and destination to calculate final amount"
                )}
              </p>
            </div>

            {/* Total Amount & Book Button */}
            <div className="flex flex-wrap items-center gap-6 lg:justify-end">
              <div className="text-left lg:text-right">
                <p className="text-xs uppercase tracking-wider text-white/60">Estimated Total Fare</p>
                <p className="font-display text-4xl font-extrabold text-marigold">
                  {route ? inr(totalEstimatedFare) : `--`}
                </p>
                <p className="text-[11px] text-white/60">Fuel & driver included</p>
              </div>

              {/* Booking Modal integrated */}
              <BookingModal
                kind="vehicle"
                itemId={selectedVehicle.id}
                itemTitle={`${selectedVehicle.name} (${startPlace?.name || ""} to ${endPlace?.name || ""})`}
                initialMessage={bookingInitialMessage}
                label="Book This Vehicle"
                className="btn-primary !py-3.5 !px-8 text-base font-bold shadow-lg transition-transform hover:scale-105"
              />
            </div>
          </div>

          {/* Pricing Inclusions Footer */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-4 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-400" /> Fuel & experienced driver included
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-400" /> Clean AC vehicle guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <Info size={14} className="text-marigold" /> Toll, state permits & parking charges payable at actuals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

