import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const landlords = sqliteTable("landlords", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  landlordType: text("landlord_type"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  iban: text("iban"),
  referencePrefix: text("reference_prefix"),
});

export const tenants = sqliteTable("tenants", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  ssn: text("ssn"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  createdAt: text("created_at"),
});

export const properties = sqliteTable("properties", {
  id: integer("id").primaryKey(),
  landlordId: integer("landlord_id").notNull(),
  address: text("address").notNull(),
  areaM2: real("area_m2"),
  buildingName: text("building_name"),
  floor: integer("floor"),
  rooms: text("rooms"),
  condition: text("condition"),
  balcony: text("balcony"),
  parkingIncluded: integer("parking_included"),
  parkingSpot: text("parking_spot"),
  parkingFeeEur: real("parking_fee_eur"),
  kp: integer("kp"),
  reference: text("reference"),
  notes: text("notes"),
  active: integer("active"),
});

export const contracts = sqliteTable("contracts", {
  id: integer("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  contractType: text("contract_type"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  firstCancelDate: text("first_cancel_date"),
  contractDate: text("contract_date"),
  signedDate: text("signed_date"),
  endedDate: text("ended_date"),
  endReason: text("end_reason"),
  rentEur: real("rent_eur").notNull(),
  waterFeeEur: real("water_fee_eur"),
  totalRentEur: real("total_rent_eur"),
  firstMonthRent: real("first_month_rent"),
  firstMonthNote: text("first_month_note"),
  depositEur: real("deposit_eur"),
  depositType: text("deposit_type"),
  depositNote: text("deposit_note"),
  paymentDueDay: integer("payment_due_day"),
  waterColdM3Price: real("water_cold_m3_price"),
  waterHotM3Price: real("water_hot_m3_price"),
  waterIncluded: integer("water_included"),
  baseIndex: real("base_index"),
  rentIncreaseType: text("rent_increase_type"),
  rentIncreaseMinPercent: real("rent_increase_min_percent"),
  rentIncreaseMonth: integer("rent_increase_month"),
  noticePeriodMonths: integer("notice_period_months"),
  breachPenaltyMonths: integer("breach_penalty_months"),
  paymentReminderFee: real("payment_reminder_fee"),
  keyLossPenalty: real("key_loss_penalty"),
  petsAllowed: integer("pets_allowed"),
  smokingAllowed: integer("smoking_allowed"),
  sublettingAllowed: integer("subletting_allowed"),
  sublettingNote: text("subletting_note"),
  insuranceRequired: integer("insurance_required"),
  wallMountingAllowed: integer("wall_mounting_allowed"),
  maxOccupants: integer("max_occupants"),
  reference: text("reference"),
  status: text("status"),
  docxPath: text("docx_path"),
  pdfPath: text("pdf_path"),
  pdfHash: text("pdf_hash"),
  notes: text("notes"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Type exports
export type Landlord = typeof landlords.$inferSelect;
export type NewLandlord = typeof landlords.$inferInsert;

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
