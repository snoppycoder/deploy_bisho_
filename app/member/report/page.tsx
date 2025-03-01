"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
// import { AreaChartComponent, BarChartComponent } from "@/components/ui/chart";

// interface ReportData {
// 	savingsHistory: { date: string; amount: number }[];
// 	loanHistory: { date: string; amount: number }[];
// 	transactionSummary: { type: string; count: number }[];
// }

export default function MemberReportsPage() {
	// const [reportData, setReportData] = useState<ReportData | null>(null);
	// const { toast } = useToast();

	// useEffect(() => {
	// 	fetchReportData();
	// }, []);

	// const fetchReportData = async () => {
	// 	try {
	// 		const response = await fetch("/api/member/reports");
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
	// 	}
	// };

	// if (!reportData) {
	// 	return <div>Loading reports...</div>;
	// }

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Member Reports</h1>
			<Card>
				<CardHeader>
					<CardTitle>Savings History</CardTitle>
					<CardDescription>Your savings growth over time</CardDescription>
				</CardHeader>
				<CardContent>
					{/* <AreaChartComponent
						data={reportData.savingsHistory}
						index="date"
						categories={["amount"]}
						colors={["blue"]}
						valueFormatter={(value: number) => `ETB ${value.toFixed(2)}`}
						className="h-[300px]"
					/> */}
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Loan History</CardTitle>
					<CardDescription>Your loan amounts over time</CardDescription>
				</CardHeader>
				<CardContent>
					Loading Report...
					{/* <AreaChartComponent
						data={reportData.loanHistory}
						index="date"
						categories={["amount"]}
						colors={["green"]}
						valueFormatter={(value: number) => `ETB ${value.toFixed(2)}`}
						className="h-[300px]"
					/> */}
				</CardContent>
			</Card>
		</div>
	);
}
