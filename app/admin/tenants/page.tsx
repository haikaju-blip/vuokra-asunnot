"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getTenants, deleteTenant } from "./actions";
import type { Tenant } from "@/lib/db/schema";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadTenants = async (searchTerm?: string) => {
    setLoading(true);
    const data = await getTenants(searchTerm);
    setTenants(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(() => {
      loadTenants(value);
    });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Haluatko varmasti poistaa vuokralaisen "${name}"?`)) return;
    await deleteTenant(id);
    loadTenants(search);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Vuokralaiset</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Kohteet
              </Link>
              <Link
                href="/admin/contracts"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sopimukset
              </Link>
              <Link
                href="/admin/tenants/new"
                className="text-sm px-4 py-2 rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                + Uusi vuokralainen
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Hae nimellä, puhelinnumerolla tai sähköpostilla..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Stats */}
        <div className="mb-4 text-sm text-muted-foreground">
          {loading ? "Ladataan..." : `${tenants.length} vuokralaista`}
          {isPending && " (päivitetään...)"}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-[16px] overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  #
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Nimi
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Henkilötunnus
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Puhelin
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Sähköposti
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Toiminnot
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {tenant.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{tenant.name}</p>
                    {tenant.address && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {tenant.address}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {tenant.ssn || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{tenant.phone || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {tenant.email ? (
                      <a
                        href={`mailto:${tenant.email}`}
                        className="text-primary hover:underline"
                      >
                        {tenant.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        className="text-sm px-3 py-1 rounded-[8px] border border-border hover:bg-secondary transition"
                      >
                        Muokkaa
                      </Link>
                      <button
                        onClick={() => handleDelete(tenant.id, tenant.name)}
                        className="text-sm px-3 py-1 rounded-[8px] border border-red-200 text-red-600 hover:bg-red-50 transition"
                      >
                        Poista
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && tenants.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {search
                ? "Ei hakutuloksia"
                : "Ei vuokralaisia"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
