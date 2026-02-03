import { NextRequest } from "next/server";
import { readFileSync, existsSync } from "fs";
import { db, contracts } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contractId = Number(id);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "pdf";

  if (!contractId || isNaN(contractId)) {
    return new Response("Virheellinen ID", { status: 400 });
  }

  const contract = db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .get();

  if (!contract) {
    return new Response("Sopimusta ei löytynyt", { status: 404 });
  }

  const filePath = type === "docx" ? contract.docxPath : contract.pdfPath;

  if (!filePath || !existsSync(filePath)) {
    return new Response("Tiedostoa ei löytynyt", { status: 404 });
  }

  const fileBuffer = readFileSync(filePath);
  const filename = filePath.split("/").pop() || `sopimus.${type}`;

  const contentType =
    type === "docx"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "application/pdf";

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
