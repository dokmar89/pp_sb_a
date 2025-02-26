// components/admin/errors/error-details-dialog.tsx
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ErrorDetailsDialogProps {
  error: Tables<"errors"> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ErrorDetailsDialog({ error, open, onOpenChange }: ErrorDetailsDialogProps) {
  const [status, setStatus] = useState(error?.status || "open")
  const [resolutionNote, setResolutionNote] = useState(error?.resolution_note || "")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (!error) return

    try {
      setIsUpdating(true)
      const { error: updateError } = await supabase
        .from("errors")
        .update({
          status: newStatus,
          resolution_note: resolutionNote,
        })
        .eq("id", error.id)

      if (updateError) throw updateError

      setStatus(newStatus)
      toast.success("Status byl úspěšně aktualizován")
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Došlo k chybě při aktualizaci statusu")
    } finally {
      setIsUpdating(false)
    }
  }

  if (!error) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detail chyby</DialogTitle>
          <DialogDescription>ID chyby: {error.id}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Datum vzniku</Label>
              <div>
                {format(new Date(error.created_at), "Pp", {
                  locale: cs,
                })}
              </div>
            </div>
            {error.resolved_at && (
              <div>
                <Label>Datum vyřešení</Label>
                <div>
                  {format(new Date(error.resolved_at), "Pp", {
                    locale: cs,
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Status</Label>
            <div className="flex items-center gap-4 mt-1.5">
              <Badge
                variant={
                  error.status === "resolved" ? "success" : error.status === "investigating" ? "warning" : "destructive"
                }
              >
                {error.status === "resolved" ? "Vyřešeno" : error.status === "investigating" ? "V řešení" : "Otevřeno"}
              </Badge>
              <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Změnit status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Otevřít</SelectItem>
                  <SelectItem value="investigating">Označit jako v řešení</SelectItem>
                  <SelectItem value="resolved">Označit jako vyřešené</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Zdroj chyby</Label>
            <div className="mt-1.5">
              <Badge variant="outline">{error.source}</Badge>
            </div>
          </div>

          <div>
            <Label>Typ chyby</Label>
            <div className="mt-1.5">{error.error_type}</div>
          </div>

          <div>
            <Label>Zpráva</Label>
            <div className="mt-1.5 whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{error.error_message}</div>
          </div>

          {error.error_details && (
            <div>
              <Label>Detaily chyby</Label>
              <pre className="mt-1.5 overflow-auto rounded-md bg-muted p-4 text-sm">
                {JSON.stringify(error.error_details, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <Label>Poznámka k řešení</Label>
            <Textarea
              className="mt-1.5"
              placeholder="Zadejte poznámku k řešení chyby..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}