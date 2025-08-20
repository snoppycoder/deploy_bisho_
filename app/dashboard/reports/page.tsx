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
import { useToast } from "@/components/ui/use-toast";

interface ReportData {
	loanTrends: {
		month: string;
		applications: number;
		approvals: number;
		disbursements: number;
	}[];
	savingsGrowth: {
		month: string;
		totalSavings: number;
	}[];
	membershipGrowth: {
		month: string;
		totalMembers: number;
	}[];
	loanPerformance: {
		status: string;
		count: number;
	}[];
}

export default function ReportsPage() {
	// const [reportData, setReportData] = useState<ReportData | null>(null);
	// const [isLoading, setIsLoading] = useState(true);
	// const { toast } = useToast();

	// useEffect(() => {
	// 	fetchReportData();
	// }, []);

	// const fetchReportData = async () => {
	// 	setIsLoading(true);
	// 	try {
	// 		const response = await fetch("/api/reports");
	// 		if (!response.ok) {
	// 			throw new Error("Failed to fetch report data");
	// 		}
	// 		const data = await response.json();
	// 		setReportData(data);
	// 	} catch (error) {
	// 		console.error("Error fetching report data:", error);
	// 		toast({
	// 			title: "Error",
	// 			description: "Failed to load report data. Please try again.",
	// 			variant: "destructive",
	// 		});
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// };

	// if (isLoading || !reportData) {
	// 	return <div>Loading reports...</div>;
	// }

	return (
		<div className="space-y-4">
            Report page
			{/* <h1 className="text-2xl font-bold">Reports & Analytics</h1>
			<Tabs defaultValue="loanTrends">
				<TabsList>
					<TabsTrigger value="loanTrends">Loan Trends</TabsTrigger>
					<TabsTrigger value="savingsGrowth">Savings Growth</TabsTrigger>
					<TabsTrigger value="membershipGrowth">Membership Growth</TabsTrigger>
					<TabsTrigger value="loanPerformance">Loan Performance</TabsTrigger>
				</TabsList>
				<TabsContent value="loanTrends">
					<Card>
						<CardHeader>
							<CardTitle>Loan Trends</CardTitle>
							<CardDescription>
								Monthly loan applications, approvals, and disbursements
							</CardDescription>
						</CardHeader>
						<CardContent>
							<LineChart
								data={reportData.loanTrends}
								index="month"
								categories={["applications", "approvals", "disbursements"]}
								colors={["#2563eb", "#16a34a", "#d97706"]}
								valueFormatter={(value: number) => `${value}`}
								className="h-[400px]"
							/>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="savingsGrowth">
					<Card>
						<CardHeader>
							<CardTitle>Savings Growth</CardTitle>
							<CardDescription>Total savings over time</CardDescription>
						</CardHeader>
						<CardContent>
							<AreaChart
								data={reportData.savingsGrowth}
								index="month"
								categories={["totalSavings"]}
								colors={["#16a34a"]}
								valueFormatter={(value: number) => `$${value.toFixed(2)}`}
								className="h-[400px]"
							/>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="membershipGrowth">
					<Card>
						<CardHeader>
							<CardTitle>Membership Growth</CardTitle>
							<CardDescription>Total members over time</CardDescription>
						</CardHeader>
						<CardContent>
							<LineChart
								data={reportData.membershipGrowth}
								index="month"
								categories={["totalMembers"]}
								colors={["#2563eb"]}
								valueFormatter={(value: number) => `${value}`}
								className="h-[400px]"
							/>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="loanPerformance">
					<Card>
						<CardHeader>
							<CardTitle>Loan Performance</CardTitle>
							<CardDescription>Distribution of loan statuses</CardDescription>
						</CardHeader>
						<CardContent>
							<BarChart
								data={reportData.loanPerformance}
								index="status"
								categories={["count"]}
								colors={["#2563eb"]}
								valueFormatter={(value: number) => `${value}`}
								className="h-[400px]"
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs> */}
		</div>
	);
}
