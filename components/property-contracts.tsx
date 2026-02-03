"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getContractsByProperty } from "@/app/admin/contracts/actions"

interface Contract {
  id: number
  startDate: string
  endDate: string | null
  rentEur: number
  status: string | null
}

interface Tenant {
  id: number
  name: string
}

interface ContractWithTenant {
  contract: Contract
  tenant: Tenant
}

interface PropertyContractsProps {
  propertyId: number
  onNewContract?: () => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("fi-FI", { day: "numeric", month: "numeric", year: "numeric" })
}

function getContractStatus(contract: Contract): "active" | "draft" | "ended" {
  const now = new Date()
  const start = new Date(contract.startDate)
  const end = contract.endDate ? new Date(contract.endDate) : null

  if (contract.status === "draft") return "draft"
  if (end && end < now) return "ended"
  if (start <= now) return "active"
  return "draft"
}

export function PropertyContracts({ propertyId, onNewContract }: PropertyContractsProps) {
  const [contracts, setContracts] = useState<ContractWithTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function loadContracts() {
      try {
        const data = await getContractsByProperty(propertyId)
        setContracts(data)
      } catch (err) {
        console.error("Failed to load contracts:", err)
      } finally {
        setLoading(false)
      }
    }
    loadContracts()
  }, [propertyId])

  const displayContracts = showAll ? contracts : contracts.slice(0, 3)
  const hasMore = contracts.length > 3

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Sopimukset</h2>
        </div>
        <div className="text-sm text-muted-foreground">Ladataan...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Sopimukset</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{contracts.length} kpl</span>
          <Link
            href={`/admin/contracts/new?propertyId=${propertyId}`}
            className="w-6 h-6 flex items-center justify-center rounded-[6px] border border-border hover:bg-secondary transition text-muted-foreground hover:text-foreground"
            title="Uusi sopimus"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {contracts.length === 0 ? (
        <Link
          href={`/admin/contracts/new?propertyId=${propertyId}`}
          className="block p-3 rounded-[8px] border border-dashed border-border text-center text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition"
        >
          Ei sopimuksia — luo ensimmäinen
        </Link>
      ) : (
        <div className="space-y-2">
          {displayContracts.map(({ contract, tenant }) => {
            const status = getContractStatus(contract)

            return (
              <Link
                key={contract.id}
                href={`/admin/contracts/${contract.id}`}
                className="block p-2.5 rounded-[8px] border border-border hover:bg-secondary/50 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Status + Name */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          status === "active"
                            ? "bg-green-500"
                            : status === "draft"
                              ? "bg-yellow-500"
                              : "bg-muted-foreground/40"
                        }`}
                      />
                      <span className="text-sm font-medium truncate">{tenant.name}</span>
                    </div>

                    {/* Dates + Rent */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDate(contract.startDate)}
                        {" → "}
                        {contract.endDate ? formatDate(contract.endDate) : ""}
                      </span>
                      <span className="text-foreground font-medium">{contract.rentEur} €/kk</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-[4px] font-medium flex-shrink-0 ${
                      status === "active"
                        ? "bg-green-100 text-green-700"
                        : status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {status === "active" ? "Voimassa" : status === "draft" ? "Luonnos" : "Päättynyt"}
                  </span>
                </div>
              </Link>
            )
          })}

          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-xs text-primary hover:underline py-1"
            >
              Näytä kaikki ({contracts.length})
            </button>
          )}

          {showAll && hasMore && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-1"
            >
              Näytä vähemmän
            </button>
          )}
        </div>
      )}

      <Link
        href="/admin/contracts"
        className="block mt-2 text-xs text-primary hover:underline"
      >
        Kaikki sopimukset →
      </Link>
    </div>
  )
}
