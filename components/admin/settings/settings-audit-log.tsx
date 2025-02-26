// components/admin/settings/settings-audit-log.tsx
"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function SettingsAuditLog() {
  const [logs, setLogs] = useState<Tables<"settings_audit_log">[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("settings_audit_log")
          .select(`
            *,
            system_settings (
              category,
              key
            )
          `)
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) throw error
        setLogs(data)
      } catch (error) {
        console.error("Error fetching audit logs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()

    // Subscribe to realtime changes - KEEP THIS AS IT IS, ALREADY BACKEND CONNECTED
    const channel = supabase
      .channel("audit_log_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "settings_audit_log" }, (payload) => {
        setLogs((current) => [payload.new as Tables<"settings_audit_log">, ...current.slice(0, 49)])
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historie změn</CardTitle>
          <CardDescription>Historie změn systémových nastavení</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {/* Removed Mock Data, using loading placeholders */}
            <div className="h-[72px] animate-pulse rounded bg-muted" />
            <div className="h-[72px] animate-pulse rounded bg-muted" />
            <div className="h-[72px] animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historie změn</CardTitle>
        <CardDescription>Historie změn systémových nastavení</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Klíč</TableHead>
              <TableHead>Akce</TableHead>
              <TableHead>Původní hodnota</TableHead>
              <TableHead>Nová hodnota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Žádné změny k zobrazení
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.created_at), "Pp", {
                      locale: cs,
                    })}
                  </TableCell>
                  <TableCell>{(log.system_settings as any)?.category}</TableCell>
                  <TableCell>{(log.system_settings as any)?.key}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.action === "create" ? "default" : log.action === "update" ? "secondary" : "destructive"
                      }
                    >
                      {log.action === "create" ? "Vytvoření" : log.action === "update" ? "Úprava" : "Smazání"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs">
                    {log.old_value ? JSON.stringify(log.old_value, null, 2) : "-"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs">
                    {log.new_value ? JSON.stringify(log.new_value, null, 2) : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}