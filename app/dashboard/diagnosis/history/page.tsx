import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { DiagnosisHistoryContent } from "./history-content"

export default function DiagnosisHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DiagnosisHistoryContent />
    </Suspense>
  )
}
