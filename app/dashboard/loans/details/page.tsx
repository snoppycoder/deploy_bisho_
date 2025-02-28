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
				setLoans(data);
			} else {
				throw new Error("Failed to fetch loans");
			}
		} catch (error) {
			console.error("Error fetching loans:", error);
			toast({ title: "Failed to fetch loans", variant: "destructive" });
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
								<TableCell>${Number(loan.amount).toFixed(2)}</TableCell>
								<TableCell>{loan.interestRate}%</TableCell>
								<TableCell>{loan.tenureMonths}</TableCell>
								<TableCell>{loan.status}</TableCell>
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
