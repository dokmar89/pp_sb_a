"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Company {
  id: string
  name: string
  email: string
  created_at: string
  status: string
}

export function RegistrationRequests() {
  const [requests, setRequests] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }
      
      setRequests(data || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Nepodařilo se načíst žádosti")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setIsLoading(true)
      
      // Check if user is logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        toast.error("Nejste přihlášeni")
        return
      }

      // Check if user is a super admin
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", session.user.id)
        .single()

      if (adminError || !adminData || adminData.role !== "super_admin") {
        toast.error("Pouze super admin může schvalovat registrace")
        return
      }

      // Update company status
      const { error: updateError } = await supabase
        .from("companies")
        .update({ 
          status: "approved", 
          approved_by: session.user.id, 
          approved_at: new Date().toISOString() 
        })
        .eq("id", id)

      if (updateError) {
        toast.error(`Nepodařilo se schválit společnost: ${updateError.message}`)
        return
      }
      
      toast.success("Společnost byla schválena")
      await fetchRequests()
    } catch (error) {
      console.error("Error approving company:", error)
      toast.error("Nastala chyba při schvalování")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setIsLoading(true)
      
      // Check if user is logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        toast.error("Nejste přihlášeni")
        return
      }

      // Check if user is a super admin
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", session.user.id)
        .single()

      if (adminError || !adminData || adminData.role !== "super_admin") {
        toast.error("Pouze super admin může zamítat registrace")
        return
      }

      // Update company status
      const { error: updateError } = await supabase
        .from("companies")
        .update({ 
          status: "rejected", 
          rejected_by: session.user.id, 
          rejected_at: new Date().toISOString() 
        })
        .eq("id", id)

      if (updateError) {
        toast.error(`Nepodařilo se zamítnout společnost: ${updateError.message}`)
        return
      }
      
      toast.success("Společnost byla zamítnuta")
      await fetchRequests()
    } catch (error) {
      console.error("Error rejecting company:", error)
      toast.error("Nastala chyba při zamítání")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-[200px] rounded">Načítání...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Název společnosti</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Datum žádosti</TableHead>
          <TableHead>Akce</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.name}</TableCell>
            <TableCell>{request.email}</TableCell>
            <TableCell>{new Date(request.created_at).toLocaleDateString("cs")}</TableCell>
            <TableCell className="space-x-2">
              <Button 
                size="sm" 
                onClick={() => handleApprove(request.id)}
                disabled={isLoading}
              >
                Schválit
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => handleReject(request.id)}
                disabled={isLoading}
              >
                Zamítnout
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {requests.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Žádné nové žádosti o registraci
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}