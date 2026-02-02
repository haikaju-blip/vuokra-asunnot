"use client"

interface HighlightsPillsProps {
  highlights?: string[]
}

export function HighlightsPills({ highlights }: HighlightsPillsProps) {
  // Piilota jos ei ole highlighteja
  if (!highlights || highlights.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {highlights.map((highlight, index) => (
        <span
          key={index}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground border border-border/50"
        >
          {highlight}
        </span>
      ))}
    </div>
  )
}
