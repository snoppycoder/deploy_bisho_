"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MembershipRequest {
	id: number;
	name: string;
	email: string;
	phone: string;
	etNumber: number;
	department: string;
	status: string;
	createdAt: string;
}

export default function MembershipRequestsReviewPage() {
	const [requests, setRequests] = useState<MembershipRequest[]>([]);
	const [selectedRequest, setSelectedRequest] =
		useState<MembershipRequest | null>(null);
	const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
	const [memberNumber, setMemberNumber] = useState("");
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		fetchMembershipRequests();
	}, []);

	const fetchMembershipRequests = async () => {
		try {
			const response = await fetch("/api/membership/requests");
			if (response.ok) {
				const data = await response.json();
				setRequests(data);
			} else {
				throw new Error("Failed to fetch membership requests");
			}
		} catch (error) {
			console.error("Error fetching membership requests:", error);
			toast({
				title: "Error",
				description: "Failed to load membership requests. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleStatusUpdate = async (id: number, newStatus: string) => {
		try {
			const response = await fetch(`/api/membership/requests/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (response.ok) {
				toast({
					title: "Status updated successfully",
					description: `Membership request status updated to ${newStatus}.`,
				});
				fetchMembershipRequests(); // Refresh the list
				if (newStatus === "APPROVED") {
					const updatedRequest = requests.find((req) => req.id === id);
					if (updatedRequest) {
						setSelectedRequest(updatedRequest);
						setIsManageDialogOpen(true);
					}
				}
			} else {
				throw new Error("Failed to update membership request status");
			}
		} catch (error) {
			console.error("Error updating membership request status:", error);
			toast({
				title: "Error",
				description: "Failed to update status. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleCreateMember = async () => {
		if (!selectedRequest) return;

		try {
			const response = await fetch("/api/members", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: selectedRequest.name,
					email: selectedRequest.email,
					phone: selectedRequest.phone,
					// etNumber: selectedRequest.etNumber,
					department: selectedRequest.department,
					memberNumber: Number.parseInt(memberNumber),
				}),
			});

			if (response.ok) {
				toast({
					title: "Member created successfully",
					description: "The new member has been added to the system.",
				});
				setIsManageDialogOpen(false);
				fetchMembershipRequests(); // Refresh the list
			} else {
				throw new Error("Failed to create member");
			}
		} catch (error) {
			console.error("Error creating member:", error);
			toast({
				title: "Error",
				description: "Failed to create member. Please try again.",
				variant: "destructive",
			});
		}
	};

	const getStatusBadge = (status: string) => {
		const statusColors: { [key: string]: string } = {
			PENDING: "bg-yellow-500",
			APPROVED: "bg-green-500",
			REJECTED: "bg-red-500",
		};

		return (
			<Badge className={`${statusColors[status] || "bg-gray-500"}`}>
				{status}
			</Badge>
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Membership Requests Review</CardTitle>
				<CardDescription>
					Review and manage pending membership requests.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
							{/* <TableHead>ET Number</TableHead> */}
							<TableHead>Department</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{requests.map((request) => (
							<TableRow key={request.id}>
								<TableCell>{request.name}</TableCell>
								<TableCell>{request.email}</TableCell>
								<TableCell>{request.phone}</TableCell>
								{/* <TableCell>{request.etNumber}</TableCell> */}
								<TableCell>{request.department}</TableCell>
								<TableCell>{getStatusBadge(request.status)}</TableCell>
								<TableCell>
									{new Date(request.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									{request.status === "PENDING" && (
										<>
											<Button
												onClick={() =>
													handleStatusUpdate(request.id, "APPROVED")
												}
												className="mr-2">
												Approve
											</Button>
											<Button
												onClick={() =>
													handleStatusUpdate(request.id, "REJECTED")
												}
												variant="destructive">
												Reject
											</Button>
										</>
									)}
									{request.status === "APPROVED" && (
										<Button
											onClick={() => {
												setSelectedRequest(request);
												setIsManageDialogOpen(true);
											}}>
											Manage
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>

			<Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Manage Approved Member</DialogTitle>
						<DialogDescription>
							Create a new member account for the approved request.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="memberNumber" className="text-right">
								Member Number
							</Label>
							<Input
								id="memberNumber"
								value={memberNumber}
								onChange={(e) => setMemberNumber(e.target.value)}
								className="col-span-3"
							/>
						</div>
					</div>
					<div className="flex justify-end">
						<Button onClick={handleCreateMember}>Create Member</Button>
					</div>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
