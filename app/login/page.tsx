"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();
	const { login } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		const success = await login(identifier, password);
		if (success) {
			router.push("/dashboard");
		} else {
			setError("Invalid credentials");
		}
	};

	return (
		<div className="flex h-screen items-center justify-center bg-gray-100">
			<div className="w-full max-w-md space-y-8 rounded-md bg-white p-10 shadow-md">
				<h2 className="text-center text-3xl font-extrabold text-gray-900">
					Sign in to your account
				</h2>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<Label htmlFor="identifier" className="sr-only">
								Email or ET Number
							</Label>
							<Input
								id="identifier"
								name="identifier"
								type="text"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Email or ET Number"
								value={identifier}
								onChange={(e) => setIdentifier(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="password" className="sr-only">
								Password or Phone
							</Label>
							<Input
								id="password"
								name="password"
								type="password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Password or Phone"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					{error && <p className="text-red-500 text-sm">{error}</p>}

					<div>
						<Button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
							Sign in
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/components/ui/use-toast"
// import { useAuth } from "@/lib/auth-provider"

// export default function LoginPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const { login } = useAuth()
//   const { toast } = useToast()
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const callbackUrl = searchParams.get("callbackUrl") || ""
//   const role = searchParams.get("role") || ""

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {
//       const success = await login(email, password)

//       if (success) {
//         toast({
//           title: "Login successful",
//           description: "You have been logged in successfully.",
//           variant: "default",
//         })

//         // Redirect based on role or callback URL
//         if (callbackUrl) {
//           router.push(callbackUrl)
//         } else if (role === "admin") {
//           router.push("/dashboard")
//         } else if (role === "member") {
//           router.push("/member")
//         } else {
//           router.push("/")
//         }
//       } else {
//         toast({
//           title: "Login failed",
//           description: "Invalid email or password.",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       toast({
//         title: "Login failed",
//         description: "An error occurred during login.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
//       <Card className="w-full max-w-md border-2 border-blue-200 shadow-lg">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center text-blue-800">
//             {role === "admin" ? "Admin Login" : role === "member" ? "Member Login" : "Login"}
//           </CardTitle>
//           <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
//         </CardHeader>
//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="name@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Button variant="link" className="p-0 h-auto text-xs text-blue-600" type="button">
//                   Forgot password?
//                 </Button>
//               </div>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//           </CardContent>
//           <CardFooter>
//             <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
//               {isLoading ? "Logging in..." : "Login"}
//             </Button>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   )
// }
