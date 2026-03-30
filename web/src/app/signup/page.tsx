"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, Eye, EyeOff, ArrowRight, Wallet } from "lucide-react"

const C = {
  textPrimary: "#1A1918",
  textSecondary: "#6D6C6A",
  textMuted: "#9C9B99",
  accent: "#4D9B6A",
  inputBg: "#FAFAF9",
  inputBorder: "#E5E4E1",
  pageBg: "#F5F4F1",
  btnFill: "#1A1918",
  btnText: "#FFFFFF",
}

export default function SignUpPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validate = (): string | null => {
    if (username.trim().length < 3) return "Username must be at least 3 characters"

    if (password.length < 6) return "Password must be at least 6 characters"
    if (password !== confirmPassword) return "Passwords do not match"
    if (!agreedTerms) return "You must agree to the Terms of Service"
    return null
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError("")

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      const res = await fetch("http://localhost:3300/users/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Signup failed")
      }

      router.push("/")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const font = "var(--font-outfit)"

  function InputField({
    label,
    icon: Icon,
    type = "text",
    value,
    onChange,
    placeholder,
    showToggle,
    visible,
    onToggle,
  }: {
    label: string
    icon: typeof User
    type?: string
    value: string
    onChange: (v: string) => void
    placeholder: string
    showToggle?: boolean
    visible?: boolean
    onToggle?: () => void
  }) {
    return (
      <div className="flex flex-col" style={{ gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>
          {label}
        </label>
        <div
          className="flex items-center"
          style={{
            borderRadius: 10,
            background: C.inputBg,
            border: `1px solid ${C.inputBorder}`,
            padding: "12px 14px",
            gap: 10,
          }}
        >
          <Icon size={18} style={{ color: C.textMuted, flexShrink: 0 }} />
          <input
            type={showToggle && visible ? "text" : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border-none bg-transparent outline-none"
            style={{ fontSize: 14, color: C.textPrimary, fontFamily: font }}
          />
          {showToggle && onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="border-none bg-transparent cursor-pointer"
              style={{ flexShrink: 0, display: "flex" }}
            >
              {visible ? (
                <Eye size={18} style={{ color: C.textMuted }} />
              ) : (
                <EyeOff size={18} style={{ color: C.textMuted }} />
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: C.pageBg, fontFamily: font }}
    >
      <div
        style={{
          width: 420,
          padding: 40,
          borderRadius: 16,
          background: "#FFFFFF",
          boxShadow: "0 4px 24px rgba(26,25,24,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center" style={{ gap: 8 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Wallet size={24} style={{ color: C.accent }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary }}>
              FinanceV2
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.5, margin: 0 }}>
            Create an account
          </h1>
          <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>
            Get started with your free account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 16 }}>
          <InputField
            label="Username"
            icon={User}
            value={username}
            onChange={setUsername}
            placeholder="Choose a username"
          />

          <InputField
            label="Password"
            icon={Lock}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Create a password"
            showToggle
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
          <InputField
            label="Confirm Password"
            icon={Lock}
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm your password"
            showToggle
            visible={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
          />

          {/* Error */}
          {error && (
            <p style={{ fontSize: 13, color: "#D08068", margin: 0 }}>{error}</p>
          )}
        </form>

        {/* Actions */}
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          {/* Terms */}
          <div className="flex items-center self-start" style={{ gap: 8 }}>
            <div
              onClick={() => setAgreedTerms(!agreedTerms)}
              className="flex cursor-pointer items-center justify-center"
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: agreedTerms ? C.accent : C.inputBg,
                border: `1px solid ${agreedTerms ? C.accent : C.inputBorder}`,
                flexShrink: 0,
              }}
            >
              {agreedTerms && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 12, color: C.textSecondary }}>
              I agree to the Terms of Service and Privacy Policy
            </span>
          </div>

          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center border-none"
            style={{
              height: 44,
              borderRadius: 10,
              background: C.btnFill,
              gap: 8,
              fontFamily: font,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: C.btnText }}>
              {loading ? "Creating account..." : "Create Account"}
            </span>
            {!loading && <ArrowRight size={18} style={{ color: C.btnText }} />}
          </button>

          <div className="flex items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              Already have an account?
            </span>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="cursor-pointer border-none bg-transparent"
              style={{ fontSize: 13, fontWeight: 600, color: C.accent, fontFamily: font }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
