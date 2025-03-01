import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	ChevronRight,
	CreditCard,
	LineChart,
	Shield,
	Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100">
			{/* Header with Logos */}
			<header className="sticky top-0 z-50 bg-white shadow-sm">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-center justify-between py-4 md:flex-row">
						<div className="flex items-center space-x-8">
							<div className="flex items-center">
								<Image
									src="/assets/tele-logo.png?height=40&width=40"
									alt="Ethio Credit Association Logo"
									width={40}
									height={40}
									className="mr-2 h-10 w-10 object-contain"
								/>
								<span className="text-sm font-semibold text-slate-800 md:text-base">
									Ethio Credit
								</span>
							</div>

							<div className="hidden items-center md:flex">
								<Image
									src="/tele-logo.png?height=40&width=40"
									alt="Et Telecom Logo"
									width={40}
									height={40}
									className="mr-2 h-10 w-10 object-contain"
								/>
								<span className="text-sm font-semibold text-slate-800 md:text-base">
									Et Telecom
								</span>
							</div>

							<div className="hidden items-center md:flex">
								<Image
									src="/tele-logo.png?height=40&width=40"
									alt="Biisho Logo"
									width={40}
									height={40}
									className="mr-2 h-10 w-10 object-contain"
								/>
								<span className="text-sm font-semibold text-slate-800 md:text-base">
									Biisho
								</span>
							</div>
						</div>

						<div className="mt-4 flex space-x-4 md:mt-0">
							<Link href="/login?role=member">
								<Button variant="outline" size="sm">
									Member Login
								</Button>
							</Link>
							<Link href="/login?role=admin">
								<Button
									size="sm"
									className="bg-lime-500 text-white hover:bg-lime-600">
									Admin Login
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 py-20 text-white">
				<div className="absolute inset-0 bg-[url('/tele-logo.png?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>
				<div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-lime-300 opacity-20 blur-3xl"></div>
				<div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-300 opacity-20 blur-3xl"></div>

				<div className="container relative z-10 mx-auto px-4">
					<div className="mx-auto max-w-5xl text-center">
						<h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl">
							Microfinance Management System
						</h1>
						<p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100">
							Empowering financial inclusion through efficient microfinance
							management and strategic partnerships
						</p>

						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link href="/login?role=member">
								<Button
									size="lg"
									className="group bg-lime-500 px-6 text-white hover:bg-lime-600">
									Get Started
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Button>
							</Link>
							<Link href="#features">
								<Button
									variant="outline"
									size="lg"
									className="border-white px-6 text-white hover:bg-white hover:text-blue-700">
									Learn More
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Partners Section */}
			<section className="bg-white py-16">
				<div className="container mx-auto px-4">
					<h2 className="mb-12 text-center text-3xl font-bold text-slate-800">
						Trusted by Leading Organizations
					</h2>
					<div className="flex flex-wrap items-center justify-center gap-12">
						{["Ethio Credit Association", "Et Telecom", "Biisho"].map(
							(partner) => (
								<div
									key={partner}
									className="group flex flex-col items-center transition-all duration-300 hover:scale-105">
									<div className="mb-4 rounded-full bg-gradient-to-br from-blue-100 to-lime-100 p-4 shadow-lg transition-all duration-300 group-hover:shadow-xl">
										<Image
											src="/tele-logo.png?height=80&width=80"
											alt={`${partner} Logo`}
											width={80}
											height={80}
											className="h-20 w-20 object-contain"
										/>
									</div>
									<span className="text-center text-lg font-medium text-slate-700">
										{partner}
									</span>
								</div>
							)
						)}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
				<div className="container mx-auto px-4">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold text-slate-800 sm:text-4xl">
							Comprehensive Financial Solutions
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-slate-600">
							Our platform provides powerful tools for both members and
							administrators
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						{[
							{
								title: "Member Portal",
								description:
									"Access your account, apply for loans, and manage your savings",
								icon: Users,
								color: "blue",
								features: [
									"View your savings balance and transaction history",
									"Apply for new loans with streamlined application process",
									"Calculate repayments and track your financial progress",
									"Receive notifications about important account updates",
								],
							},
							{
								title: "Admin Dashboard",
								description: "Manage members, loans, and financial operations",
								icon: LineChart,
								color: "lime",
								features: [
									"Comprehensive member management system",
									"Review and process loan applications efficiently",
									"Approve disbursements and track repayments",
									"Generate detailed financial reports and analytics",
								],
							},
						].map((item, index) => (
							<Card
								key={index}
								className="group overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
								<div
									className={`absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-${item.color}-100 opacity-70 transition-transform duration-300 group-hover:scale-150`}></div>
								<CardHeader className="relative z-10 pb-4">
									<div
										className={`mb-3 inline-flex rounded-lg bg-${item.color}-100 p-3 text-${item.color}-600`}>
										<item.icon className="h-6 w-6" />
									</div>
									<CardTitle className="text-2xl font-bold text-slate-800">
										{item.title}
									</CardTitle>
									<CardDescription className="text-slate-500">
										{item.description}
									</CardDescription>
								</CardHeader>
								<CardContent className="pb-4">
									<ul className="space-y-2 text-slate-600">
										{item.features.map((feature, fIndex) => (
											<li key={fIndex} className="flex items-center">
												<ChevronRight
													className={`mr-2 h-4 w-4 text-${item.color}-500`}
												/>
												{feature}
											</li>
										))}
									</ul>
								</CardContent>
								<CardFooter>
									<Link
										href={`/login?role=${
											item.title.toLowerCase().includes("admin")
												? "admin"
												: "member"
										}`}
										className="w-full">
										<Button
											className={`w-full bg-${item.color}-500 text-white hover:bg-${item.color}-600`}>
											Login as {item.title.split(" ")[0]}
										</Button>
									</Link>
								</CardFooter>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="bg-white py-20">
				<div className="container mx-auto px-4">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold text-slate-800 sm:text-4xl">
							Why Choose Our Platform
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-slate-600">
							Designed with security, efficiency, and user experience in mind
						</p>
					</div>

					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{[
							{
								title: "Secure & Reliable",
								description:
									"Enterprise-grade security protocols to protect your financial data and transactions",
								icon: Shield,
							},
							{
								title: "Flexible Financing",
								description:
									"Customizable loan products and savings plans to meet diverse financial needs",
								icon: CreditCard,
							},
							{
								title: "Community Focused",
								description:
									"Built to strengthen financial inclusion and empower local communities",
								icon: Users,
							},
						].map((item, index) => (
							<div
								key={index}
								className="group rounded-xl bg-gradient-to-br from-blue-50 to-lime-50 p-1 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
								<div className="rounded-lg bg-white p-6">
									<div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-blue-500 to-lime-500 p-3 text-white">
										<item.icon className="h-6 w-6" />
									</div>
									<h3 className="mb-3 text-xl font-semibold text-slate-800">
										{item.title}
									</h3>
									<p className="text-slate-600">{item.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gradient-to-br from-blue-900 to-slate-900 py-12 text-slate-300">
				<div className="container mx-auto px-4">
					<div className="mb-8 grid gap-8 md:grid-cols-3">
						<div>
							<h3 className="mb-4 text-lg font-semibold text-white">
								About Us
							</h3>
							<p className="text-sm text-slate-400">
								A collaborative initiative between Ethio Credit Association, Et
								Telecom, and Biisho to provide accessible financial services to
								underserved communities.
							</p>
						</div>
						<div>
							<h3 className="mb-4 text-lg font-semibold text-white">
								Quick Links
							</h3>
							<ul className="space-y-2 text-sm">
								{["Home", "About", "Services", "Contact"].map((item) => (
									<li key={item}>
										<Link
											href="#"
											className="transition-colors duration-200 hover:text-lime-400">
											{item}
										</Link>
									</li>
								))}
							</ul>
						</div>
						<div>
							<h3 className="mb-4 text-lg font-semibold text-white">Contact</h3>
							<ul className="space-y-2 text-sm text-slate-400">
								<li>123 Financial District</li>
								<li>Addis Ababa, Ethiopia</li>
								<li>info@ethiocredit.com</li>
								<li>+251 123 456 789</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-slate-800 pt-8 text-center text-sm">
						<p>
							© {new Date().getFullYear()} Ethio Credit Association, Et Telecom
							& Biisho. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
