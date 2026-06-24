"use client"

import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import type { Note } from "@/lib/types"

interface NotesPdfViewerProps {
  note: Note | null
  onClose: () => void
}

export function NotesPdfViewer({ note, onClose }: NotesPdfViewerProps) {
  // Block right-click, text selection, and common save/print shortcuts while the viewer is open
  useEffect(() => {
    if (!note) return

    const blockContextMenu = (e: MouseEvent) => e.preventDefault()
    const blockShortcuts = (e: KeyboardEvent) => {
      const isSaveOrPrint =
        (e.ctrlKey || e.metaKey) && ["s", "p", "u"].includes(e.key.toLowerCase())
      if (isSaveOrPrint) {
        e.preventDefault()
      }
    }

    document.addEventListener("contextmenu", blockContextMenu)
    document.addEventListener("keydown", blockShortcuts)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu)
      document.removeEventListener("keydown", blockShortcuts)
      document.body.style.overflow = ""
    }
  }, [note])

  if (!note) return null

  // #toolbar=0&navpanes=0 hides the browser's built-in PDF toolbar (download/print/save buttons)
  // in Chrome/Edge's native PDF viewer. view=FitH keeps the page fit to width.
  const viewerSrc = `${note.fileUrl}#toolbar=0&navpanes=0&view=FitH`
 

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md hover:bg-muted shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="min-w-0 text-center flex-1">
          <h3 className="font-semibold truncate">{note.title}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {note.year} · Block {note.block} · {note.subject} · {note.topic}
          </p>
        </div>
        <div className="w-[72px] shrink-0" />
      </div>

      <div className="relative flex-1 select-none" onContextMenu={(e) => e.preventDefault()}>
        <iframe src={viewerSrc} className="w-full h-full border-0" title={note.title} />
      </div>

      <p className="text-xs text-muted-foreground text-center py-2 border-t shrink-0">
        View only — downloading and printing are disabled for this note.
      </p>
    </div>
  )
}