// components/admin/shops/regenerate-api-key-dialog.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import crypto from "crypto"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RegenerateApiKeyDialogProps {
  shop: Tables<"shops"> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegenerateApiKeyDialog({ shop, open, onOpenChange }: RegenerateApiKeyDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function onConfirm() {
    if (!shop) return

    try {
      setIsLoading(true)
      const newApiKey = `sk_${crypto.randomBytes(24).toString("hex")}`

      const { error } = await supabase.from("shops").update({ api_key: newApiKey }).eq("id", shop.id)

      if (error) throw error

      toast.success("API klíč byl úspěšně změněn")
      onOpenChange(false)
    } catch (error) {
      console.error("Error regenerating API key:", error)
      toast.error("Došlo k chybě při změně API klíče")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Změnit API klíč</DialogTitle>
          <DialogDescription>Opravdu chcete změnit API klíč pro e-shop {shop?.name}?</DialogDescription>
        </DialogHeader>
        <Alert variant="destructive">
          <AlertDescription>
            Upozornění: Změna API klíče způsobí nefunkčnost všech stávajících integrací. E-shop bude muset aktualizovat
            API klíč ve své implementaci.
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušit
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Generuji..." : "Změnit API klíč"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}