"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeImageUrl } from "@/lib/image";

// Only downloaded when the admin opens the image field
const ImageUploader = dynamic(() => import("./ImageUploader"), { loading: () => <div className="skeleton h-24" /> });

export type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "lines" | "images" | "image" | "select" | "checkbox" | "date";
  required?: boolean;
  options?: string[];
  help?: string;
  half?: boolean; // show two fields per row
  default?: any;
};

type Props = {
  resource: "packages" | "vehicles" | "offers";
  singular: string;
  fields: Field[];
  /** returns the main line and the secondary line of each row */
  row: (item: any) => { title: string; sub: string; image?: string };
};

const blank = (fields: Field[]) =>
  Object.fromEntries(
    fields.map((f) => [
      f.name,
      f.default ??
        (f.type === "lines" || f.type === "images" ? [] : f.type === "checkbox" ? false : f.type === "number" ? "" : ""),
    ])
  );

export default function ResourceManager({ resource, singular, fields, row }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null); // null = closed, {} = new
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/${resource}?all=1&page=${page}&limit=8`, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setItems(d.items);
      setPages(d.pages);
      setTotal(d.total);
      if (d.page !== page) setPage(d.page);
    }
    setLoading(false);
  }, [resource, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    if (!confirm(`Delete this ${singular}? This cannot be undone.`)) return;
    await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
    load();
  }

  async function toggle(item: any) {
    await fetch(`/api/${resource}/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink/60">{total} total</p>
        <button
          onClick={() => {
            setError("");
            setEditing(blank(fields));
          }}
          className="btn-primary !py-2"
        >
          <Plus size={18} aria-hidden /> Add {singular}
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-card" aria-busy={loading}>
        {loading && !items.length ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}
          </div>
        ) : items.length ? (
          <ul className="divide-y divide-ink/10">
            {items.map((it) => {
              const r = row(it);
              return (
                <li key={it._id} className="flex flex-wrap items-center gap-4 p-4">
                  {r.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={normalizeImageUrl(r.image)}
                      alt=""
                      loading="lazy"
                      className="h-14 w-20 rounded-lg bg-mist object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-14 w-20 rounded-lg bg-mist" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.title}</p>
                    <p className="truncate text-sm text-ink/60">{r.sub}</p>
                  </div>
                  {!it.active && <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold">Hidden</span>}
                  <div className="flex gap-1">
                    <button onClick={() => toggle(it)} className="rounded-lg p-2 hover:bg-mist" aria-label={it.active ? "Hide from website" : "Show on website"} title={it.active ? "Hide from website" : "Show on website"}>
                      {it.active ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => {
                        setError("");
                        setEditing({ ...blank(fields), ...it, validTill: it.validTill ? String(it.validTill).slice(0, 10) : "" });
                      }}
                      className="rounded-lg p-2 hover:bg-mist"
                      aria-label="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => remove(it._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-10 text-center text-ink/60">Nothing here yet. Click “Add {singular}” to create the first one.</p>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-ghost !px-3 !py-2" aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="btn-ghost !px-3 !py-2" aria-label="Next page">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {editing && (
        <FormDrawer
          title={`${editing._id ? "Edit" : "Add"} ${singular}`}
          fields={fields}
          initial={editing}
          error={error}
          onClose={() => setEditing(null)}
          onSave={async (values) => {
            setError("");
            const body = prepare(values, fields);
            const res = await fetch(editing._id ? `/api/${resource}/${editing._id}` : `/api/${resource}`, {
              method: editing._id ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            if (!res.ok) {
              const d = await res.json().catch(() => ({}));
              setError(d.error || "Could not save. Check the fields and try again.");
              return false;
            }
            setEditing(null);
            if (!editing._id) setPage(1);
            load();
            return true;
          }}
        />
      )}
    </div>
  );
}

/** Convert form state into what the API expects. */
function prepare(values: Record<string, any>, fields: Field[]) {
  const out: Record<string, any> = {};
  for (const f of fields) {
    let v = values[f.name];
    if (f.type === "number") v = v === "" || v == null ? undefined : Number(v);
    if (f.type === "lines") v = (Array.isArray(v) ? v : String(v).split("\n")).map((s: string) => s.trim()).filter(Boolean);
    if (f.type === "images") v = (Array.isArray(v) ? v : []).map(normalizeImageUrl).filter(Boolean);
    if (f.type === "image") v = normalizeImageUrl(v || "");
    if (f.type === "date" && !v) v = null;
    out[f.name] = v;
  }
  return out;
}

function FormDrawer({
  title,
  fields,
  initial,
  error,
  onClose,
  onSave,
}: {
  title: string;
  fields: Field[];
  initial: Record<string, any>;
  error: string;
  onClose: () => void;
  onSave: (values: Record<string, any>) => Promise<boolean>;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...initial,
    // textarea editing for list fields
    ...Object.fromEntries(fields.filter((f) => f.type === "lines").map((f) => [f.name, (initial[f.name] || []).join("\n")])),
  }));
  const [saving, setSaving] = useState(false);

  const set = (name: string, v: any) => setValues((s) => ({ ...s, [name]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/50" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSave(values);
          setSaving(false);
        }}
        className="flex h-full w-full max-w-xl flex-col bg-paper shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-mist" aria-label="Close">
            <X />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {fields.map((f) => (
              <div key={f.name} className={f.half ? "col-span-1" : "col-span-2"}>
                {f.type !== "checkbox" && (
                  <label htmlFor={`f-${f.name}`} className="label">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                )}

                {(f.type === "text" || f.type === "number" || f.type === "date") && (
                  <input
                    id={`f-${f.name}`}
                    type={f.type}
                    required={f.required}
                    min={f.type === "number" ? 0 : undefined}
                    className="input"
                    value={values[f.name] ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}
                {(f.type === "textarea" || f.type === "lines") && (
                  <textarea
                    id={`f-${f.name}`}
                    required={f.required}
                    rows={f.type === "lines" ? 5 : 4}
                    className="input"
                    value={values[f.name] ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}
                {f.type === "select" && (
                  <select id={`f-${f.name}`} className="input" value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}>
                    {f.options!.map((o) => <option key={o}>{o}</option>)}
                  </select>
                )}
                {f.type === "checkbox" && (
                  <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
                    <input type="checkbox" className="h-5 w-5 accent-lagoon" checked={!!values[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
                    <span className="font-semibold">{f.label}</span>
                  </label>
                )}
                {f.type === "images" && <ImageUploader value={values[f.name] || []} onChange={(v) => set(f.name, v)} />}
                {f.type === "image" && (
                  <ImageUploader multiple={false} value={values[f.name] ? [values[f.name]] : []} onChange={(v) => set(f.name, v[0] || "")} />
                )}
                {f.help && <p className="mt-1 text-xs text-ink/50">{f.help}</p>}
              </div>
            ))}
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-ink/10 px-6 py-4">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving && <Loader2 className="animate-spin" size={18} aria-hidden />} {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
