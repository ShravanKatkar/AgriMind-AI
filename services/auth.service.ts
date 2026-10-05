"use client"

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type UserCredential,
} from "firebase/auth"
import {
  getFirebaseAuth,
  googleProvider,
  facebookProvider,
} from "@/lib/firebase/client"

export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(getFirebaseAuth(), googleProvider)
}

export async function signInWithFacebook(): Promise<UserCredential> {
  return signInWithPopup(getFirebaseAuth(), facebookProvider)
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password)
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password
  )
  await updateProfile(credential.user, { displayName })
  return credential
}

export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(getFirebaseAuth(), email)
}

export async function signOutFirebase(): Promise<void> {
  return firebaseSignOut(getFirebaseAuth())
}

export async function establishSession(
  idToken: string,
  type: "user" | "admin" = "user"
): Promise<Response> {
  const endpoint =
    type === "admin" ? "/api/auth/admin/session" : "/api/auth/session"
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  })
}

export async function destroySession(type: "user" | "admin" | "all" = "all") {
  return fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  })
}
