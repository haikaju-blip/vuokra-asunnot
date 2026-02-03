"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTenant, type TenantInput } from "../actions";

export default function NewTenantPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

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
      const tenant = await createTenant(data);
      router.push(`/admin/tenants/${tenant.id}`);
    } catch (err) {
      setError("Tallentaminen epäonnistui");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Uusi vuokralainen</h1>
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

          <div className="bg-card border border-border rounded-[16px] p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nimi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Matti Meikäläinen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Henkilötunnus
              </label>
              <input
                type="text"
                name="ssn"
                className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="010190-123A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Osoite</label>
              <input
                type="text"
                name="address"
                className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Esimerkkikatu 1 A 1, 00100 Helsinki"
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
                  className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="040 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sähköposti
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="matti@example.com"
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
                className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Lisätietoja vuokralaisesta..."
              />
            </div>
          </div>

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
        </form>
      </main>
    </div>
  );
}
