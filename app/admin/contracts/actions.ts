"use server";

import { db, contracts, tenants, properties, landlords } from "@/lib/db";
import { eq, desc, like, or, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ContractInput = {
  propertyId: number;
  tenantId: number;
  contractType?: string | null;
  startDate: string;
  endDate?: string | null;
  firstCancelDate?: string | null;
  contractDate?: string | null;
  signedDate?: string | null;
  rentEur: number;
  waterFeeEur?: number | null;
  totalRentEur?: number | null;
  firstMonthRent?: number | null;
  firstMonthNote?: string | null;
  depositEur?: number | null;
  depositType?: string | null;
  depositNote?: string | null;
  paymentDueDay?: number | null;
  waterColdM3Price?: number | null;
  waterHotM3Price?: number | null;
  waterIncluded?: boolean | null;
  baseIndex?: number | null;
  rentIncreaseType?: string | null;
  rentIncreaseMinPercent?: number | null;
  rentIncreaseMonth?: number | null;
  noticePeriodMonths?: number | null;
  breachPenaltyMonths?: number | null;
  paymentReminderFee?: number | null;
  keyLossPenalty?: number | null;
  petsAllowed?: boolean | null;
  smokingAllowed?: boolean | null;
  sublettingAllowed?: boolean | null;
  sublettingNote?: string | null;
  insuranceRequired?: boolean | null;
  wallMountingAllowed?: boolean | null;
  maxOccupants?: number | null;
  status?: string | null;
  notes?: string | null;
};

export async function getContracts(search?: string, status?: string) {
  const allContracts = db
    .select({
      contract: contracts,
      tenant: tenants,
      property: properties,
      landlord: landlords,
    })
    .from(contracts)
    .innerJoin(tenants, eq(contracts.tenantId, tenants.id))
    .innerJoin(properties, eq(contracts.propertyId, properties.id))
    .innerJoin(landlords, eq(properties.landlordId, landlords.id))
    .orderBy(desc(contracts.id))
    .all();

  let filtered = allContracts;

  if (status && status !== "all") {
    filtered = filtered.filter((c) => c.contract.status === status);
  }

  if (search && search.trim()) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.tenant.name.toLowerCase().includes(term) ||
        c.property.address.toLowerCase().includes(term)
    );
  }

  return filtered;
}

export async function getContract(id: number) {
  return db
    .select({
      contract: contracts,
      tenant: tenants,
      property: properties,
      landlord: landlords,
    })
    .from(contracts)
    .innerJoin(tenants, eq(contracts.tenantId, tenants.id))
    .innerJoin(properties, eq(contracts.propertyId, properties.id))
    .innerJoin(landlords, eq(properties.landlordId, landlords.id))
    .where(eq(contracts.id, id))
    .get();
}

export async function getLandlords() {
  return db.select().from(landlords).all();
}

export async function getPropertiesByLandlord(landlordId: number) {
  return db
    .select()
    .from(properties)
    .where(eq(properties.landlordId, landlordId))
    .orderBy(properties.address)
    .all();
}

export async function getAllTenants() {
  return db.select().from(tenants).orderBy(tenants.name).all();
}

function boolToInt(val: boolean | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  return val ? 1 : 0;
}

