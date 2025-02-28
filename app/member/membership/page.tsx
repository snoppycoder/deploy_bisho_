"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface MembershipRequest {
	id: number;
	type: string;
	status: string;
	createdAt: string;
}

export default function MembershipRequestsPage() {
	const [requests, setRequests] = useState<MembershipRequest[]>([]);
	const { toast } = useToast();

	useEffect(() => {
		fetchMembershipRequests();
	}, []);

	const fetchMembershipRequests = async () => {
		try {
			const response = await fetch("/api/member/membership-requests");
			if (!response.ok) {
				throw new Error("Failed to fetch membership requests");
			}
			const data = await response.json();
			setRequests(data);
		} catch (error) {
			console.error("Error fetching membership requests:", error);
			toast({
				title: "Error",
				description: "Failed to load membership requests. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleNewRequest = async () => {
		try {
			const response = await fetch("/api/member/membership-requests", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ type: "NEW_MEMBERSHIP" }),
			});

			if (!response.ok) {
				throw new Error("Failed to create new membership request");
			}

			toast({
				title: "Success",
				description: "New membership request submitted successfully.",
			});

			fetchMembershipRequests();
		} catch (error) {
			console.error("Error creating new membership request:", error);
			toast({
				title: "Error",
				description:
					"Failed to submit new membership request. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Membership Requests</h1>
			<Card>
				<CardHeader>
					<CardTitle>Your Membership Requests</CardTitle>
					<CardDescription>
						View and manage your membership requests
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Request Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{requests.map((request) => (
								<TableRow key={request.id}>
									<TableCell>{request.type}</TableCell>
									<TableCell>{request.status}</TableCell>
									<TableCell>
										{new Date(request.createdAt).toLocaleDateString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
				<CardFooter>
					<Button onClick={handleNewRequest}>New Membership Request</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
