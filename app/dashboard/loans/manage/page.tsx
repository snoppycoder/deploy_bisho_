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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-provider";

interface Loan {
	id: number;
	memberId: number;
	amount: number;
	interestRate: number;
	tenureMonths: number;
	status: string;
	member: {
		name: string;
	};
}

export default function LoanManagementPage() {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		fetchLoans();
	}, []);

	const fetchLoans = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/loans");
			if (response.ok) {
				const data = await response.json();
				setLoans(data);
			} else if (response.status === 401) {
				toast({
					title: "Unauthorized",
					description: "You don't have permission to view this page.",
					variant: "destructive",
				});
				router.push("/dashboard");
			} else {
				throw new Error("Failed to fetch loans");
			}
		} catch (error) {
			console.error("Error fetching loans:", error);
			toast({ title: "Failed to fetch loans", variant: "destructive" });
		} finally {
			setIsLoading(false);
		}
	};

	const handleStatusChange = async (loanId: number, newStatus: string) => {
		try {
			const response = await fetch(`/api/loans/${loanId}/status`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (response.ok) {
				toast({ title: "Loan status updated successfully" });
				fetchLoans();
			} else {
				throw new Error("Failed to update loan status");
			}
		} catch (error) {
			console.error("Error updating loan status:", error);
			toast({ title: "Failed to update loan status", variant: "destructive" });
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (
		!user ||
		![
			"LOAN_OFFICER",
			"BRANCH_MANAGER",
			"REGIONAL_MANAGER",
			"FINANCE_ADMIN",
		].includes(user.role)
	) {
		return <div>You don't have permission to view this page.</div>;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Loan Management</CardTitle>
			</CardHeader>
			<CardContent>
				{loans.length === 0 ? (
					<p>No loans found.</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Loan ID</TableHead>
								<TableHead>Member Name</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Interest Rate</TableHead>
								<TableHead>Tenure (Months)</TableHead>
								<TableHead>Status</TableHead>
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
										<Select
											onValueChange={(value) =>
												handleStatusChange(loan.id, value)
											}
											defaultValue={loan.status}>
											<SelectTrigger className="w-[180px]">
												<SelectValue placeholder="Change status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="PENDING">Pending</SelectItem>
												<SelectItem value="APPROVED">Approved</SelectItem>
												<SelectItem value="REJECTED">Rejected</SelectItem>
												<SelectItem value="DISBURSED">Disbursed</SelectItem>
												<SelectItem value="ACTIVE">Active</SelectItem>
												<SelectItem value="CLOSED">Closed</SelectItem>
											</SelectContent>
										</Select>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
