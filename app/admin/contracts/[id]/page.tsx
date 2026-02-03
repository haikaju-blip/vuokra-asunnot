"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getContract,
  updateContract,
  deleteContract,
  getLandlords,
  getPropertiesByLandlord,
  getAllTenants,
  type ContractInput,
} from "../actions";
import type { Contract, Tenant, Property, Landlord } from "@/lib/db/schema";

type Tab = "parties" | "dates" | "payments" | "terms" | "index" | "documents";

type ContractData = {
  contract: Contract;
  tenant: Tenant;
  property: Property;
  landlord: Landlord;
};

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [data, setData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("parties");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Reference data
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Form state
  const [selectedLandlord, setSelectedLandlord] = useState<number | "">("");
  const [formData, setFormData] = useState<Partial<ContractInput>>({});

  useEffect(() => {
    Promise.all([getContract(id), getLandlords(), getAllTenants()]).then(
      ([contractData, l, t]) => {
        if (contractData) {
          setData(contractData);
          setSelectedLandlord(contractData.landlord.id);
          setFormData({
            propertyId: contractData.contract.propertyId,
            tenantId: contractData.contract.tenantId,
            contractType: contractData.contract.contractType || "indefinite",
            startDate: contractData.contract.startDate,
            endDate: contractData.contract.endDate || undefined,
            firstCancelDate: contractData.contract.firstCancelDate || undefined,
            contractDate: contractData.contract.contractDate || undefined,
            signedDate: contractData.contract.signedDate || undefined,
            rentEur: contractData.contract.rentEur,
            waterFeeEur: contractData.contract.waterFeeEur ?? undefined,
            totalRentEur: contractData.contract.totalRentEur ?? undefined,
            firstMonthRent: contractData.contract.firstMonthRent ?? undefined,
            firstMonthNote: contractData.contract.firstMonthNote || undefined,
            depositEur: contractData.contract.depositEur ?? undefined,
            depositType: contractData.contract.depositType || "cash",
            depositNote: contractData.contract.depositNote || undefined,
            paymentDueDay: contractData.contract.paymentDueDay ?? 2,
            waterColdM3Price: contractData.contract.waterColdM3Price ?? 6.0,
            waterHotM3Price: contractData.contract.waterHotM3Price ?? 12.0,
            waterIncluded: !!contractData.contract.waterIncluded,
            baseIndex: contractData.contract.baseIndex ?? undefined,
            rentIncreaseType: contractData.contract.rentIncreaseType || "index",
            rentIncreaseMinPercent:
              contractData.contract.rentIncreaseMinPercent ?? 3.0,
            rentIncreaseMonth: contractData.contract.rentIncreaseMonth ?? undefined,
            noticePeriodMonths: contractData.contract.noticePeriodMonths ?? 1,
            breachPenaltyMonths: contractData.contract.breachPenaltyMonths ?? 2,
            paymentReminderFee: contractData.contract.paymentReminderFee ?? 5.0,
            keyLossPenalty: contractData.contract.keyLossPenalty ?? 800.0,
            petsAllowed: !!contractData.contract.petsAllowed,
            smokingAllowed: !!contractData.contract.smokingAllowed,
            sublettingAllowed: !!contractData.contract.sublettingAllowed,
            sublettingNote: contractData.contract.sublettingNote || undefined,
            insuranceRequired: !!contractData.contract.insuranceRequired,
            wallMountingAllowed: !!contractData.contract.wallMountingAllowed,
            maxOccupants: contractData.contract.maxOccupants ?? undefined,
            status: contractData.contract.status || "active",
            notes: contractData.contract.notes || undefined,
          });
        }
        setLandlords(l);
        setTenants(t);
        setLoading(false);
      }
    );
  }, [id]);

  useEffect(() => {
    if (selectedLandlord) {
      getPropertiesByLandlord(Number(selectedLandlord)).then(setProperties);
    }
  }, [selectedLandlord]);

  const updateField = <K extends keyof ContractInput>(
    field: K,
    value: ContractInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateContract(id, formData);
      const updated = await getContract(id);
      if (updated) setData(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Tallentaminen epäonnistui");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    if (
      !confirm(`Haluatko varmasti poistaa sopimuksen #${id}?`)
    )
      return;

    await deleteContract(id);
    router.push("/admin/contracts");
  };

  const handleGenerateDocuments = async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(`/api/contracts/${id}/generate`, {
        method: "POST",
      });
      const result = await res.json();

      if (result.success) {
        const updated = await getContract(id);
        if (updated) setData(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Dokumenttien generointi epäonnistui");
      }
    } catch (err) {
      setError("Dokumenttien generointi epäonnistui");
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fi-FI");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Ladataan...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-red-500">Sopimusta ei löytynyt</p>
        <Link
          href="/admin/contracts"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Takaisin listaan
        </Link>
      </div>
    );
  }

  const { contract, tenant, property, landlord } = data;

  const tabs: { key: Tab; label: string }[] = [
    { key: "parties", label: "Osapuolet" },
    { key: "dates", label: "Päivämäärät" },
    { key: "payments", label: "Maksut" },
    { key: "terms", label: "Ehdot" },
    { key: "index", label: "Indeksi" },
    { key: "documents", label: "Dokumentit" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                Sopimus #{contract.id}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tenant.name} - {property.address.split(",")[0]}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  contract.status === "active"
                    ? "bg-green-100 text-green-700"
                    : contract.status === "ended"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {contract.status === "active"
                  ? "Voimassa"
                  : contract.status === "ended"
                  ? "Päättynyt"
                  : "Luonnos"}
              </span>
              <Link
                href="/admin/contracts"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Takaisin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm rounded-t-[12px] transition whitespace-nowrap ${
                  activeTab === key
                    ? "bg-card border border-border border-b-card text-foreground font-medium -mb-[1px]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-card border border-border rounded-[16px] p-6">
            {activeTab === "parties" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-[12px]">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Vuokranantaja
                    </p>
                    <p className="font-medium">{landlord.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {landlord.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Kohde</p>
                    <p className="font-medium">{property.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.areaM2} m² · {property.rooms}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vuokralainen
                  </label>
                  <select
                    value={formData.tenantId || ""}
                    onChange={(e) =>
                      updateField("tenantId", Number(e.target.value))
                    }
                    className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                        {t.phone && ` (${t.phone})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sopimuksen tyyppi
                  </label>
                  <select
                    value={formData.contractType || "indefinite"}
                    onChange={(e) => updateField("contractType", e.target.value)}
                    className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="indefinite">Toistaiseksi voimassa</option>
                    <option value="fixed">Määräaikainen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || "active"}
                    onChange={(e) => updateField("status", e.target.value)}
                    className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="draft">Luonnos</option>
                    <option value="active">Voimassa</option>
                    <option value="ended">Päättynyt</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "dates" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sopimuspäivä
                    </label>
                    <input
                      type="date"
                      value={formData.contractDate || ""}
                      onChange={(e) =>
                        updateField("contractDate", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Allekirjoituspäivä
                    </label>
                    <input
                      type="date"
                      value={formData.signedDate || ""}
                      onChange={(e) => updateField("signedDate", e.target.value)}
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Alkamispäivä
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ""}
                      onChange={(e) => updateField("startDate", e.target.value)}
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ensimmäinen irtisanomispäivä
                    </label>
                    <input
                      type="date"
                      value={formData.firstCancelDate || ""}
                      onChange={(e) =>
                        updateField("firstCancelDate", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {formData.contractType === "fixed" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Päättymispäivä
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || ""}
                      onChange={(e) => updateField("endDate", e.target.value)}
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vuokra €/kk
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rentEur || ""}
                      onChange={(e) =>
                        updateField("rentEur", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vesimaksu €/kk
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.waterFeeEur || ""}
                      onChange={(e) =>
                        updateField(
                          "waterFeeEur",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Yhteensä €/kk
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        (formData.rentEur || 0) + (formData.waterFeeEur || 0)
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-secondary/50 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ensimmäisen kuukauden vuokra €
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.firstMonthRent || ""}
                      onChange={(e) =>
                        updateField(
                          "firstMonthRent",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vakuus €
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.depositEur || ""}
                      onChange={(e) =>
                        updateField(
                          "depositEur",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { field: "petsAllowed", label: "Lemmikit sallittu" },
                    { field: "smokingAllowed", label: "Tupakointi sallittu" },
                    { field: "sublettingAllowed", label: "Alivuokraus sallittu" },
                    { field: "insuranceRequired", label: "Kotivakuutus vaadittu" },
                  ].map(({ field, label }) => (
                    <div key={field} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={field}
                        checked={
                          !!(formData[field as keyof ContractInput] as boolean)
                        }
                        onChange={(e) =>
                          updateField(
                            field as keyof ContractInput,
                            e.target.checked as never
                          )
                        }
                        className="rounded border-border"
                      />
                      <label htmlFor={field} className="text-sm">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Muistiinpanot
                  </label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "index" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Korotustyyppi
                  </label>
                  <select
                    value={formData.rentIncreaseType || "index"}
                    onChange={(e) =>
                      updateField("rentIncreaseType", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="index">Elinkustannusindeksi</option>
                    <option value="percent">Kiinteä prosentti</option>
                    <option value="fixed">Kiinteä vuokra</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Perusindeksi
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.baseIndex || ""}
                      onChange={(e) =>
                        updateField(
                          "baseIndex",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Minimikorotus %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.rentIncreaseMinPercent || 3}
                      onChange={(e) =>
                        updateField(
                          "rentIncreaseMinPercent",
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-[12px]">
                  <h3 className="font-medium mb-2">Sopimusdokumentit</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generoi DOCX-sopimuspohja ja PDF automaattisesti sopimuksen
                    tiedoista.
                  </p>

                  <button
                    type="button"
                    onClick={handleGenerateDocuments}
                    disabled={generating}
                    className="px-4 py-2 rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {generating
                      ? "Generoidaan..."
                      : contract.docxPath
                      ? "Generoi uudelleen"
                      : "Generoi dokumentit"}
                  </button>
                </div>

                {contract.docxPath && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Generoidut tiedostot</h4>
                    <div className="space-y-1">
                      <a
                        href={`/api/contracts/${id}/download?type=docx`}
                        className="flex items-center gap-2 p-2 rounded-[8px] border border-border hover:bg-secondary transition text-sm"
                      >
                        <span className="text-blue-600">DOCX</span>
                        <span className="text-muted-foreground truncate">
                          {contract.docxPath.split("/").pop()}
                        </span>
                      </a>
                      {contract.pdfPath && (
                        <a
                          href={`/api/contracts/${id}/download?type=pdf`}
                          className="flex items-center gap-2 p-2 rounded-[8px] border border-border hover:bg-secondary transition text-sm"
                        >
                          <span className="text-red-600">PDF</span>
                          <span className="text-muted-foreground truncate">
                            {contract.pdfPath.split("/").pop()}
                          </span>
                        </a>
                      )}
                    </div>
                    {contract.updatedAt && (
                      <p className="text-xs text-muted-foreground">
                        Päivitetty: {formatDate(contract.updatedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
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
                href="/admin/contracts"
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
