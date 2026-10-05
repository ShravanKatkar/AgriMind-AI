export type AuthMode = "login" | "signup"

/** 1 = toward signup, -1 = toward login */
export type AuthDirection = 1 | -1

export const authSpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 34,
}

export const authPanelSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 30,
  mass: 0.85,
}

export const authEase = [0.22, 1, 0.36, 1] as const

export const authSlideTransition = {
  duration: 0.45,
  ease: authEase,
} as const
