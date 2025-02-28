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
import { Input } from "@/components/ui/input";
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

export default function LoanApprovePage() {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [comments, setComments] = useState<{ [key: number]: string }>({});
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		fetchPendingLoans();
	}, []);

	const fetchPendingLoans = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/loans/pending");
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
				throw new Error("Failed to fetch pending loans");
			}
		} catch (error) {
			console.error("Error fetching pending loans:", error);
			toast({ title: "Failed to fetch pending loans", variant: "destructive" });
		} finally {
			setIsLoading(false);
		}
	};

	const handleApprove = async (loanId: number) => {
		await handleLoanAction(loanId, "APPROVED");
	};

	const handleReject = async (loanId: number) => {
		await handleLoanAction(loanId, "REJECTED");
	};

	const handleLoanAction = async (
		loanId: number,
		action: "APPROVED" | "REJECTED"
	) => {
		try {
			const response = await fetch("/api/loans/approve", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					loanId,
					status: action,
					comments: comments[loanId] || "",
				}),
			});

			if (response.ok) {
				toast({ title: `Loan ${action.toLowerCase()} successfully` });
				fetchPendingLoans();
				setComments((prev) => ({ ...prev, [loanId]: "" }));
			} else {
				throw new Error(`Failed to ${action.toLowerCase()} loan`);
			}
		} catch (error) {
			console.error(`Error ${action.toLowerCase()}ing loan:`, error);
			toast({
				title: `Failed to ${action.toLowerCase()} loan`,
				variant: "destructive",
			});
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
				<CardTitle>Loan Approval</CardTitle>
			</CardHeader>
			<CardContent>
				{loans.length === 0 ? (
					<p>No pending loans to approve.</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Loan ID</TableHead>
								<TableHead>Member Name</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Interest Rate</TableHead>
								<TableHead>Tenure (Months)</TableHead>
								<TableHead>Comments</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loans.map((loan) => (
								<TableRow key={loan.id}>
									<TableCell>{loan.id}</TableCell>
									<TableCell>{loan.member.name}</TableCell>
									<TableCell>${loan.amount.toFixed(2)}</TableCell>
									<TableCell>{loan.interestRate}%</TableCell>
									<TableCell>{loan.tenureMonths}</TableCell>
									<TableCell>
										<Input
											value={comments[loan.id] || ""}
											onChange={(e) =>
												setComments((prev) => ({
													...prev,
													[loan.id]: e.target.value,
												}))
											}
											placeholder="Enter comments"
										/>
									</TableCell>
									<TableCell>
										<Button
											onClick={() => handleApprove(loan.id)}
											className="mr-2">
											Approve
										</Button>
										<Button
											onClick={() => handleReject(loan.id)}
											variant="destructive">
											Reject
										</Button>
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
