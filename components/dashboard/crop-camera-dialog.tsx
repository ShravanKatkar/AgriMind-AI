"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, Loader2, SwitchCamera } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type CropCameraDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (dataUrl: string) => void
}

export function CropCameraDialog({
  open,
  onOpenChange,
  onCapture,
}: CropCameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [starting, setStarting] = useState(false)
  const [ready, setReady] = useState(false)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera is not supported in this browser.")
      onOpenChange(false)
      return
    }

    setStarting(true)
    setReady(false)
    stopStream()

    try {
      const videoConstraints: MediaTrackConstraints = {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      }

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
        setReady(true)
      }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission denied. Allow camera access in your browser settings."
          : err instanceof Error
            ? err.message
            : "Could not open camera."
      toast.error(message)
      onOpenChange(false)
    } finally {
      setStarting(false)
    }
  }, [facingMode, onOpenChange, stopStream])

  useEffect(() => {
    if (!open) {
      stopStream()
      return
    }
    void startCamera()
    return () => stopStream()
  }, [open, facingMode, startCamera, stopStream])

  const handleCapture = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      toast.error("Camera is still loading. Please wait a moment.")
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      toast.error("Could not capture photo.")
      return
    }

    ctx.drawImage(video, 0, 0)
    onCapture(canvas.toDataURL("image/jpeg", 0.9))
    onOpenChange(false)
    toast.success("Photo captured")
  }

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) stopStream()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-lg gap-4 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Take a crop photo</DialogTitle>
          <DialogDescription>
            Position the affected leaves or plant in the frame, then capture.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-[4/3] bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full object-cover"
          />
          {(starting || !ready) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleCamera}
            disabled={starting || !ready}
            aria-label="Switch camera"
          >
            <SwitchCamera className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            className="flex-1 gap-2"
            size="lg"
            onClick={handleCapture}
            disabled={starting || !ready}
          >
            <Camera className="h-4 w-4" />
            Capture photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
