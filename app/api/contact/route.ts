import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface ContactSubmission {
  id: string
  timestamp: string
  propertyId: string
  propertyDbId: number
  propertyName: string
  propertyAddress: string
  propertyPrice: number
  propertySize: number
  name: string
  email: string
  phone: string
  moveTimeline: string
  occupants: string
  message: string
  gdprConsent: boolean
  status: "new" | "contacted" | "archived"
}

const CONTACTS_PATH = path.join(process.cwd(), "..", "..", "data", "contacts.json")

function getContacts(): ContactSubmission[] {
  try {
    if (fs.existsSync(CONTACTS_PATH)) {
      const data = fs.readFileSync(CONTACTS_PATH, "utf-8")
      return JSON.parse(data)
    }
    return []
  } catch {
    return []
  }
}

function saveContacts(contacts: ContactSubmission[]): boolean {
  try {
    fs.writeFileSync(CONTACTS_PATH, JSON.stringify(contacts, null, 2), "utf-8")
    return true
  } catch (error) {
    console.error("Error saving contacts:", error)
    return false
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const required = ["propertyId", "name", "email", "phone", "moveTimeline", "gdprConsent"]
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate GDPR consent
    if (body.gdprConsent !== true) {
      return NextResponse.json(
        { error: "GDPR consent is required" },
        { status: 400 }
      )
    }

    // Create contact submission
    const submission: ContactSubmission = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      propertyId: body.propertyId,
      propertyDbId: body.propertyDbId || 0,
      propertyName: body.propertyName || "",
      propertyAddress: body.propertyAddress || "",
      propertyPrice: body.propertyPrice || 0,
      propertySize: body.propertySize || 0,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      moveTimeline: body.moveTimeline,
      occupants: body.occupants || "",
      message: body.message?.trim() || "",
      gdprConsent: true,
      status: "new",
    }

    // Save to JSON file
    const contacts = getContacts()
    contacts.unshift(submission) // Add to beginning (newest first)

    if (!saveContacts(contacts)) {
      return NextResponse.json(
        { error: "Failed to save contact" },
        { status: 500 }
      )
    }

    // Log for now (email integration can be added later)
    console.log("=".repeat(60))
    console.log("NEW CONTACT SUBMISSION")
    console.log("=".repeat(60))
    console.log(`Property: ${submission.propertyName}`)
    console.log(`Name: ${submission.name}`)
    console.log(`Email: ${submission.email}`)
    console.log(`Phone: ${submission.phone}`)
    console.log(`Move timeline: ${submission.moveTimeline}`)
    console.log(`Occupants: ${submission.occupants}`)
    console.log(`Message: ${submission.message}`)
    console.log("=".repeat(60))

    // TODO: Send email notification
    // await sendEmail({
    //   to: "asunnot@elea.fi",
    //   subject: `🏠 Yhteydenotto: ${submission.propertyName}`,
    //   body: formatEmailBody(submission),
    // })

    // TODO: Send auto-reply to submitter
    // await sendEmail({
    //   to: submission.email,
    //   subject: "Kiitos yhteydenotostasi — ELEA asunnot",
    //   body: formatAutoReply(submission),
    // })

    return NextResponse.json({
      success: true,
      id: submission.id,
    })

  } catch (error) {
    console.error("Contact API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to list contacts (for admin)
export async function GET(request: NextRequest) {
  // Check if request is from admin (simple check, can be improved)
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const contacts = getContacts()

  if (status) {
    return NextResponse.json(contacts.filter(c => c.status === status))
  }

  return NextResponse.json(contacts)
}
