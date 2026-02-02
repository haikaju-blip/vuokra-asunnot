import { NextResponse } from "next/server"
import { readFile, writeFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const DONE_FILE = "/opt/vuokra-platform/data/images-done.json"

async function getDoneList(): Promise<string[]> {
  try {
    if (existsSync(DONE_FILE)) {
      const data = await readFile(DONE_FILE, "utf-8")
      return JSON.parse(data)
    }
  } catch {}
  return []
}

async function saveDoneList(list: string[]): Promise<void> {
  await writeFile(DONE_FILE, JSON.stringify(list, null, 2))
}

// GET - list all done properties
export async function GET() {
  const done = await getDoneList()
  return NextResponse.json({ done })
}

// POST - mark property as done
export async function POST(request: Request) {
  try {
    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 })
    }

    const done = await getDoneList()
    if (!done.includes(propertyId)) {
      done.push(propertyId)
      await saveDoneList(done)
    }

    return NextResponse.json({ success: true, done })
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark as done" }, { status: 500 })
  }
}

// DELETE - unmark property as done
export async function DELETE(request: Request) {
  try {
    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 })
    }

    let done = await getDoneList()
    done = done.filter(id => id !== propertyId)
    await saveDoneList(done)

    return NextResponse.json({ success: true, done })
  } catch (error) {
    return NextResponse.json({ error: "Failed to unmark" }, { status: 500 })
  }
}
