"use server";

import { db, tenants } from "@/lib/db";
import { eq, like, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type TenantInput = {
  name: string;
  ssn?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
};

export async function getTenants(search?: string) {
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    return db
      .select()
      .from(tenants)
      .where(
        or(
          like(tenants.name, term),
          like(tenants.phone, term),
          like(tenants.email, term),
          like(tenants.address, term)
        )
      )
      .orderBy(desc(tenants.id))
      .all();
  }
  return db.select().from(tenants).orderBy(desc(tenants.id)).all();
}

export async function getTenant(id: number) {
  return db.select().from(tenants).where(eq(tenants.id, id)).get();
}

export async function createTenant(data: TenantInput) {
  const result = db
    .insert(tenants)
    .values({
      name: data.name,
      ssn: data.ssn || null,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
    })
    .returning()
    .get();

  revalidatePath("/admin/tenants");
  return result;
}

export async function updateTenant(id: number, data: Partial<TenantInput>) {
  const result = db
    .update(tenants)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.ssn !== undefined && { ssn: data.ssn || null }),
      ...(data.address !== undefined && { address: data.address || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    })
    .where(eq(tenants.id, id))
    .returning()
    .get();

  revalidatePath("/admin/tenants");
  revalidatePath(`/admin/tenants/${id}`);
  return result;
}

export async function deleteTenant(id: number) {
  db.delete(tenants).where(eq(tenants.id, id)).run();
  revalidatePath("/admin/tenants");
}
