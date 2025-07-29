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
									src="data:image/jpeg;base64,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"
									alt="Ethio Credit Association Logo"
									width={65}
									height={75}
									className="mr-2 h-10 w-10 object-contain"
								/>
								<span className="text-sm font-semibold text-slate-800 md:text-base">
									Ethio Credit
								</span>
							</div>

							{/* <div className="hidden items-center md:flex">
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
							</div> */}

							<div className="hidden items-center md:flex">
								<Image
									src="https://biisho.com/wp-content/uploads/2024/08/cropped-WhatsApp_Image_2024-03-01_at_3.31.41_PM-removebg-preview-300x168.png"
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
									Login
								</Button>
							</Link>
							{/* <Link href="/login?role=admin">
								<Button
									size="sm"
									className="bg-lime-500 text-white hover:bg-lime-600">
									Admin Login
								</Button>
							</Link> */}
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
							Ethi-Credit Microfinance Management System
						</h1>
						<p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100">
							Empowering financial inclusion through efficient microfinance
							management and strategic partnerships
						</p>

						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							{/* <Link href="/login?role=member">
								<Button
									size="lg"
									className="group bg-lime-500 px-6 text-white hover:bg-lime-600">
									Apply Memebership
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Button>
							</Link> */}
							<Link href="/membership">
								<Button
									size="lg"
									className="group bg-lime-500 px-6 text-white hover:bg-lime-600">
									Apply Memebership
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Button>
							</Link>
							{/* <Link href="#features">
								<Button
									variant="outline"
									size="lg"
									className="border-white px-6 hover:bg-white text-blue-700">
									Learn More
								</Button>
							</Link> */}
						</div>
					</div>
				</div>
			</section>

			{/* Partners Section */}
			{/* <section className="bg-white py-16">
				<div className="container mx-auto px-4">
					<h2 className="mb-12 text-center text-3xl font-bold text-slate-800">
						Trusted by Leading Organizations
					</h2>
					<div className="flex flex-wrap items-center justify-center gap-12">
						{["Ethio Credit Association", "Biisho"].map((partner) => (
							<div
								key={partner}
								className="group flex flex-col items-center transition-all duration-300 hover:scale-105">
								<div className="mb-4 rounded-full bg-gradient-to-br from-blue-100 to-lime-100 p-4 shadow-lg transition-all duration-300 group-hover:shadow-xl">
									<Image
										src="/assets/tele1.jpeg?height=80&width=80"
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
						))}
					</div>
				</div>
			</section> */}

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
