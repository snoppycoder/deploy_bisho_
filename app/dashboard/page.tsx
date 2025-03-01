"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, BarChart, LineChart } from "@/components/ui/chart";
import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react";

interface DashboardData {
	totalMembers: number;
	activeLoanCount: number;
	totalSavings: number;
	pendingApprovals: number;
	loanStatusDistribution: { name: string; value: number }[];
}

export default function DashboardPage() {
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(
		null
	);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const response = await fetch("/api/dashboard");
				if (!response.ok) {
					throw new Error("Failed to fetch dashboard data");
				}
				const data = await response.json();
				setDashboardData(data);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			}
		};

		fetchDashboardData();
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("et-ET", {
			style: "currency",
			currency: "ETB",
		}).format(amount);
	};

	if (!dashboardData) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex flex-col gap-5">
			<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Members</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardData.totalMembers}
						</div>
						{/* You might want to calculate the difference from last month here */}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Loans</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardData.activeLoanCount}
						</div>
						{/* You might want to calculate the difference from last month here */}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Savings</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(dashboardData.totalSavings)}
						</div>
						{/* You might want to calculate the difference from last month here */}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Approvals
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardData.pendingApprovals}
						</div>
						{/* You might want to calculate the difference from last month here */}
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="loans">Loans</TabsTrigger>
					<TabsTrigger value="savings">Savings</TabsTrigger>
				</TabsList>
				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						<Card className="col-span-4">
							<CardHeader>
								<CardTitle>Loan Activity</CardTitle>
								<CardDescription>
									Loan applications and disbursements over time
								</CardDescription>
							</CardHeader>
							<CardContent className="px-2">
								<LineChart
									data={[
										{ name: "Jan", Applications: 10, Disbursements: 8 },
										{ name: "Feb", Applications: 15, Disbursements: 12 },
										{ name: "Mar", Applications: 12, Disbursements: 10 },
										{ name: "Apr", Applications: 18, Disbursements: 15 },
										{ name: "May", Applications: 20, Disbursements: 17 },
										{ name: "Jun", Applications: 25, Disbursements: 20 },
									]}
									index="name"
									categories={["Applications", "Disbursements"]}
									colors={["#2563eb", "#16a34a"]}
									valueFormatter={(value: number) => `${value}`}
									className="h-[300px]"
								/>
							</CardContent>
						</Card>
						<Card className="col-span-3">
							<CardHeader>
								<CardTitle>Loan Status Distribution</CardTitle>
								<CardDescription>Current status of all loans</CardDescription>
							</CardHeader>
							<CardContent>
								<BarChart
									data={dashboardData.loanStatusDistribution}
									index="name"
									categories={["value"]}
									colors={["#2563eb"]}
									valueFormatter={(value: number) => `${value}`}
									className="h-[300px]"
								/>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
				<TabsContent value="loans" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Loan Repayment Trends</CardTitle>
							<CardDescription>
								Monthly loan repayments over time
							</CardDescription>
						</CardHeader>
						<CardContent className="px-2">
							<AreaChart
								data={[
									{ name: "Jan", amount: 500 },
									{ name: "Feb", amount: 1200 },
									{ name: "Mar", amount: 900 },
									{ name: "Apr", amount: 1500 },
									{ name: "May", amount: 2000 },
									{ name: "Jun", amount: 1800 },
								]}
								index="name"
								categories={["amount"]}
								colors={["#2563eb"]}
								valueFormatter={(value: number) => formatCurrency(value)}
								className="h-[300px]"
							/>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="savings" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Savings Growth</CardTitle>
							<CardDescription>Total savings over time</CardDescription>
						</CardHeader>
						<CardContent className="px-2">
							<AreaChart
								data={[
									{ name: "Jan", amount: 1000 },
									{ name: "Feb", amount: 1500 },
									{ name: "Mar", amount: 2000 },
									{ name: "Apr", amount: 2500 },
									{ name: "May", amount: 3000 },
									{ name: "Jun", amount: 3500 },
								]}
								index="name"
								categories={["amount"]}
								colors={["#16a34a"]}
								valueFormatter={(value: number) => formatCurrency(value)}
								className="h-[300px]"
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
