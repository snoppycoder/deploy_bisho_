"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface PendingLoan {
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

export default function PendingLoansPage() {
	const [pendingLoans, setPendingLoans] = useState<PendingLoan[]>([]);
	const { user } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		fetchPendingLoans();
	}, []);

	const fetchPendingLoans = async () => {
		try {
			const response = await fetch("/api/loans/pending");
			if (response.ok) {
				const data = await response.json();
				setPendingLoans(data);
			} else {
				throw new Error("Failed to fetch pending loans");
			}
		} catch (error) {
			console.error("Error fetching pending loans:", error);
			toast({ title: "Failed to fetch pending loans", variant: "destructive" });
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
				fetchPendingLoans();
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
				fetchPendingLoans();
			} else {
				throw new Error("Failed to reject loan");
			}
		} catch (error) {
			console.error("Error rejecting loan:", error);
			toast({ title: "Failed to reject loan", variant: "destructive" });
		}
	};

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-4">Pending Loans</h1>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Loan ID</TableHead>
						<TableHead>Member Name</TableHead>
						<TableHead>Amount</TableHead>
						<TableHead>Interest Rate</TableHead>
						<TableHead>Tenure (Months)</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{pendingLoans.map((loan) => (
						<TableRow key={loan.id}>
							<TableCell>{loan.id}</TableCell>
							<TableCell>{loan.member.name}</TableCell>
							<TableCell>${loan.amount.toFixed(2)}</TableCell>
							<TableCell>{loan.interestRate}%</TableCell>
							<TableCell>{loan.tenureMonths}</TableCell>
							<TableCell>
								<Button onClick={() => handleApprove(loan.id)} className="mr-2">
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
		</div>
	);
}
