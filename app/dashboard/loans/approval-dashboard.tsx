"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
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
	member: {
		name: string;
	};
	approvalLogs: {
		approvalOrder: number;
		status: string;
	}[];
}

export default function LoanApprovalDashboard() {
	const [loans, setLoans] = useState<Loan[]>([]);
	const { user } = useAuth();
	const { toast } = useToast();

	useEffect(() => {
		fetchLoans();
	}, []);

	const fetchLoans = async () => {
		try {
			const response = await fetch("/api/loans/pending");
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

	const handleApprove = async (loanId: number) => {
		try {
			const response = await fetch("/api/loans/approve", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ loanId, status: "APPROVED" }),
			});

			if (response.ok) {
				toast({ title: "Loan approved successfully" });
				fetchLoans();
			} else {
				throw new Error("Failed to approve loan");
			}
		} catch (error) {
			console.error("Error approving loan:", error);
			toast({ title: "Failed to approve loan", variant: "destructive" });
		}
	};

	const handleReject = async (loanId: number) => {
		try {
			const response = await fetch("/api/loans/approve", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ loanId, status: "REJECTED" }),
			});

			if (response.ok) {
				toast({ title: "Loan rejected successfully" });
				fetchLoans();
			} else {
				throw new Error("Failed to reject loan");
			}
		} catch (error) {
			console.error("Error rejecting loan:", error);
			toast({ title: "Failed to reject loan", variant: "destructive" });
		}
	};

	const canApprove = (loan: Loan) => {
		const lastApproval = loan.approvalLogs[loan.approvalLogs.length - 1];
		return (
			(user?.role === "LOAN_OFFICER" && lastApproval.approvalOrder === 0) ||
			(user?.role === "BRANCH_MANAGER" && lastApproval.approvalOrder === 1) ||
			(user?.role === "REGIONAL_MANAGER" && lastApproval.approvalOrder === 2) ||
			(user?.role === "FINANCE_ADMIN" && lastApproval.approvalOrder === 3)
		);
	};

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">Loan Approval Dashboard</h2>
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
							<TableCell>${loan.amount.toFixed(2)}</TableCell>
							<TableCell>{loan.interestRate}%</TableCell>
							<TableCell>{loan.tenureMonths}</TableCell>
							<TableCell>{loan.status}</TableCell>
							<TableCell>
								{canApprove(loan) && (
									<>
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
									</>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
