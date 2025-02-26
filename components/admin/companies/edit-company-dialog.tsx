"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(2, "Název společnosti musí mít alespoň 2 znaky"),
  ico: z.string().length(8, "IČO musí mít 8 číslic"),
  dic: z.string().min(10, "DIČ musí mít správný formát").max(12),
  address: z.string().min(5, "Zadejte platnou adresu"),
  email: z.string().email("Zadejte platný email"),
  phone: z.string().min(9, "Zadejte platné telefonní číslo"),
  contact_person: z.string().min(3, "Zadejte jméno a příjmení"),
  status: z.enum(["pending", "approved", "rejected"]),
})

interface EditCompanyDialogProps {
  company: Tables<"companies"> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCompanyDialog({ company, open, onOpenChange }: EditCompanyDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: company || {
      name: "",
      ico: "",
      dic: "",
      address: "",
      email: "",
      phone: "",
      contact_person: "",
      status: "pending",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!company) return

    try {
      const { error } = await supabase.from("companies").update(values).eq("id", company.id)

      if (error) throw error

      toast.success("Společnost byla úspěšně upravena")
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating company:", error)
      toast.error("Došlo k chybě při úpravě společnosti")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit společnost</DialogTitle>
          <DialogDescription>Upravte údaje o společnosti</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název společnosti</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="ico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IČO</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DIČ</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresa</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontaktní osoba</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Čeká na schválení</SelectItem>
                      <SelectItem value="approved">Schváleno</SelectItem>
                      <SelectItem value="rejected">Zamítnuto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Uložit změny
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}