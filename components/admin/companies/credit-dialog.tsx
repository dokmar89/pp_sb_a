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
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  type: z.enum(["credit", "debit"]),
  amount: z.number().positive("Částka musí být kladné číslo"),
  description: z.string().min(1, "Zadejte popis transakce"),
})

interface CreditDialogProps {
  company: Tables<"companies"> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreditDialog({ company, open, onOpenChange }: CreditDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "credit",
      amount: 0,
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!company) return

    try {
      const { error } = await supabase.from("wallet_transactions").insert({
        company_id: company.id,
        type: values.type,
        amount: values.amount,
        description: values.description,
        status: "completed",
      })

      if (error) throw error

      toast.success("Transakce byla úspěšně vytvořena")
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error creating transaction:", error)
      toast.error("Došlo k chybě při vytváření transakce")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upravit kredit</DialogTitle>
          <DialogDescription>Přidejte nebo odeberte kredit společnosti {company?.name}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ transakce</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte typ transakce" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="credit">Přidat kredit</SelectItem>
                      <SelectItem value="debit">Odebrat kredit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Částka (Kč)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Popis transakce</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Potvrdit transakci
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}