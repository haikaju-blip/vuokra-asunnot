"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createContract,
  getLandlords,
  getPropertiesByLandlord,
  getAllTenants,
  type ContractInput,
} from "../actions";
import type { Landlord, Property, Tenant } from "@/lib/db/schema";

type Tab = "parties" | "dates" | "payments" | "terms" | "index";

export default function NewContractPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("parties");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference data
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Form state
  const [selectedLandlord, setSelectedLandlord] = useState<number | "">("");
  const [formData, setFormData] = useState<Partial<ContractInput>>({
    contractType: "indefinite",
    depositType: "cash",
    rentIncreaseType: "index",
    rentIncreaseMinPercent: 3.0,
    paymentDueDay: 2,
    noticePeriodMonths: 1,
    breachPenaltyMonths: 2,
    paymentReminderFee: 5.0,
    keyLossPenalty: 800.0,
    waterColdM3Price: 6.0,
    waterHotM3Price: 12.0,
    insuranceRequired: true,
    petsAllowed: false,
    smokingAllowed: false,
    sublettingAllowed: false,
    wallMountingAllowed: false,
    waterIncluded: false,
  });

  useEffect(() => {
    Promise.all([getLandlords(), getAllTenants()]).then(([l, t]) => {
      setLandlords(l);
      setTenants(t);
    });
  }, []);

  useEffect(() => {
    if (selectedLandlord) {
      getPropertiesByLandlord(Number(selectedLandlord)).then(setProperties);
    } else {
      setProperties([]);
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

    if (!formData.propertyId) {
      setError("Valitse kohde");
      setSaving(false);
      return;
    }
    if (!formData.tenantId) {
      setError("Valitse vuokralainen");
      setSaving(false);
      return;
    }
    if (!formData.startDate) {
      setError("Alkamispäivä on pakollinen");
      setSaving(false);
      return;
    }
    if (!formData.rentEur || formData.rentEur <= 0) {
      setError("Vuokra on pakollinen");
      setSaving(false);
      return;
    }

    try {
      const contract = await createContract(formData as ContractInput);
      router.push(`/admin/contracts/${contract.id}`);
    } catch (err) {
      setError("Tallentaminen epäonnistui");
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "parties", label: "Osapuolet" },
    { key: "dates", label: "Päivämäärät" },
    { key: "payments", label: "Maksut" },
    { key: "terms", label: "Ehdot" },
    { key: "index", label: "Indeksi" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Uusi sopimus</h1>
            <Link
              href="/admin/contracts"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Takaisin
            </Link>
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

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border pb-2">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm rounded-t-[12px] transition ${
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vuokranantaja <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedLandlord}
                    onChange={(e) => {
                      setSelectedLandlord(
                        e.target.value ? Number(e.target.value) : ""
                      );
                      updateField("propertyId", undefined as unknown as number);
                    }}
                    className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Valitse vuokranantaja...</option>
                    {landlords.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kohde <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.propertyId || ""}
                    onChange={(e) =>
                      updateField("propertyId", Number(e.target.value))
                    }
                    disabled={!selectedLandlord}
                    className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  >
                    <option value="">
                      {selectedLandlord
                        ? "Valitse kohde..."
                        : "Valitse ensin vuokranantaja"}
                    </option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.address}
                        {p.buildingName && ` (${p.buildingName})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vuokralainen <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tenantId || ""}
                    onChange={(e) =>
                      updateField("tenantId", Number(e.target.value))
                    }
                    className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Valitse vuokralainen...</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                        {t.phone && ` (${t.phone})`}
                      </option>
                    ))}
                  </select>
                  <Link
                    href="/admin/tenants/new"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    + Luo uusi vuokralainen
                  </Link>
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
                      Alkamispäivä <span className="text-red-500">*</span>
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
                      Vuokra €/kk <span className="text-red-500">*</span>
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
                      placeholder="Täysi vuokra jos tyhjä"
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Huomautus
                    </label>
                    <input
                      type="text"
                      value={formData.firstMonthNote || ""}
                      onChange={(e) =>
                        updateField("firstMonthNote", e.target.value)
                      }
                      placeholder="esim. Tammikuu 2026"
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vakuustyyppi
                    </label>
                    <select
                      value={formData.depositType || "cash"}
                      onChange={(e) => updateField("depositType", e.target.value)}
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="cash">Käteinen</option>
                      <option value="bank_guarantee">Pankkitakaus</option>
                      <option value="kela">Kela</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Eräpäivä
                    </label>
                    <select
                      value={formData.paymentDueDay || 2}
                      onChange={(e) =>
                        updateField("paymentDueDay", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value={1}>1. päivä</option>
                      <option value={2}>2. päivä</option>
                      <option value={5}>5. päivä</option>
                      <option value={15}>15. päivä</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="waterIncluded"
                    checked={!!formData.waterIncluded}
                    onChange={(e) =>
                      updateField("waterIncluded", e.target.checked)
                    }
                    className="rounded border-border"
                  />
                  <label htmlFor="waterIncluded" className="text-sm">
                    Vesi sisältyy vuokraan
                  </label>
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
                    {
                      field: "wallMountingAllowed",
                      label: "Seinäkiinnitys sallittu",
                    },
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Irtisanomisaika (kk)
                    </label>
                    <input
                      type="number"
                      value={formData.noticePeriodMonths || 1}
                      onChange={(e) =>
                        updateField("noticePeriodMonths", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sopimusrikkomus (kk vuokraa)
                    </label>
                    <input
                      type="number"
                      value={formData.breachPenaltyMonths || 2}
                      onChange={(e) =>
                        updateField(
                          "breachPenaltyMonths",
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Maksumuistutusmaksu €
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.paymentReminderFee || 5}
                      onChange={(e) =>
                        updateField(
                          "paymentReminderFee",
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Avaimen hukkaamisen korvaus €
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.keyLossPenalty || 800}
                      onChange={(e) =>
                        updateField("keyLossPenalty", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
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

                {formData.rentIncreaseType === "index" && (
                  <>
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
                        placeholder="esim. 2204"
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
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Korotuskuukausi
                  </label>
                  <select
                    value={formData.rentIncreaseMonth || ""}
                    onChange={(e) =>
                      updateField(
                        "rentIncreaseMonth",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="w-full px-4 py-2 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Ei määritetty</option>
                    {[
                      "Tammikuu",
                      "Helmikuu",
                      "Maaliskuu",
                      "Huhtikuu",
                      "Toukokuu",
                      "Kesäkuu",
                      "Heinäkuu",
                      "Elokuu",
                      "Syyskuu",
                      "Lokakuu",
                      "Marraskuu",
                      "Joulukuu",
                    ].map((name, i) => (
                      <option key={i + 1} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
            >
              {saving ? "Tallennetaan..." : "Tallenna sopimus"}
            </button>
            <Link
              href="/admin/contracts"
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
