"use client";

import ResourceManager, { Field } from "@/components/admin/ResourceManager";
import { inr } from "@/lib/format";

const fields: Field[] = [
  { name: "title", label: "Package name", type: "text", required: true },
  { name: "destination", label: "Destination", type: "text", required: true, half: true },
  { name: "price", label: "Price per person (INR)", type: "number", required: true, half: true },
  { name: "days", label: "Number of days", type: "number", required: true, half: true, default: 3 },
  { name: "nights", label: "Number of nights", type: "number", required: true, half: true, default: 2 },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "included", label: "What is included", type: "lines", help: "One item per line, e.g. Airport pickup" },
  { name: "excluded", label: "What is not included", type: "lines", help: "One item per line, e.g. Flights" },
  { name: "images", label: "Photos", type: "images", help: "The first photo is used as the cover." },
  { name: "featured", label: "Feature on the home page", type: "checkbox" },
  { name: "active", label: "Show on website", type: "checkbox", default: true },
];

export default function AdminPackages() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Packages</h1>
      <ResourceManager
        resource="packages"
        singular="package"
        fields={fields}
        row={(p) => ({
          title: p.title,
          sub: `${p.destination} · ${p.days}D/${p.nights}N · ${inr(p.price)}${p.featured ? " · Featured" : ""}`,
          image: p.images?.[0],
        })}
      />
    </div>
  );
}
