"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getTenant, updateTenant, deleteTenant, type TenantInput } from "../actions";
import type { Tenant } from "@/lib/db/schema";

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getTenant(id).then((data) => {
      setTenant(data || null);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data: TenantInput = {
      name: formData.get("name") as string,
      ssn: formData.get("ssn") as string || null,
      address: formData.get("address") as string || null,
      phone: formData.get("phone") as string || null,
      email: formData.get("email") as string || null,
      notes: formData.get("notes") as string || null,
    };

    if (!data.name.trim()) {
      setError("Nimi on pakollinen");
      setSaving(false);
      return;
    }

    try {
      const updated = await updateTenant(id, data);
      setTenant(updated || null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Tallentaminen epäonnistui");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tenant) return;
    if (!confirm(`Haluatko varmasti poistaa vuokralaisen "${tenant.name}"?`)) return;

    await deleteTenant(id);
    router.push("/admin/tenants");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Ladataan...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-red-500">Vuokralaista ei löytynyt</p>
        <Link href="/admin/tenants" className="text-primary hover:underline mt-4 inline-block">
          Takaisin listaan
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{tenant.name}</h1>
              <p className="text-sm text-muted-foreground">Vuokralainen #{tenant.id}</p>
            </div>
            <Link
              href="/admin/tenants"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Takaisin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-[12px] bg-green-50 border border-green-200 text-green-700 text-sm">
              Tallennettu!
            </div>
          )}

          <div className="bg-card border border-border rounded-[16px] p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nimi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={tenant.name}
                className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Henkilötunnus
              </label>
              <input
                type="text"
                name="ssn"
                defaultValue={tenant.ssn || ""}
                className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Osoite</label>
              <input
                type="text"
                name="address"
                defaultValue={tenant.address || ""}
                className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Puhelinnumero
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={tenant.phone || ""}
                  className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sähköposti
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={tenant.email || ""}
                  className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Muistiinpanot
              </label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={tenant.notes || ""}
                className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {tenant.createdAt && (
              <p className="text-xs text-muted-foreground">
                Luotu: {new Date(tenant.createdAt).toLocaleDateString("fi-FI")}
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-between">
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
              >
                {saving ? "Tallennetaan..." : "Tallenna"}
              </button>
              <Link
                href="/admin/tenants"
                className="px-6 py-2 rounded-[12px] border border-border hover:bg-secondary transition"
              >
                Peruuta
              </Link>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 rounded-[12px] border border-red-200 text-red-600 hover:bg-red-50 transition"
            >
              Poista
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
