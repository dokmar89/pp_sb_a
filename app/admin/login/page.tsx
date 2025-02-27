import { AdminLoginForm } from "@/components/admin/admin-login-form"

export default function AdminLoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Portál</h1>
          <p className="text-sm text-muted-foreground">Přihlaste se do administrace</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}

