"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-provider";

interface LoanDetail {
	id: number;
	memberId: number;
	amount: number;
	interestRate: number;
	tenureMonths: number;
	status: string;
	createdAt: string;
	member: {
		name: string;
		etNumber: number;
	};
	approvalLogs: Array<{
		id: number;
		approvedByUserId: number;
		role: string;
		status: string;
		approvalOrder: number;
		comments: string;
		approvalDate: string;
		user: {
			name: string;
		};
	}>;
	loanRepayments: Array<{
		id: number;
		amount: number;
		repaymentDate: string;
		status: string;
	}>;
}

export default function IndividualLoanDetailPage() {
	const [loanDetail, setLoanDetail] = useState<LoanDetail | null>(null);
	const [newStatus, setNewStatus] = useState<string>("");
	const [comments, setComments] = useState<string>("");
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const { user } = useAuth();

	useEffect(() => {
		fetchLoanDetail();
	}, []);

	const fetchLoanDetail = async () => {
		try {
			const response = await fetch(`/api/loans/${params.id}`);
			if (response.ok) {
				const data = await response.json();
				setLoanDetail(data);
			} else {
				throw new Error("Failed to fetch loan detail");
			}
		} catch (error) {
			console.error("Error fetching loan detail:", error);
			toast({ title: "Failed to fetch loan detail", variant: "destructive" });
		}
	};

	const handleStatusUpdate = async () => {
		try {
			const response = await fetch(`/api/loans/${params.id}/update-status`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					status: newStatus,
					comments: comments,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast({
					title: "Loan status updated successfully",
					description:
						user?.role === "FINANCE_ADMIN" && newStatus === "APPROVED"
							? "The loan has been approved and disbursed."
							: `The loan status has been updated to ${newStatus}.`,
				});
				setIsUpdateDialogOpen(false);
				fetchLoanDetail(); // Refresh the loan details
			} else {
				throw new Error(data.error || "Failed to update loan status");
			}
		} catch (error) {
			console.error("Error updating loan status:", error);
			toast({
				title: "Failed to update loan status",
				description: (error as Error).message,
				variant: "destructive",
			});
		}
	};

	if (!loanDetail) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-6">
			<Button onClick={() => router.back()} variant="outline">
				Back to Loan List
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>Loan Details - Loan ID: {loanDetail.id}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<h3 className="font-semibold">Member Name</h3>
							<p>{loanDetail.member.name}</p>
						</div>
						<div>
							<h3 className="font-semibold">ET Number</h3>
							<p>{loanDetail.member.etNumber}</p>
						</div>
						<div>
							<h3 className="font-semibold">Loan Amount</h3>
							<p>${Number(loanDetail.amount).toFixed(2)}</p>
						</div>
						<div>
							<h3 className="font-semibold">Interest Rate</h3>
							<p>{loanDetail.interestRate}%</p>
						</div>
						<div>
							<h3 className="font-semibold">Tenure</h3>
							<p>{loanDetail.tenureMonths} months</p>
						</div>
						<div>
							<h3 className="font-semibold">Status</h3>
							<p>{loanDetail.status}</p>
						</div>
						<div>
							<h3 className="font-semibold">Created At</h3>
							<p>{new Date(loanDetail.createdAt).toLocaleString()}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
				<DialogTrigger asChild>
					<Button>Update Loan Status</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Loan Status</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<Select onValueChange={setNewStatus}>
							<SelectTrigger>
								<SelectValue placeholder="Select new status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PENDING">Pending</SelectItem>
								<SelectItem value="APPROVED">Approved</SelectItem>
								<SelectItem value="REJECTED">Rejected</SelectItem>
								<SelectItem value="DISBURSED">Disbursed</SelectItem>
							</SelectContent>
						</Select>
						<Textarea
							placeholder="Enter comments"
							value={comments}
							onChange={(e) => setComments(e.target.value)}
						/>
						<Button onClick={handleStatusUpdate}>Update Status</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Card>
				<CardHeader>
					<CardTitle>Approval Logs</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-4">
						{loanDetail.approvalLogs.map((log) => (
							<li key={log.id} className="border-b pb-2">
								<p>
									<strong>Approved By:</strong> {log.user.name}
								</p>
								<p>
									<strong>Role:</strong> {log.role}
								</p>
								<p>
									<strong>Status:</strong> {log.status}
								</p>
								<p>
									<strong>Comments:</strong> {log.comments}
								</p>
								<p>
									<strong>Date:</strong>{" "}
									{new Date(log.approvalDate).toLocaleString()}
								</p>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Repayment Schedule</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-4">
						{loanDetail.loanRepayments.map((repayment) => (
							<li key={repayment.id} className="border-b pb-2">
								<p>
									<strong>Amount:</strong> $
									{Number(repayment.amount).toFixed(2)}
								</p>
								<p>
									<strong>Due Date:</strong>{" "}
									{new Date(repayment.repaymentDate).toLocaleDateString()}
								</p>
								<p>
									<strong>Status:</strong> {repayment.status}
								</p>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
