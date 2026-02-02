"use client"

interface FormattedDescriptionProps {
  text: string
}

export function FormattedDescription({ text }: FormattedDescriptionProps) {
  // Split into paragraphs by double newlines
  const paragraphs = text.split(/\n\n+/)

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, pIndex) => {
        const lines = paragraph.split('\n').filter(line => line.trim())

        // Check if this paragraph is a list (lines starting with * or -)
        const isList = lines.every(line => /^[\*\-]\s/.test(line.trim()))

        if (isList) {
          return (
            <ul key={pIndex} className="space-y-2 ml-4">
              {lines.map((line, lIndex) => (
                <li key={lIndex} className="flex gap-2 text-muted-foreground">
                  <span className="text-primary mt-1.5 flex-shrink-0">
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                      <circle cx="3" cy="3" r="3" />
                    </svg>
                  </span>
                  <span>{line.replace(/^[\*\-]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          )
        }

        // Check if first line is a header (ends with : or is ALL CAPS)
        const firstLine = lines[0]?.trim() || ''
        const isHeader = /^[A-ZÄÖÅ\s]+:?$/.test(firstLine) ||
                         (firstLine.endsWith(':') && firstLine.length < 50)

        if (isHeader && lines.length > 1) {
          return (
            <div key={pIndex} className="space-y-2">
              <h3 className="font-semibold text-foreground">{firstLine}</h3>
              {lines.slice(1).map((line, lIndex) => {
                // Check if remaining lines are list items
                if (/^[\*\-]\s/.test(line.trim())) {
                  return (
                    <div key={lIndex} className="flex gap-2 text-muted-foreground ml-4">
                      <span className="text-primary mt-1.5 flex-shrink-0">
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                          <circle cx="3" cy="3" r="3" />
                        </svg>
                      </span>
                      <span>{line.replace(/^[\*\-]\s*/, '')}</span>
                    </div>
                  )
                }
                return (
                  <p key={lIndex} className="text-muted-foreground">{line}</p>
                )
              })}
            </div>
          )
        }

        // Regular paragraph - preserve line breaks
        return (
          <div key={pIndex} className="space-y-1">
            {lines.map((line, lIndex) => {
              // Check if line is a sub-header (ends with :)
              if (line.trim().endsWith(':') && line.length < 50) {
                return (
                  <h3 key={lIndex} className="font-semibold text-foreground mt-4 first:mt-0">
                    {line}
                  </h3>
                )
              }
              // Check if line is a list item
              if (/^[\*\-]\s/.test(line.trim())) {
                return (
                  <div key={lIndex} className="flex gap-2 text-muted-foreground ml-4">
                    <span className="text-primary mt-1.5 flex-shrink-0">
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                        <circle cx="3" cy="3" r="3" />
                      </svg>
                    </span>
                    <span>{line.replace(/^[\*\-]\s*/, '')}</span>
                  </div>
                )
              }
              // Regular line
              return (
                <p key={lIndex} className="text-muted-foreground">{line}</p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
