import { NextResponse } from "next/server"
import { readFile, writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import sharp from "sharp"

const RAW_IMAGES_DIR = "/srv/shared/DROPZONE/vuokra-images-raw"
const OUTPUT_DIR = "/opt/vuokra-platform/apps/esittely/public/images"

interface ProcessRequest {
  propertyId: string
  images: string[]
  copyToProperties?: string[] // Additional property IDs to copy processed images to
}

// Image sizes for different uses
const SIZES = {
  thumbnail: { width: 400, height: 300 },
  gallery: { width: 1200, height: 900 },
  full: { width: 1920, height: 1440 }
}

async function processImage(
  inputPath: string,
  outputDir: string,
  index: number
): Promise<void> {
  const inputBuffer = await readFile(inputPath)

  // Process with Sharp: normalize (auto-level), resize, compress
  const image = sharp(inputBuffer)

  // Get metadata
  const metadata = await image.metadata()

  // Process full-size image with auto-enhancement
  const processed = image
    .normalize() // Auto-level: stretches histogram to full range
    .modulate({
      brightness: 1.02, // Slight brightness boost
      saturation: 1.05  // Slight saturation boost
    })
    .sharpen({ sigma: 0.5 }) // Light sharpening

  // Determine output format (keep original or convert to JPEG)
  const isTransparent = metadata.format === 'png' && metadata.channels === 4
  const outputExt = isTransparent ? 'png' : 'jpg'
  const outputName = `${String(index).padStart(2, '0')}.${outputExt}`
  const outputPath = join(outputDir, outputName)

  if (isTransparent) {
    // Keep PNG for transparent images
    await processed
      .resize(SIZES.full.width, SIZES.full.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality: 85 })
      .toFile(outputPath)
  } else {
    // Convert to optimized JPEG
    await processed
      .resize(SIZES.full.width, SIZES.full.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 82,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputPath)
  }
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

    const rawDir = join(RAW_IMAGES_DIR, propertyId)
    const outputDir = join(OUTPUT_DIR, propertyId)

    if (!existsSync(rawDir)) {
      return NextResponse.json(
        { error: "Raw images directory not found" },
        { status: 404 }
      )
    }

    // Create output directories (main + copies)
    const allOutputDirs = [outputDir, ...copyToProperties.map(id => join(OUTPUT_DIR, id))]
    for (const dir of allOutputDirs) {
      await mkdir(dir, { recursive: true })
    }

    // Process each selected image
    let processed = 0
    const processedFiles: string[] = []

    for (let i = 0; i < images.length; i++) {
      const imageName = images[i]
      const inputPath = join(rawDir, imageName)

      if (existsSync(inputPath)) {
        try {
          await processImage(inputPath, outputDir, i + 1)
          processed++

          // Track processed filename for copying
          const ext = imageName.toLowerCase().endsWith('.png') ? 'png' : 'jpg'
          processedFiles.push(`${String(i + 1).padStart(2, '0')}.${ext}`)

          // Remove from raw folder after processing
          await unlink(inputPath)
        } catch (err) {
          console.error(`Error processing ${imageName}:`, err)
        }
      }
    }

    // Copy processed images to related properties
    const { copyFile } = await import("fs/promises")
    let copiedTo = 0
    for (const targetId of copyToProperties) {
      const targetDir = join(OUTPUT_DIR, targetId)
      try {
        for (const filename of processedFiles) {
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

    // Check if raw folder is empty and remove it
    const { readdir } = await import("fs/promises")
    const remaining = await readdir(rawDir)
    if (remaining.length === 0) {
      const { rmdir } = await import("fs/promises")
      await rmdir(rawDir)
    }

    return NextResponse.json({
      success: true,
      processed,
      copiedTo,
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
