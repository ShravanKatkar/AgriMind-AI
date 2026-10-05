import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const LOGO_SRC = "/agrimind-logo.png"

const sizeMap = {
  xs: { px: 36, text: "text-sm" },
  sm: { px: 44, text: "text-base" },
  md: { px: 52, text: "text-lg" },
  lg: { px: 60, text: "text-xl" },
  xl: { px: 72, text: "text-2xl" },
} as const

export type AgriMindLogoSize = keyof typeof sizeMap

type AgriMindLogoProps = {
  size?: AgriMindLogoSize
  showText?: boolean
  /** Icon only — no “AgriMind AI” wordmark */
  iconOnly?: boolean
  className?: string
  imageClassName?: string
  href?: string | null
  priority?: boolean
}

export function AgriMindLogo({
  size = "md",
  showText = true,
  iconOnly = false,
  className,
  imageClassName,
  href = "/",
  priority = false,
}: AgriMindLogoProps) {
  const { px, text } = sizeMap[size]
  const displayText = showText && !iconOnly

  const inner = (
    <>
      <Image
        src={LOGO_SRC}
        alt="AgriMind"
        width={px}
        height={px}
        priority={priority}
        className={cn("shrink-0 object-contain", imageClassName)}
        style={{ width: px, height: px }}
      />
      {displayText && (
        <span className={cn("font-bold tracking-tight text-foreground", text)}>
          Agri<span className="text-primary">Mind</span>
          <span className="font-semibold text-muted-foreground"> AI</span>
        </span>
      )}
    </>
  )

  const wrapClass = cn(
    "inline-flex items-center gap-2.5",
    displayText && "gap-3",
    className
  )

  if (href) {
    return (
      <Link href={href} className={wrapClass} aria-label="AgriMind AI home">
        {inner}
      </Link>
    )
  }

  return <div className={wrapClass}>{inner}</div>
}
