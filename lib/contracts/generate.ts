import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { execSync } from "child_process";
import { db, contracts, tenants, properties, landlords } from "@/lib/db";
import { eq } from "drizzle-orm";

const TEMPLATE_PATH = "/opt/vuokra-platform/templates/sopimuspohja_template.docx";
const ARCHIVE_BASE = "/opt/vuokra-platform/archive";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

function formatMoney(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "";
  if (amount === Math.floor(amount)) return String(Math.floor(amount));
  return amount.toFixed(2).replace(".", ",");
}

function getPropertyFolder(
  propertyAddress: string,
  landlordName: string,
  buildingName: string | null,
  reference: string | null,
  kp: number | null
): string {
  // Extract address without city/postal code
  let address = propertyAddress.split(",")[0].trim();
  address = address.replace(/\s+\d{5}\s+\w+$/, "").trim();
  const building = buildingName || "";

  let folderName: string;
  if (landlordName === "Fiquan Holding Oy") {
    if (reference && kp) {
      folderName = `Fiquan ${address} ${building} viite ${reference} kp ${kp}`.trim();
    } else {
      folderName = `Fiquan ${address} ${building}`.trim();
    }
  } else {
    const owner = landlordName.split(" ")[0];
    folderName = `${owner} ${address} ${building}`.trim();
  }

  // Clean for filesystem
  const safeName = folderName.replace(/[<>:"/\\|?*]/g, "");
  const folder = join(ARCHIVE_BASE, safeName);

  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
  }

  return folder;
}

function getFirstMonthText(
  startDate: string,
  firstMonthRent: number | null
): string {
  if (!firstMonthRent) return "";

  const monthsFi = [
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
  ];

  const d = new Date(startDate);
  const monthName = monthsFi[d.getMonth()];
  return `${monthName} ${d.getFullYear()} ${formatMoney(firstMonthRent)} €`;
}

export async function generateContract(contractId: number): Promise<{
  success: boolean;
  docxPath?: string;
  pdfPath?: string;
  error?: string;
}> {
  try {
    // Fetch contract with relations
    const result = db
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
      .where(eq(contracts.id, contractId))
      .get();

    if (!result) {
      return { success: false, error: "Sopimusta ei löytynyt" };
    }

    const { contract, tenant, property, landlord } = result;

    // Load template
    const content = readFileSync(TEMPLATE_PATH, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Calculate total rent
    const totalRent = contract.rentEur + (contract.waterFeeEur || 0);
    const contractDate = contract.contractDate || new Date().toISOString().split("T")[0];

    // Fill placeholders
    doc.render({
      property_address: property.address,
      property_area: property.areaM2 ? String(Math.floor(property.areaM2)) : "",
      property_condition: property.condition || "Hyvä",
      landlord_name: landlord.name,
      landlord_address: landlord.address || "",
      landlord_phone: landlord.phone || "",
      landlord_email: landlord.email || "",
      landlord_iban: landlord.iban || "",
      tenant_name: tenant.name,
      tenant_ssn: tenant.ssn || "",
      tenant_address: tenant.address || "",
      tenant_phone: tenant.phone || "",
      tenant_email: tenant.email || "",
      start_date: formatDate(contract.startDate),
      first_cancel_date: formatDate(contract.firstCancelDate) || formatDate(contract.startDate),
      rent_eur: formatMoney(contract.rentEur),
      water_fee_eur: formatMoney(contract.waterFeeEur),
      total_rent_eur: formatMoney(totalRent),
      first_month_rent: formatMoney(contract.firstMonthRent),
      first_month_text: getFirstMonthText(contract.startDate, contract.firstMonthRent),
      deposit_eur: formatMoney(contract.depositEur),
      contract_date: formatDate(contractDate),
      signature_place_date: `Oulussa ${formatDate(contractDate)}`,
    });

    // Get archive folder
    const archiveDir = getPropertyFolder(
      property.address,
      landlord.name,
      property.buildingName,
      property.reference,
      property.kp
    );

    // Generate filename
    const year = new Date(contract.startDate).getFullYear();
    const safeTenant = tenant.name.replace(/[^\w\-äöåÄÖÅ]/g, "_");
    const filename = `${year}_Vuokrasopimus_${safeTenant}`;

    // Save DOCX
    const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });
    const docxPath = join(archiveDir, `${filename}.docx`);
    writeFileSync(docxPath, docxBuffer);

    // Convert to PDF using LibreOffice
    let pdfPath: string | undefined;
    try {
      execSync(
        `soffice --headless --convert-to pdf --outdir "${archiveDir}" "${docxPath}"`,
        { timeout: 60000 }
      );
      pdfPath = docxPath.replace(".docx", ".pdf");
      if (!existsSync(pdfPath)) {
        pdfPath = undefined;
      }
    } catch (e) {
      console.error("PDF conversion failed:", e);
    }

    // Update database
    db.update(contracts)
      .set({
        docxPath,
        pdfPath: pdfPath || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(contracts.id, contractId))
      .run();

    return { success: true, docxPath, pdfPath };
  } catch (error) {
    console.error("Contract generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Tuntematon virhe",
    };
  }
}
