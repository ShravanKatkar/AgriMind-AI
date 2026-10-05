"use client"

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  type Auth,
} from "firebase/auth"
import { firebaseConfig, validateFirebaseClientConfig } from "./config"

let app: FirebaseApp
let auth: Auth

function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    const { valid, missing } = validateFirebaseClientConfig()
    if (!valid) {
      throw new Error(
        `Firebase client config is incomplete. Missing or invalid: ${missing.join(", ")}. Check .env.local and restart the dev server (npm run dev).`
      )
    }
    app = initializeApp(firebaseConfig)
  } else {
    app = getApp()
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
    auth.languageCode = "en"
  }
  return auth
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export const facebookProvider = new FacebookAuthProvider()
