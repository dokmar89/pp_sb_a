// components/admin/shops/shop-customization.tsx
"use client"

import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ColorPicker } from "@/components/color-picker"
import { PreviewModal } from "@/components/verification/preview-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  logo_url: z.string().url().optional(),
  primary_color: z.string(),
  secondary_color: z.string(),
  font: z.string(),
  button_style: z.string(),
  verification_methods: z.array(z.string()),
  failure_action: z.string(),
  failure_redirect: z.string().url().optional(),
  texts: z.object({
    title: z.string(),
    subtitle: z.string(),
    successMessage: z.string(),
    failureMessage: z.string(),
    buttonLabels: z.object({
      bankid: z.string(),
      mojeid: z.string(),
      facescan: z.string(),
      ocr: z.string(),
      revalidate: z.string(),
      otherDevice: z.string(),
    }),
  }),
  images: z.object({
    background: z.string().url().optional(),
    successIcon: z.string().url().optional(),
    failureIcon: z.string().url().optional(),
  }),
})

const fonts = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
]

const buttonStyles = [
  { value: "rounded", label: "Zaoblené" },
  { value: "square", label: "Hranaté" },
  { value: "pill", label: "Pilulka" },
]

const verificationMethods = [
  { id: "bankid", label: "BankID" },
  { id: "mojeid", label: "MojeID" },
  { id: "ocr", label: "OCR" },
  { id: "facescan", label: "Facescan" },
]

const failureActions = [
  { value: "redirect", label: "Přesměrovat" },
  { value: "block", label: "Blokovat přístup" },
]

interface ShopCustomizationProps {
  shop: Tables<"shops">
  customization: Tables<"customizations"> | null
}

export function ShopCustomization({ shop, customization }: ShopCustomizationProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo_url: customization?.logo_url || undefined,
      primary_color: customization?.primary_color || "#000000",
      secondary_color: customization?.secondary_color || "#ffffff",
      font: customization?.font || "inter",
      button_style: customization?.button_style || "rounded",
      verification_methods: customization?.verification_methods || [],
      failure_action: customization?.failure_action || "block",
      failure_redirect: customization?.failure_redirect || undefined,
      texts: customization?.texts || {
        title: "Ověření věku",
        subtitle: "Vyberte způsob ověření věku",
        successMessage: "Věk byl úspěšně ověřen",
        failureMessage: "Nepodařilo se ověřit váš věk",
        buttonLabels: {
          bankid: "Ověřit pomocí BankID",
          mojeid: "Ověřit pomocí MojeID",
          facescan: "Ověřit pomocí FaceScan",
          ocr: "Ověřit pomocí dokladu",
          revalidate: "Opakované ověření",
          otherDevice: "Jiné zařízení",
        },
      },
      images: customization?.images || {},
    },
  })

  const [previewOpen, setPreviewOpen] = useState(false)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase
        .from("customizations")
        .upsert({
          shop_id: shop.id,
          ...values,
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Nastavení bylo úspěšně uloženo")
    } catch (error) {
      console.error("Error updating customization:", error)
      toast.error("Došlo k chybě při ukládání nastavení")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Přizpůsobení</CardTitle>
        <CardDescription>Nastavení vzhledu a chování ověřovacího procesu</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="design">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="design">Vzhled</TabsTrigger>
                <TabsTrigger value="content">Obsah</TabsTrigger>
                <TabsTrigger value="methods">Metody</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                <FormField
                  control={form.control}
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/logo.png"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="primary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primární barva</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sekundární barva</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="font"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Písmo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Vyberte písmo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fonts.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="button_style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Styl tlačítek</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Vyberte styl tlačítek" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buttonStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="images.background"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Obrázek pozadí</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/background.jpg"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <FormField
                  control={form.control}
                  name="texts.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nadpis</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="texts.subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Podnadpis</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="texts.successMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zpráva při úspěchu</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="texts.failureMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zpráva při neúspěchu</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>Texty tlačítek</FormLabel>
                  {verificationMethods.map((method) => (
                    <FormField
                      key={method.id}
                      control={form.control}
                      name={`texts.buttonLabels.${method.id}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{method.label}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="methods" className="space-y-4">
                <FormField
                  control={form.control}
                  name="verification_methods"
                  render={() => (
                    <FormItem>
                      <FormLabel>Povolené metody ověření</FormLabel>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {verificationMethods.map((method) => (
                          <FormField
                            key={method.id}
                            control={form.control}
                            name="verification_methods"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(method.id)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || []
                                      if (checked) {
                                        field.onChange([...value, method.id])
                                      } else {
                                        field.onChange(value.filter((val) => val !== method.id))
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{method.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="failure_action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Akce při neúspěšném ověření</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte akci" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {failureActions.map((action) => (
                            <SelectItem key={action.value} value={action.value}>
                              {action.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("failure_action") === "redirect" && (
                  <FormField
                    control={form.control}
                    name="failure_redirect"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL pro přesměrování</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com/error"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Button type="submit">Uložit nastavení</Button>
              <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
                Zobrazit náhled
              </Button>
            </div>
          </form>
        </Form>

        <PreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          customization={{
            ...form.getValues(),
            shop_id: shop.id,
          }}
        />
      </CardContent>
    </Card>
  )
}