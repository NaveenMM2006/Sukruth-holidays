"use client";

import ResourceManager, { Field } from "@/components/admin/ResourceManager";

const fields: Field[] = [
  { name: "title", label: "Headline", type: "text", required: true },
  { name: "badge", label: "Label", type: "select", options: ["Hot", "New", "Limited", "News", "Update"], half: true, default: "Hot" },
  { name: "validTill", label: "Valid till (optional)", type: "date", half: true },
  { name: "body", label: "Details", type: "textarea", required: true },
  { name: "link", label: "Link (optional)", type: "text", help: "Opens when a visitor clicks the card, e.g. a package page or a news article." },
  { name: "image", label: "Picture (optional)", type: "image" },
  { name: "active", label: "Show on website", type: "checkbox", default: true },
];

export default function AdminOffers() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Offers and news</h1>
      <ResourceManager
        resource="offers"
        singular="offer"
        fields={fields}
        row={(o) => ({ title: o.title, sub: `${o.badge}${o.validTill ? " · till " + String(o.validTill).slice(0, 10) : ""}`, image: o.image })}
      />
    </div>
  );
}
