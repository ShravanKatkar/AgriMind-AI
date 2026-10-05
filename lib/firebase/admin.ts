import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"

let adminApp: App
let adminAuth: Auth

function getPrivateKey(): string {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  if (!key) {
    throw new Error("FIREBASE_ADMIN_PRIVATE_KEY is not set")
  }
  return key.replace(/\\n/g, "\n")
}

export function getAdminApp(): App {
  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
    })
  } else {
    adminApp = getApps()[0]!
  }
  return adminApp
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp())
  }
  return adminAuth
}
