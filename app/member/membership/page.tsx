"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function MembershipRequestPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		etNumber: "",
		department: "",
	});
	const router = useRouter();
	const { toast } = useToast();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await fetch("/api/membership/request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				toast({
					title: "Membership request submitted successfully",
					description: "An admin will review your request shortly.",
				});
				router.push("/member/membership");
			} else {
				throw new Error("Failed to submit membership request");
			}
		} catch (error) {
			console.error("Error submitting membership request:", error);
			toast({
				title: "Error",
				description: "Failed to submit membership request. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Membership Registration Request</CardTitle>
				<CardDescription>
					Please fill out the form below to request membership registration.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="name">Full Name</Label>
						<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div>
						<Label htmlFor="phone">Phone Number</Label>
						<Input
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div>
						<Label htmlFor="etNumber">Location</Label>
						<Input
							id="etNumber"
							name="etNumber"
							value={formData.etNumber}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div>
						<Label htmlFor="etNumber">Division</Label>
						<Input
							id="etNumber"
							name="etNumber"
							value={formData.etNumber}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div>
						<Label htmlFor="department">Department</Label>
						<Input
							id="department"
							name="department"
							value={formData.department}
							onChange={handleInputChange}
							required
						/>
					</div>
					<Button type="submit" className="w-full">
						Submit Membership Request
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
