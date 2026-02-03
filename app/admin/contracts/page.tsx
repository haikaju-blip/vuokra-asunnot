"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getContracts, deleteContract } from "./actions";
import type { Contract, Tenant, Property, Landlord } from "@/lib/db/schema";

type ContractWithRelations = {
  contract: Contract;
  tenant: Tenant;
  property: Property;
  landlord: Landlord;
};

type StatusFilter = "all" | "active" | "ended" | "draft";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isPending, startTransition] = useTransition();

  const loadContracts = async (searchTerm?: string, status?: string) => {
    setLoading(true);
    const data = await getContracts(searchTerm, status);
    setContracts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(() => {
      loadContracts(value, statusFilter);
    });
  };

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    startTransition(() => {
      loadContracts(search, status);
    });
  };

  const handleDelete = async (id: number, tenantName: string) => {
    if (!confirm(`Haluatko varmasti poistaa sopimuksen (${tenantName})?`)) return;
    await deleteContract(id);
    loadContracts(search, statusFilter);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fi-FI");
  };

  const counts = {
    all: contracts.length,
    active: contracts.filter((c) => c.contract.status === "active").length,
    ended: contracts.filter((c) => c.contract.status === "ended").length,
    draft: contracts.filter((c) => c.contract.status === "draft").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Sopimukset</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Kohteet
              </Link>
              <Link
                href="/admin/tenants"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Vuokralaiset
              </Link>
              <Link
                href="/admin/contracts/new"
                className="text-sm px-4 py-2 rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                + Uusi sopimus
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Hae vuokralaisella tai osoitteella..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 min-w-[300px] px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-2">
            {(
              [
                { key: "all", label: "Kaikki" },
                { key: "active", label: "Voimassa" },
                { key: "ended", label: "Päättyneet" },
                { key: "draft", label: "Luonnos" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleStatusFilter(key)}
                className={`px-4 py-2 text-sm rounded-[12px] border transition ${
                  statusFilter === key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {label} ({counts[key]})
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 text-sm text-muted-foreground">
          {loading ? "Ladataan..." : `${contracts.length} sopimusta`}
          {isPending && " (päivitetään...)"}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-[16px] overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  #
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Vuokralainen
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Kohde
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Vuokranantaja
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Alkaa
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Vuokra
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Toiminnot
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contracts.map(({ contract, tenant, property, landlord }) => (
                <tr key={contract.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {contract.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{tenant.name}</p>
                    {tenant.phone && (
                      <p className="text-xs text-muted-foreground">
                        {tenant.phone}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{property.address.split(",")[0]}</p>
                    {property.buildingName && (
                      <p className="text-xs text-muted-foreground">
                        {property.buildingName}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {landlord.name.split(" ")[0]}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDate(contract.startDate)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {contract.rentEur} + {contract.waterFeeEur || 0} ={" "}
                    <strong>{(contract.rentEur + (contract.waterFeeEur || 0))} €</strong>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={contract.status || "draft"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/contracts/${contract.id}`}
                        className="text-sm px-3 py-1 rounded-[8px] border border-border hover:bg-secondary transition"
                      >
                        Avaa
                      </Link>
                      <button
                        onClick={() => handleDelete(contract.id, tenant.name)}
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

          {!loading && contracts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {search || statusFilter !== "all"
                ? "Ei hakutuloksia"
                : "Ei sopimuksia"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    ended: "bg-gray-100 text-gray-700",
    draft: "bg-yellow-100 text-yellow-700",
  };

  const labels: Record<string, string> = {
    active: "Voimassa",
    ended: "Päättynyt",
    draft: "Luonnos",
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs rounded-[6px] ${
        styles[status] || styles.draft
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
