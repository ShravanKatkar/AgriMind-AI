import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getImageStorageStatus } from "@/services/upload.service"

export async function GET() {
  const session = await getSessionUser()
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const status = getImageStorageStatus()
  return NextResponse.json({
    success: true,
    data: {
      ...status,
      message: status.ready
        ? "Images are uploaded to cloud storage; only URLs are saved in MongoDB."
        : "Configure Cloudinary or Firebase Storage to save diagnosis photos in history.",
    },
  })
}
