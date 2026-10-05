export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

/** Use firebaseConfig fields — dynamic process.env[key] is not inlined on the client */
export function validateFirebaseClientConfig() {
  const checks: { key: string; value: string | undefined }[] = [
    { key: "NEXT_PUBLIC_FIREBASE_API_KEY", value: firebaseConfig.apiKey },
    { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", value: firebaseConfig.authDomain },
    { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", value: firebaseConfig.projectId },
    { key: "NEXT_PUBLIC_FIREBASE_APP_ID", value: firebaseConfig.appId },
  ]

  const missing = checks
    .filter(({ value }) => !value || value.includes("your-project"))
    .map(({ key }) => key)

  return { valid: missing.length === 0, missing }
}
