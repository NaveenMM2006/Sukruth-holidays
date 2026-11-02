"use client";

import ResourceManager, { Field } from "@/components/admin/ResourceManager";
import { inr } from "@/lib/format";

const fields: Field[] = [
  { name: "name", label: "Vehicle name", type: "text", required: true, help: "e.g. Toyota Innova Crysta" },
  { name: "type", label: "Type", type: "select", options: ["Car", "SUV", "Van", "Tempo Traveller", "Mini bus", "Bus", "Bike"], half: true, default: "Car" },
  { name: "seats", label: "Seats", type: "number", half: true, default: 4 },
  { name: "pricePerDay", label: "Price per day (INR)", type: "number", required: true, half: true },
  { name: "pricePerKm", label: "Price per km (INR)", type: "number", half: true, default: 0 },
  { name: "description", label: "Description", type: "textarea" },
  { name: "features", label: "Features", type: "lines", help: "One per line, e.g. AC, Music system, Luggage space" },
  { name: "images", label: "Photos", type: "images" },
  { name: "active", label: "Show on website", type: "checkbox", default: true },
];

export default function AdminVehicles() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Vehicles</h1>
      <ResourceManager
        resource="vehicles"
        singular="vehicle"
        fields={fields}
        row={(v) => ({ title: v.name, sub: `${v.type} · ${v.seats} seats · ${inr(v.pricePerDay)}/day`, image: v.images?.[0] })}
      />
    </div>
  );
}
