import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
			<div className="w-full max-w-5xl">
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold tracking-tight text-blue-900 sm:text-5xl">
						Microfinance Management System
					</h1>
					<p className="mt-4 text-lg text-blue-700">
						Empowering financial inclusion through efficient microfinance
						management
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<Card className="border-2 border-blue-200 shadow-md transition-all hover:shadow-lg">
						<CardHeader>
							<CardTitle className="text-2xl text-blue-800">
								Member Portal
							</CardTitle>
							<CardDescription>
								Access your account, apply for loans, and manage your savings
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600">
								View your savings balance, apply for new loans, calculate
								repayments, and track your financial progress.
							</p>
						</CardContent>
						<CardFooter>
							<Link href="/login?role=member" className="w-full">
								<Button className="w-full bg-blue-600 hover:bg-blue-700">
									Login as Member
								</Button>
							</Link>
						</CardFooter>
					</Card>

					<Card className="border-2 border-blue-200 shadow-md transition-all hover:shadow-lg">
						<CardHeader>
							<CardTitle className="text-2xl text-blue-800">
								Admin Dashboard
							</CardTitle>
							<CardDescription>
								Manage members, loans, and financial operations
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600">
								Access administrative tools to manage members, review loan
								applications, approve disbursements, and generate reports.
							</p>
						</CardContent>
						<CardFooter>
							<Link href="/login?role=admin" className="w-full">
								<Button className="w-full bg-blue-600 hover:bg-blue-700">
									Login as Admin
								</Button>
							</Link>
						</CardFooter>
					</Card>
				</div>

				<div className="mt-12 text-center">
					<p className="text-sm text-gray-500">
						© {new Date().getFullYear()} Ethio Credit Association. All rights
						reserved.
					</p>
				</div>
			</div>
		</div>
	);
}
