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

export default function SignInPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim()) {
      setError("Username is required")
      return
    }
    if (!password) {
      setError("Password is required")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("http://localhost:3300/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Sign in failed")
      }

      const data = await res.json()
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)
      }

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const font = "var(--font-outfit)"

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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.5 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: C.textMuted }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col"
          style={{ gap: 20 }}
        >
          {/* Username */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>
              Username
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
              <User size={18} style={{ color: C.textMuted, flexShrink: 0 }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full border-none bg-transparent outline-none"
                style={{ fontSize: 14, color: C.textPrimary, fontFamily: font }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>
              Password
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
              <Lock size={18} style={{ color: C.textMuted, flexShrink: 0 }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border-none bg-transparent outline-none"
                style={{ fontSize: 14, color: C.textPrimary, fontFamily: font }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="border-none bg-transparent cursor-pointer"
                style={{ flexShrink: 0, display: "flex" }}
              >
                {showPassword ? (
                  <Eye size={18} style={{ color: C.textMuted }} />
                ) : (
                  <EyeOff size={18} style={{ color: C.textMuted }} />
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center" style={{ gap: 8 }}>
            <div
              onClick={() => setRemember(!remember)}
              className="flex cursor-pointer items-center justify-center"
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: remember ? C.accent : C.inputBg,
                border: `1px solid ${remember ? C.accent : C.inputBorder}`,
                flexShrink: 0,
              }}
            >
              {remember && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: C.textSecondary }}>Remember me</span>
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 13, color: "#D08068", margin: 0 }}>{error}</p>
          )}
        </form>

        {/* Actions */}
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          <button
            onClick={handleSubmit}
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
              {loading ? "Signing in..." : "Sign In"}
            </span>
            {!loading && <ArrowRight size={18} style={{ color: C.btnText }} />}
          </button>
          <div className="flex items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              Don&apos;t have an account?
            </span>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="cursor-pointer border-none bg-transparent"
              style={{ fontSize: 13, fontWeight: 600, color: C.accent, fontFamily: font }}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
