"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Loan {
	id: number;
	memberId: number;
	amount: number;
	interestRate: number;
	tenureMonths: number;
	status: string;
	createdAt: string;
	member: {
		name: string;
	};
}

export default function LoanDetailsPage() {
	const [loans, setLoans] = useState<Loan[]>([]);
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		fetchLoans();
	}, []);

	const fetchLoans = async () => {
		try {
			const response = await fetch("/api/loans");
			if (response.ok) {
				const data = await response.json();
				// Sort loans by createdAt date, most recent first
				const sortedLoans = data.sort(
					(a: Loan, b: Loan) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
				setLoans(sortedLoans);
			} else {
				throw new Error("Failed to fetch loans");
			}
		} catch (error) {
			console.error("Error fetching loans:", error);
			toast({ title: "Failed to fetch loans", variant: "destructive" });
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PENDING":
				return "bg-yellow-500 text-white";
			case "VERIFIED":
				return "bg-blue-500 text-white";
			case "APPROVED":
				return "bg-green-500 text-white";
			case "DISBURSED":
				return "bg-purple-500 text-white";
			case "REPAID":
				return "bg-gray-500 text-white";
			case "REJECTED":
				return "bg-red-500 text-white";
			default:
				return "bg-gray-300 text-gray-800";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Loan Details</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Loan ID</TableHead>
							<TableHead>Member Name</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Interest Rate</TableHead>
							<TableHead>Tenure (Months)</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loans.map((loan) => (
							<TableRow key={loan.id}>
								<TableCell>{loan.id}</TableCell>
								<TableCell>{loan.member.name}</TableCell>
								<TableCell>
									{new Intl.NumberFormat("en-ET", {
										style: "currency",
										currency: "ETB",
									}).format(Number(loan.amount))}
								</TableCell>
								<TableCell>{loan.interestRate}%</TableCell>
								<TableCell>{loan.tenureMonths}</TableCell>
								<TableCell>
									<Badge className={getStatusColor(loan.status)}>
										{loan.status}
									</Badge>
								</TableCell>
								<TableCell>
									{new Date(loan.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<Button
										onClick={() =>
											router.push(`/dashboard/loans/details/${loan.id}`)
										}>
										View
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
