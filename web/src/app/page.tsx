'use client'
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        const res = await fetch("http://localhost:3300/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || "Signin failed")
        }

        router.push("/dashboard")
      } 
    catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tighter" >Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              < Input type="text" id="username" onChange={(e) => setUsername(e.target.value)} value={username} placeholder="Enter your username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                < Input id="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <a href="#" className="text-sm text-primary-500 hover:text-primary-600">Forgot password?</a>
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
            <div className="text-center text-sm">
          <span className="text-muted-foreground">Don’t have an account?</span>{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Create one
          </button>
        </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
