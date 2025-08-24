"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Camera, Save, Eye, EyeOff, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useLanguage } from "@/lib/i18n"
import { apiService } from "@/lib/api"
import type { User, UpdateProfileData, ChangePasswordData } from "@/lib/types"
import { CropperDialog } from "../ui/CropperDialog"
import ForgotPasswordDialog from "../ui/forget-password-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProfileFormProps {
  user: User
  onUserUpdate: (user: User) => void
}

export function ProfileForm({ user, onUserUpdate }: ProfileFormProps) {
  const { t } = useLanguage()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfileForm,
  } = useForm<UpdateProfileData>({
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      location: user.location || "",
      department: user.department || "",
      job: user.job || "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    watch,
  } = useForm<ChangePasswordData>()

  const newPassword = watch("newPassword")

  useEffect(() => {
    resetProfileForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      department: user.department || "",
      location: user.location || "",
      job: user.job || "",
    })
  }, [user, resetProfileForm])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const validateTeamWillEmail = (email: string) => {
    return email.includes("@teamwill") || email.includes("@teamwillgroup")
  }

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return true
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ""))
  }

  const onSubmitProfile = async (data: UpdateProfileData) => {
    setIsUpdatingProfile(true)
    setMessage(null)

    try {
      const updatedUser = await apiService.updateProfile(data)
      onUserUpdate(updatedUser)
      setMessage({ type: 'success', text: t("profile.profileUpdated") })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || t("common.error") })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onSubmitPassword = async (data: ChangePasswordData) => {
    setIsChangingPassword(true)
    setMessage(null)

    try {
      await apiService.changePassword(data)
      setMessage({ type: 'success', text: t("profile.passwordChanged") })
      resetPasswordForm()
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || t("common.error") })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t("profile.maxFileSize") })
      return
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      setMessage({ type: 'error', text: t("profile.invalidFileType") })
      return
    }

    setSelectedFile(file)
  }

  const handleCropperSave = async (croppedBlob: Blob) => {
    setSelectedFile(null)
    setIsUploadingAvatar(true)
    setMessage(null)

    try {
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })
      const result = await apiService.uploadAvatar(file)
      const updatedUser = { ...user, avatarUrl: result.url }
      onUserUpdate(updatedUser)
      setMessage({ type: 'success', text: t("profile.avatarUpdated") })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || t("common.error") })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCropperCancel = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDeleteAvatar = async () => {
    setIsDeleteDialogOpen(false)
    setIsDeletingAvatar(true)
    setMessage(null)

    try {
      await apiService.deleteUserAvatar()
      const updatedUser = { ...user, avatarUrl: "" }
      onUserUpdate(updatedUser)
      setMessage({ type: 'success', text: t("profile.avatarDeleted") })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || t("common.error") })
    } finally {
      setIsDeletingAvatar(false)
    }
  }

  const formatJoinedDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Intl.DateTimeFormat(t("common.locale") || "en-US", {
      year: "numeric",
      month: "long",
    }).format(new Date(dateString))
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6 max-w-3xl">
      {/* Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="relative">
          <AlertDescription>{message.text}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={() => setMessage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Profile Picture */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t("profile.avatar")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-primary ring-offset-2">
              <AvatarImage
                src={user.avatarUrl || "/placeholder.svg"}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {(isUploadingAvatar || isDeletingAvatar) && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar || isDeletingAvatar}
                variant="secondary"
                className="w-full sm:w-auto px-4 py-2"
              >
                <Camera className="h-4 w-4 mr-2" />
                {t("profile.changeAvatar")}
              </Button>
              {user.avatarUrl && (
                <Button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isUploadingAvatar || isDeletingAvatar}
                  variant="destructive"
                  className="w-full sm:w-auto px-4 py-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("profile.deleteAvatar")}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("profile.avatarHelp") || "Accepted formats: JPG, PNG, GIF, WebP – max 5MB."}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label={t("profile.selectAvatarFile")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t("profile.personalInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t("profile.name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={t("profile.namePlaceholder")}
                  className="border rounded-md p-2"
                  {...registerProfile("name", {
                    required: t("profile.nameRequired"),
                    minLength: {
                      value: 2,
                      message: t("profile.nameMinLength")
                    }
                  })}
                />
                {profileErrors.name && (
                  <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("profile.email")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("profile.emailPlaceholder")}
                  className="border rounded-md p-2"
                  {...registerProfile("email", {
                    required: t("auth.emailRequired"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("auth.emailInvalid"),
                    },
                    validate: (value) => validateTeamWillEmail(value) || t("auth.emailDomainInvalid"),
                  })}
                />
                {profileErrors.email && (
                  <p className="text-xs text-destructive">{profileErrors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">{t("profile.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("profile.phonePlaceholder")}
                  className="border rounded-md p-2"
                  {...registerProfile("phone", {
                    validate: (value) => validatePhoneNumber(value || "") || t("profile.phoneInvalid"),
                  })}
                />
                {profileErrors.phone && (
                  <p className="text-xs text-destructive">{profileErrors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">{t("profile.department")}</Label>
                <Input
                  id="department"
                  placeholder={t("profile.departmentPlaceholder")}
                  className="border rounded-md p-2 bg-muted"
                  {...registerProfile("department")}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">{t("profile.position")}</Label>
                <Input
                  id="position"
                  placeholder={t("profile.positionPlaceholder")}
                  className="border rounded-md p-2 bg-muted"
                  {...registerProfile("job")}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">{t("profile.location")}</Label>
                <Input
                  id="location"
                  placeholder={t("profile.locationPlaceholder")}
                  className="border rounded-md p-2"
                  {...registerProfile("location")}
                />
                {profileErrors.location && (
                  <p className="text-xs text-destructive">{profileErrors.location.message}</p>
                )}
              </div>
              {user.joinedAt && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("color: inherit;profile.joinedAt")}</Label>
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {formatJoinedDate(user.joinedAt)}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">{t("profile.address")}</Label>
              <Textarea
                id="address"
                placeholder={t("profile.addressPlaceholder")}
                rows={3}
                className="border rounded-md p-2"
                {...registerProfile("address")}
              />
            </div>
            <Button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-600"
            >
              {isUpdatingProfile ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("profile.updateProfile")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t("profile.security")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  {t("profile.currentPassword")} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    className="border rounded-md p-2 pr-10"
                    {...registerPassword("currentPassword", {
                      required: t("profile.currentPasswordRequired"),
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("current")}
                    aria-label={showPasswords.current ? t("profile.hidePassword") : t("profile.showPassword")}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-sm text-primary hover:underline p-0 h-auto mt-1"
                  onClick={() => setIsForgotPasswordOpen(true)}
                >
                  {t("profile.forgotPassword")}
                </Button>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  {t("profile.newPassword")} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    className="border rounded-md p-2 pr-10"
                    {...registerPassword("newPassword", {
                      required: t("profile.newPasswordRequired"),
                      minLength: {
                        value: 8,
                        message: t("auth.passwordMinLength"),
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: t("auth.passwordComplexity")
                      }
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("new")}
                    aria-label={showPasswords.new ? t("profile.hidePassword") : t("profile.showPassword")}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("profile.passwordRequirements") || "Password must be at least 8 characters with uppercase, lowercase, and number."}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t("profile.confirmPassword")} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    className="border rounded-md p-2 pr-10"
                    {...registerPassword("confirmPassword", {
                      required: t("profile.confirmPasswordRequired"),
                      validate: (value) => value === newPassword || t("profile.passwordMismatch"),
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("confirm")}
                    aria-label={showPasswords.confirm ? t("profile.hidePassword") : t("profile.showPassword")}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <Button
              type="submit"
              disabled={isChangingPassword}
              variant="outline"
              className="w-full sm:w-auto px-4 py-2"
            >
              {isChangingPassword ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("profile.changePassword")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Cropper Dialog */}
      {selectedFile && (
        <CropperDialog
          file={selectedFile}
          onCancel={handleCropperCancel}
          onSave={handleCropperSave}
        />
      )}

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
        userEmail={user.email}
        userPhone={user.phone}
      />

      {/* Delete Avatar Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.deleteAvatarTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile.deleteAvatarDescription") || "Are you sure you want to delete your profile picture? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvatar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}