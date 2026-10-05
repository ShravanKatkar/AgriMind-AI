export type PasswordStrength = "weak" | "fair" | "good" | "strong"

export interface PasswordStrengthResult {
  score: number
  label: PasswordStrength
  color: string
  suggestions: string[]
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0
  const suggestions: string[] = []

  if (password.length >= 8) score += 1
  else suggestions.push("Use at least 8 characters")

  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  else suggestions.push("Add lowercase letters")
  if (/[A-Z]/.test(password)) score += 1
  else suggestions.push("Add uppercase letters")
  if (/[0-9]/.test(password)) score += 1
  else suggestions.push("Add numbers")
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else suggestions.push("Add special characters")

  if (score <= 2) {
    return { score: 25, label: "weak", color: "bg-destructive", suggestions }
  }
  if (score <= 4) {
    return { score: 50, label: "fair", color: "bg-accent", suggestions }
  }
  if (score <= 5) {
    return { score: 75, label: "good", color: "bg-chart-3", suggestions }
  }
  return { score: 100, label: "strong", color: "bg-primary", suggestions: [] }
}
