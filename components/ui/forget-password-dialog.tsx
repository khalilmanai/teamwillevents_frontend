"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { Mail, Phone } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

type Step = "method" | "code" | "reset"

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail?: string
  userPhone?: string
}

export default function ForgotPasswordDialog({ open, onOpenChange, userEmail, userPhone }: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<Step>("method")
  const [selectedMethod, setSelectedMethod] = useState<"email" | "phone" | null>(null)
  const [target, setTarget] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const { t } = useLanguage()

  const { register, handleSubmit, reset } = useForm()

  // Pre-fill target based on available props
  const handleMethodSelection = (method: "email" | "phone") => {
    setSelectedMethod(method)
    setTarget(method === "email" && userEmail ? userEmail : method === "phone" && userPhone ? userPhone : "")
  }

  // Simulated API calls (replace with your apiService methods)
  const sendCode = async () => {
    setError("")
    try {
      // Call your API: await apiService.sendResetCode({ method: selectedMethod, target })
      console.log("Sending code to", target)
      setStep("code")
    } catch (err) {
      setError("Failed to send code. Try again.")
      setStep("method")
    }
  }

  const verifyCode = async () => {
    setError("")
    try {
      // Call your API: await apiService.verifyResetCojnde({ code: verificationCode })
      console.log("Verifying code:", verificationCode)
      const success = verificationCode === "123456" // Replace with real validation
      if (success) {
        setStep("reset")
      } else {
        throw new Error()
      }
    } catch {
      setError("Invalid code. Try again.")
      setStep("method")
    }
  }

  const resetPassword = async (data: any) => {
    setError("")
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    try {
      // Call your API: await apiService.resetPassword({ code: verificationCode, password: data.password })
      console.log("Password reset successfully")
      onOpenChange(false)
      reset()
      setStep("method")
      setSelectedMethod(null)
      setTarget("")
      setVerificationCode("")
    } catch {
      setError("Something went wrong. Try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("forgotPassword.title")}</DialogTitle>
        </DialogHeader>

        {step === "method" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("forgotPassword.subtitle")}</p>

            <div className="space-y-2">
              <Label>{t("forgotPassword.email")} or {t("forgotPassword.phone")}</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedMethod === "email" ? "default" : "outline"}
                  onClick={() => handleMethodSelection("email")}
                  disabled={!userEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t("forgotPassword.email")}
                </Button>
                <Button
                  variant={selectedMethod === "phone" ? "default" : "outline"}
                  onClick={() => handleMethodSelection("phone")}
                  disabled={!userPhone}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {t("forgotPassword.phone")}
                </Button>
              </div>
              <Input
                placeholder={selectedMethod === "email" ? "Enter your email" : "Enter your phone number"}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={!selectedMethod}
              />
              <Button className="w-full mt-2" onClick={sendCode} disabled={!selectedMethod || !target}>
                {t("forgotPassword.sendCode")}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        )}

        {step === "code" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter the code sent to your {selectedMethod}</p>
            <Input
              placeholder={t("forgotPassword.enterCode")}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <Button className="w-full" onClick={verifyCode}>
              {t("forgotPassword.verifyCode")}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {step === "reset" && (
          <form onSubmit={handleSubmit(resetPassword)} className="space-y-4">
            <div>
              <Label>{t("forgotPassword.newPassword")}</Label>
              <Input type="password" {...register("password", { required: true })} />
            </div>
            <div>
              <Label>{t("forgotPassword.confirmPassword")}</Label>
              <Input type="password" {...register("confirmPassword", { required: true })} />
            </div>
            <Button className="w-full" type="submit">
              Save New Password
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}