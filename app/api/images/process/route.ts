import { NextResponse } from "next/server"
import { readFile, mkdir, unlink, copyFile, readdir, rmdir } from "fs/promises"
import { join } from "path"
import { existsSync, readdirSync } from "fs"
import sharp from "sharp"

const RAW_IMAGES_DIR = "/srv/shared/DROPZONE/vuokra-images-raw"
const OUTPUT_DIR = "/opt/vuokra-platform/apps/esittely/public/images"

// Etsi kansio joka alkaa db_id:llä
function findFolderForId(id: string): string | null {
  if (!existsSync(RAW_IMAGES_DIR)) return null
  const folders = readdirSync(RAW_IMAGES_DIR)
  if (folders.includes(id)) return join(RAW_IMAGES_DIR, id)
  const match = folders.find(f => f.startsWith(`${id} - `) || f.startsWith(`${id} -`))
  if (match) return join(RAW_IMAGES_DIR, match)
  return null
}

interface ProcessRequest {
  propertyId: string
  images: string[]
  copyToProperties?: string[]
}

// Image sizes for responsive delivery (4:3 aspect ratio)
// ChatGPT recommended optimal sizes for retina + performance
const SIZES = {
  thumb: { width: 800, height: 600, quality: 75 },   // Mobile
  card: { width: 1200, height: 900, quality: 78 },   // Tablet
  large: { width: 1600, height: 1200, quality: 80 }, // Desktop retina
  hero: { width: 2400, height: 1800, quality: 82 }   // Property page hero
} as const

type SizeName = keyof typeof SIZES

async function processImage(
  inputPath: string,
  outputDir: string,
  index: number
): Promise<string[]> {
  const inputBuffer = await readFile(inputPath)
  const baseName = String(index).padStart(2, '0')
  const generatedFiles: string[] = []

  // Ei muokata kuvia - vain resize ja WebP-muunnos
  const baseImage = sharp(inputBuffer)

  // Generate all size variants as WebP
  for (const [sizeName, config] of Object.entries(SIZES)) {
    const outputName = `${baseName}-${sizeName}.webp`
    const outputPath = join(outputDir, outputName)

    await baseImage
      .clone()
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: 90,  // Korkea laatu
        effort: 4
      })
      .toFile(outputPath)

    generatedFiles.push(outputName)
  }

  return generatedFiles
}

export async function POST(request: Request) {
  try {
    const body: ProcessRequest = await request.json()
    const { propertyId, images, copyToProperties = [] } = body

    if (!propertyId || !images || images.length === 0) {
      return NextResponse.json(
        { error: "Missing propertyId or images" },
        { status: 400 }
      )
    }

    const rawDir = findFolderForId(propertyId)
    const outputDir = join(OUTPUT_DIR, propertyId)

    if (!rawDir) {
      return NextResponse.json(
        { error: "Raw images directory not found" },
        { status: 404 }
      )
    }

    // Create output directories
    const allOutputDirs = [outputDir, ...copyToProperties.map(id => join(OUTPUT_DIR, id))]
    for (const dir of allOutputDirs) {
      await mkdir(dir, { recursive: true })
    }

    // Process each selected image
    let processed = 0
    const allGeneratedFiles: string[] = []

    for (let i = 0; i < images.length; i++) {
      const imageName = images[i]
      const inputPath = join(rawDir, imageName)

      if (existsSync(inputPath)) {
        try {
          const files = await processImage(inputPath, outputDir, i + 1)
          allGeneratedFiles.push(...files)
          processed++
          // Raakakuvia EI poisteta - säilytetään varmuuskopiona
        } catch (err) {
          console.error(`Error processing ${imageName}:`, err)
        }
      }
    }

    // Copy processed images to related properties
    let copiedTo = 0
    for (const targetId of copyToProperties) {
      const targetDir = join(OUTPUT_DIR, targetId)
      try {
        for (const filename of allGeneratedFiles) {
          const srcPath = join(outputDir, filename)
          const destPath = join(targetDir, filename)
          if (existsSync(srcPath)) {
            await copyFile(srcPath, destPath)
          }
        }
        copiedTo++
      } catch (err) {
        console.error(`Error copying to ${targetId}:`, err)
      }
    }

    // Raakakansio säilytetään

    // Count generated files
    const sizesGenerated = Object.keys(SIZES).length
    const totalFiles = processed * sizesGenerated

    return NextResponse.json({
      success: true,
      processed,
      copiedTo,
      totalFiles,
      sizes: Object.keys(SIZES),
      outputDir: `/images/${propertyId}`
    })
  } catch (error) {
    console.error("Error processing images:", error)
    return NextResponse.json(
      { error: "Failed to process images" },
      { status: 500 }
    )
  }
}
