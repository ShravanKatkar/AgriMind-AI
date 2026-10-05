"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useTypingPlaceholder } from "@/hooks/use-typing-placeholder"
import { cn } from "@/lib/utils"

const SEARCH_PHRASES = [
  "Search crops, diseases, guides...",
  "Find rice leaf disease help...",
  "Search tomato pest treatments...",
  "Look up coconut farming tips...",
  "Search market prices...",
  "Find weather for your district...",
]

type AnimatedSearchInputProps = {
  className?: string
  inputClassName?: string
}

export function AnimatedSearchInput({
  className,
  inputClassName,
}: AnimatedSearchInputProps) {
  const animatedPlaceholder = useTypingPlaceholder(SEARCH_PHRASES)

  return (
    <div className={cn("relative", className)} data-no-translate>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={animatedPlaceholder}
        className={cn(
          "h-10 border-0 bg-muted/60 pl-9 transition-colors focus-visible:bg-background focus-visible:ring-primary/30",
          inputClassName
        )}
      />
    </div>
  )
}
