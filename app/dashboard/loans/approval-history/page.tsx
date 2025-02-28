"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface ApprovalLog {
	id: number;
	loanId: number;
	loanAmount: number;
	loanStatus: string;
	memberName: string;
	memberEtNumber: number;
	approvedBy: string;
	approverRole: string;
	status: string;
	approvalOrder: number;
	comments: string;
	approvalDate: string;
}

export default function ApprovalHistoryPage() {
	const [approvalLogs, setApprovalLogs] = useState<ApprovalLog[]>([]);
	const { toast } = useToast();

	useEffect(() => {
		fetchApprovalHistory();
	}, []);

	const fetchApprovalHistory = async () => {
		try {
			const response = await fetch("/api/loans/approval-history");
			if (response.ok) {
				const data = await response.json();
				setApprovalLogs(data);
			} else {
				throw new Error("Failed to fetch approval history");
			}
		} catch (error) {
			console.error("Error fetching approval history:", error);
			toast({
				title: "Failed to fetch approval history",
				variant: "destructive",
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Loan Approval History</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Loan ID</TableHead>
							<TableHead>Member</TableHead>
							<TableHead>Loan Amount</TableHead>
							<TableHead>Loan Status</TableHead>
							<TableHead>Approved By</TableHead>
							<TableHead>Approver Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Approval Order</TableHead>
							<TableHead>Comments</TableHead>
							<TableHead>Approval Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{approvalLogs.map((log) => (
							<TableRow key={log.id}>
								<TableCell>{log.loanId}</TableCell>
								<TableCell>
									{log.memberName} (ET: {log.memberEtNumber})
								</TableCell>
								<TableCell>${Number(log.loanAmount).toFixed(2)}</TableCell>
								<TableCell>{log.loanStatus}</TableCell>
								<TableCell>{log.approvedBy}</TableCell>
								<TableCell>{log.approverRole}</TableCell>
								<TableCell>{log.status}</TableCell>
								<TableCell>{log.approvalOrder}</TableCell>
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
	);
}
