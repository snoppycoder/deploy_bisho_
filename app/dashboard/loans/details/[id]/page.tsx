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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
		email: string;
		phone: string;
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
	loanDocuments: Array<{
		id: number;
		documentType: string;
		documentUrl: string;
		fileName: string;
		uploadDate: string;
	}>;
}

export default function IndividualLoanDetailPage() {
	const [loanDetail, setLoanDetail] = useState<LoanDetail | null>(null);
	const [newStatus, setNewStatus] = useState<string>("");
	const [comments, setComments] = useState<string>("");
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
	const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
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

	const getStatusColor = (status: string) => {
		return "bg-yellow-500";
		// switch (status.toLowerCase()) {
		// 	case "pending":
		// 		return "bg-yellow-500";
		// 	case "approved":
		// 		return "bg-green-500";
		// 	case "rejected":
		// 		return "bg-red-500";
		// 	case "disbursed":
		// 		return "bg-blue-500";
		// 	default:
		// 		return "bg-gray-500";
		// }
	};

	if (!loanDetail) {
		return <div>Loading...</div>;
	}

	const renderRepaymentSchedule = () => (
		<Card>
			<CardHeader>
				<CardTitle>Repayment Schedule</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Due Date</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loanDetail.loanRepayments.map((repayment) => (
							<TableRow key={repayment.id}>
								<TableCell>
									{new Date(repayment.repaymentDate).toLocaleDateString()}
								</TableCell>
								<TableCell>ETB {Number(repayment.amount).toFixed(2)}</TableCell>
								<TableCell>
									<Badge className={getStatusColor(repayment.status)}>
										{repayment.status}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);

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
							<h3 className="font-semibold">Email</h3>
							<p>{loanDetail.member.email}</p>
						</div>
						<div>
							<h3 className="font-semibold">Phone</h3>
							<p>{loanDetail.member.phone}</p>
						</div>
						<div>
							<h3 className="font-semibold">Loan Amount</h3>
							<p>ETB {Number(loanDetail.amount).toFixed(2)}</p>
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
							<Badge className={getStatusColor(loanDetail.status)}>
								{loanDetail.status}
							</Badge>
						</div>
						<div>
							<h3 className="font-semibold">Created At</h3>
							<p>{new Date(loanDetail.createdAt).toLocaleString()}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Loan Documents</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Document Type</TableHead>
								<TableHead>File Name</TableHead>
								<TableHead>Upload Date</TableHead>
								<TableHead>Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loanDetail.loanDocuments.map((doc) => (
								<TableRow key={doc.id}>
									<TableCell>{doc.documentType}</TableCell>
									<TableCell>{doc.fileName}</TableCell>
									<TableCell>
										{new Date(doc.uploadDate).toLocaleString()}
									</TableCell>
									<TableCell>
										<Button
											onClick={() => setSelectedDocument(doc.documentUrl)}>
											View
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Dialog
				open={!!selectedDocument}
				onOpenChange={() => setSelectedDocument(null)}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Document Viewer</DialogTitle>
					</DialogHeader>
					{selectedDocument && (
						<iframe
							src={selectedDocument}
							className="w-full h-[600px]"
							title="Document Viewer"></iframe>
					)}
				</DialogContent>
			</Dialog>

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
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Approved By</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Comments</TableHead>
								<TableHead>Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loanDetail.approvalLogs.map((log) => (
								<TableRow key={log.id}>
									<TableCell>{log.user.name}</TableCell>
									<TableCell>{log.role}</TableCell>
									<TableCell>
										<Badge className={getStatusColor(log.status)}>
											{log.status}
										</Badge>
									</TableCell>
									<TableCell>{log.comments}</TableCell>
									<TableCell>
										{new Date(log.approvalDate).toLocaleString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{renderRepaymentSchedule()}
		</div>
	);
}
