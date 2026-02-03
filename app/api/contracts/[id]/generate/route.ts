import { NextRequest } from "next/server";
import { generateContract } from "@/lib/contracts/generate";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contractId = Number(id);

  if (!contractId || isNaN(contractId)) {
    return Response.json({ success: false, error: "Virheellinen ID" }, { status: 400 });
  }

  const result = await generateContract(contractId);

  if (!result.success) {
    return Response.json(result, { status: 500 });
  }

  return Response.json(result);
}
