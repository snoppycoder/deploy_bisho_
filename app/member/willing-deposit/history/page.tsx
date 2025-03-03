"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface WillingDepositRequest {
	id: string;
	amount: number;
	reason: string;
	status: "PENDING" | "APPROVED" | "REJECTED";
	createdAt: string;
}

export default function WillingDepositHistoryPage() {
	const [requests, setRequests] = useState<WillingDepositRequest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		const fetchRequests = async () => {
			try {
				const response = await fetch(
					`/api/willing-deposit/requests?memberId=${user?.id}`
				);
				if (response.ok) {
					const data = await response.json();
					setRequests(data);
				} else {
					throw new Error("Failed to fetch requests");
				}
			} catch (error) {
				console.error("Error fetching willing deposit requests:", error);
				toast({
					title: "Error",
					description:
						"Failed to load your willing deposit requests. Please try again.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		if (user?.id) {
			fetchRequests();
		}
	}, [user, toast]);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return <Badge variant="outline">Pending</Badge>;
			case "APPROVED":
				return <Badge variant="default">Approved</Badge>;
			case "REJECTED":
				return <Badge variant="destructive">Rejected</Badge>;
			default:
				return <Badge variant="secondary">Unknown</Badge>;
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold flex items-center">
						<PiggyBank className="mr-2" /> Willing Deposit Request History
					</CardTitle>
				</CardHeader>
				<CardContent>
					{requests.length === 0 ? (
						<p>You haven't made any willing deposit requests yet.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Amount (ETB)</TableHead>
									<TableHead>Reason</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{requests.map((request) => (
									<TableRow key={request.id}>
										<TableCell>
											{new Date(request.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell>{request.amount.toFixed(2)}</TableCell>
										<TableCell>{request.reason}</TableCell>
										<TableCell>{getStatusBadge(request.status)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
			<div className="mt-4">
				<Button
					variant="outline"
					onClick={() => router.push("/member/willing-deposit/request")}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Willing Deposit Request
				</Button>
			</div>
		</div>
	);
}