export async function createContract(data: ContractInput) {
  const now = new Date().toISOString();
  const result = db
    .insert(contracts)
    .values({
      propertyId: data.propertyId,
      tenantId: data.tenantId,
      contractType: data.contractType || "indefinite",
      startDate: data.startDate,
      endDate: data.endDate || null,
      firstCancelDate: data.firstCancelDate || null,
      contractDate: data.contractDate || null,
      signedDate: data.signedDate || null,
      rentEur: data.rentEur,
      waterFeeEur: data.waterFeeEur ?? null,
      totalRentEur: data.totalRentEur ?? null,
      firstMonthRent: data.firstMonthRent ?? null,
      firstMonthNote: data.firstMonthNote || null,
      depositEur: data.depositEur ?? null,
      depositType: data.depositType || "cash",
      depositNote: data.depositNote || null,
      paymentDueDay: data.paymentDueDay ?? 2,
      waterColdM3Price: data.waterColdM3Price ?? 6.0,
      waterHotM3Price: data.waterHotM3Price ?? 12.0,
      waterIncluded: boolToInt(data.waterIncluded),
      baseIndex: data.baseIndex ?? null,
      rentIncreaseType: data.rentIncreaseType || "index",
      rentIncreaseMinPercent: data.rentIncreaseMinPercent ?? 3.0,
      rentIncreaseMonth: data.rentIncreaseMonth ?? null,
      noticePeriodMonths: data.noticePeriodMonths ?? 1,
      breachPenaltyMonths: data.breachPenaltyMonths ?? 2,
      paymentReminderFee: data.paymentReminderFee ?? 5.0,
      keyLossPenalty: data.keyLossPenalty ?? 800.0,
      petsAllowed: boolToInt(data.petsAllowed),
      smokingAllowed: boolToInt(data.smokingAllowed),
      sublettingAllowed: boolToInt(data.sublettingAllowed),
      sublettingNote: data.sublettingNote || null,
      insuranceRequired: boolToInt(data.insuranceRequired ?? true),
      wallMountingAllowed: boolToInt(data.wallMountingAllowed),
      maxOccupants: data.maxOccupants ?? null,
      status: data.status || "active",
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  revalidatePath("/admin/contracts");
  return result;
}

export async function updateContract(id: number, data: Partial<ContractInput>) {
  const now = new Date().toISOString();
  const updateData: Record<string, unknown> = { updatedAt: now };

  if (data.propertyId !== undefined) updateData.propertyId = data.propertyId;
  if (data.tenantId !== undefined) updateData.tenantId = data.tenantId;
  if (data.contractType !== undefined) updateData.contractType = data.contractType;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.endDate !== undefined) updateData.endDate = data.endDate || null;
  if (data.firstCancelDate !== undefined) updateData.firstCancelDate = data.firstCancelDate || null;
  if (data.contractDate !== undefined) updateData.contractDate = data.contractDate || null;
  if (data.signedDate !== undefined) updateData.signedDate = data.signedDate || null;
  if (data.rentEur !== undefined) updateData.rentEur = data.rentEur;
  if (data.waterFeeEur !== undefined) updateData.waterFeeEur = data.waterFeeEur;
  if (data.totalRentEur !== undefined) updateData.totalRentEur = data.totalRentEur;
  if (data.firstMonthRent !== undefined) updateData.firstMonthRent = data.firstMonthRent;
  if (data.firstMonthNote !== undefined) updateData.firstMonthNote = data.firstMonthNote || null;
  if (data.depositEur !== undefined) updateData.depositEur = data.depositEur;
  if (data.depositType !== undefined) updateData.depositType = data.depositType;
  if (data.depositNote !== undefined) updateData.depositNote = data.depositNote || null;
  if (data.paymentDueDay !== undefined) updateData.paymentDueDay = data.paymentDueDay;
  if (data.waterColdM3Price !== undefined) updateData.waterColdM3Price = data.waterColdM3Price;
  if (data.waterHotM3Price !== undefined) updateData.waterHotM3Price = data.waterHotM3Price;
  if (data.waterIncluded !== undefined) updateData.waterIncluded = boolToInt(data.waterIncluded);
  if (data.baseIndex !== undefined) updateData.baseIndex = data.baseIndex;
  if (data.rentIncreaseType !== undefined) updateData.rentIncreaseType = data.rentIncreaseType;
  if (data.rentIncreaseMinPercent !== undefined) updateData.rentIncreaseMinPercent = data.rentIncreaseMinPercent;
  if (data.rentIncreaseMonth !== undefined) updateData.rentIncreaseMonth = data.rentIncreaseMonth;
  if (data.noticePeriodMonths !== undefined) updateData.noticePeriodMonths = data.noticePeriodMonths;
  if (data.breachPenaltyMonths !== undefined) updateData.breachPenaltyMonths = data.breachPenaltyMonths;
  if (data.paymentReminderFee !== undefined) updateData.paymentReminderFee = data.paymentReminderFee;
  if (data.keyLossPenalty !== undefined) updateData.keyLossPenalty = data.keyLossPenalty;
  if (data.petsAllowed !== undefined) updateData.petsAllowed = boolToInt(data.petsAllowed);
  if (data.smokingAllowed !== undefined) updateData.smokingAllowed = boolToInt(data.smokingAllowed);
  if (data.sublettingAllowed !== undefined) updateData.sublettingAllowed = boolToInt(data.sublettingAllowed);
  if (data.sublettingNote !== undefined) updateData.sublettingNote = data.sublettingNote || null;
  if (data.insuranceRequired !== undefined) updateData.insuranceRequired = boolToInt(data.insuranceRequired);
  if (data.wallMountingAllowed !== undefined) updateData.wallMountingAllowed = boolToInt(data.wallMountingAllowed);
  if (data.maxOccupants !== undefined) updateData.maxOccupants = data.maxOccupants;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  const result = db
    .update(contracts)
    .set(updateData)
    .where(eq(contracts.id, id))
    .returning()
    .get();

  revalidatePath("/admin/contracts");
  revalidatePath(`/admin/contracts/${id}`);
  return result;
}

export async function deleteContract(id: number) {
  db.delete(contracts).where(eq(contracts.id, id)).run();
  revalidatePath("/admin/contracts");
}

export async function updateContractDocPaths(
  id: number,
  docxPath: string | null,
  pdfPath: string | null
) {
  db.update(contracts)
    .set({
      docxPath,
      pdfPath,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(contracts.id, id))
    .run();

  revalidatePath(`/admin/contracts/${id}`);
}
