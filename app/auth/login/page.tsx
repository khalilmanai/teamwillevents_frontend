"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, LogIn, ArrowRight, Calendar, Users, Trophy, Sparkles, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { LanguageSelector } from "@/components/ui/language-selector"
import { apiService } from "@/lib/api"
import { useLanguage } from "@/lib/i18n"
import Image from "next/image"

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFeature, setActiveFeature] = useState(0)
  const router = useRouter()
  const { t } = useLanguage()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const features = [
    {
      icon: Calendar,
      title: "Event Management",
      description: "Seamlessly organize and manage your corporate events with our intuitive platform",
      color: "from-green-500 to-green-300" // Updated to green/light green gradient
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Empower your team with real-time collaboration tools and streamlined workflows",
      color: "from-green-600 to-green-400"
    },
    {
      icon: Trophy,
      title: "Success Analytics",
      description: "Track performance and gain insights with comprehensive analytics and reporting",
      color: "from-green-700 to-green-500"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const validateTeamWillEmail = (email: string) => {
    return email.includes("@teamwill") || email.includes("@teamwillgroup")
  }

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Login attempt started')
      const response = await apiService.login(data.email, data.password)
      console.log('Login successful:', response)

      await apiService.setToken(response.access_token)

      let storedToken = null
      for (let i = 0; i < 10; i++) {
        storedToken = await apiService.getToken()
        if (storedToken) break
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      console.log('Token stored:', !!storedToken)
      if (!storedToken) {
        throw new Error('Token not properly stored')
      }

      const redirectPath = response.user.role === "manager" ? "/manager" : "/employee"
      console.log('Redirecting to:', redirectPath)
      window.location.href = redirectPath
    } catch (error) {
      console.error('Login failed:', error)
      setError(t("auth.invalidCredentials"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-green-400 flex font-sans">
      {/* Left Side - Brand & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background with Subtle Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/80 to-green-400/80">
          <div className="absolute inset-0 opacity-10"></div> {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3),rgba(255,255,255,0))]"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 3}s`
                }}
              >
                <Sparkles className="h-3 w-3 text-white/30" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Logo Section */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/30">
                <Image
                  src="/logo-teamwill.png"
                  alt="TeamWill Logo"
                  width={60}
                  height={60}
                  className="rounded-lg"
                  priority
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                  TeamwillEvents
                </h1>
                <p className="text-green-100 mt-1 text-sm">Enterprise Event Management</p>
              </div>
            </div>
          </div>

          {/* Features Carousel */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 ease-in-out ${
                  index === activeFeature 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-50 translate-y-2 scale-95'
                }`}
                role="tabpanel"
                aria-hidden={index !== activeFeature}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} shadow-md`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-green-100 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Indicators */}
          <div className="flex gap-2 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  index === activeFeature ? 'w-6 bg-green-400' : 'bg-white/30'
                }`}
                onClick={() => setActiveFeature(index)}
                aria-label={`Go to feature ${index + 1}`}
                aria-selected={index === activeFeature}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/30">
                <Image
                  src="/logo-teamwill.png"
                  alt="TeamWill Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-white">TeamwillEvents</h1>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex justify-end mb-6">
            <LanguageSelector showText variant="default" className="bg-white/10 text-white hover:bg-white/20 rounded-lg" />
          </div>

          {/* Login Card */}
          <Card className="bg-gray-100/90 backdrop-blur-md shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600 text-sm">
                  {t("auth.loginDescription")}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-lg">
                    <AlertDescription className="text-red-700 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("auth.email")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      className="h-11 pl-4 pr-4 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200"
                      {...register("email", {
                        required: t("auth.emailRequired"),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t("auth.emailInvalid"),
                        },
                        validate: (value) => validateTeamWillEmail(value) || t("auth.emailDomainInvalid"),
                      })}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 pl-4 pr-12 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200"
                      {...register("password", {
                        required: t("auth.passwordRequired"),
                        minLength: {
                          value: 6,
                          message: t("auth.passwordMinLength"),
                        },
                      })}
                      aria-invalid={!!errors.password}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-green-600"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-green-500 to-green-300 hover:from-green-600 hover:to-green-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("auth.loginButton")}
                     
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Accounts */}
              
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-white/70">
              © 2025 TeamWill Events. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}