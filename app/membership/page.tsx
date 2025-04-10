"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function MembershipRequestPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		etNumber: "",
		department: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

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
					title: "Success!",
					description:
						"Your membership request has been submitted successfully.",
					variant: "default",
				});

				router.push("/");
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
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto py-10 px-4">
			<Card className="max-w-2xl mx-auto shadow-lg border-t-4 border-t-primary">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold">
						Membership Registration
					</CardTitle>
					<CardDescription className="text-muted-foreground">
						Join our microfinance community by submitting your membership
						request
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name" className="font-medium">
								Full Name
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								placeholder="Enter your full name"
								className="focus:ring-2 focus:ring-primary/20"
								required
								disabled={isSubmitting}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="font-medium">
									Email Address
								</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="your.email@example.com"
									className="focus:ring-2 focus:ring-primary/20"
									required
									disabled={isSubmitting}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone" className="font-medium">
									Phone Number
								</Label>
								<Input
									id="phone"
									name="phone"
									value={formData.phone}
									onChange={handleInputChange}
									placeholder="Enter your phone number"
									className="focus:ring-2 focus:ring-primary/20"
									required
									disabled={isSubmitting}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="etNumber" className="font-medium">
								Location
							</Label>
							<Input
								id="etNumber"
								name="etNumber"
								value={formData.etNumber}
								onChange={handleInputChange}
								placeholder="Enter your location"
								className="focus:ring-2 focus:ring-primary/20"
								required
								disabled={isSubmitting}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="department" className="font-medium">
								Department
							</Label>
							<Input
								id="department"
								name="department"
								value={formData.department}
								onChange={handleInputChange}
								placeholder="Enter your department"
								className="focus:ring-2 focus:ring-primary/20"
								required
								disabled={isSubmitting}
							/>
						</div>
					</form>
				</CardContent>

				<CardFooter className="flex flex-col space-y-2">
					<Button
						type="submit"
						className="w-full h-11 text-base font-medium transition-all"
						onClick={handleSubmit}
						disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Submitting...
							</>
						) : (
							"Submit Membership Request"
						)}
					</Button>

					<p className="text-xs text-center text-muted-foreground mt-4">
						By submitting this form, you agree to our terms and conditions. Your
						request will be reviewed by our administrators.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
// "use client";

// import type React from "react";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/components/ui/use-toast";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";

// export default function MembershipRequestPage() {
// 	const [formData, setFormData] = useState({
// 		name: "",
// 		email: "",
// 		phone: "",
// 		etNumber: "",
// 		department: "",
// 	});
// 	const router = useRouter();
// 	const { toast } = useToast();

// 	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const { name, value } = e.target;
// 		setFormData((prev) => ({ ...prev, [name]: value }));
// 	};

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		try {
// 			const response = await fetch("/api/membership/request", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify(formData),
// 			});

// 			if (response.ok) {
// 				toast({
// 					title: "Membership request submitted successfully",
// 					description: "An admin will review your request shortly.",
// 				});
// 				router.push("/member/membership");
// 			} else {
// 				throw new Error("Failed to submit membership request");
// 			}
// 		} catch (error) {
// 			console.error("Error submitting membership request:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to submit membership request. Please try again.",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	return (
// 		<Card className="max-w-2xl mx-auto mt-20">
// 			<CardHeader>
// 				<CardTitle>Membership Registration Request</CardTitle>
// 				<CardDescription>
// 					Please fill out the form below to request membership registration.
// 				</CardDescription>
// 			</CardHeader>
// 			<CardContent>
// 				<form onSubmit={handleSubmit} className="space-y-4">
// 					<div>
// 						<Label htmlFor="name">Full Name</Label>
// 						<Input
// 							id="name"
// 							name="name"
// 							value={formData.name}
// 							onChange={handleInputChange}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="email">Email</Label>
// 						<Input
// 							id="email"
// 							name="email"
// 							type="email"
// 							value={formData.email}
// 							onChange={handleInputChange}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="phone">Phone Number</Label>
// 						<Input
// 							id="phone"
// 							name="phone"
// 							value={formData.phone}
// 							onChange={handleInputChange}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="etNumber">Location</Label>
// 						<Input
// 							id="etNumber"
// 							name="etNumber"
// 							value={formData.etNumber}
// 							onChange={handleInputChange}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="etNumber">Division</Label>
// 						<Input
// 							id="etNumber"
// 							name="etNumber"
// 							value={formData.etNumber}
// 							onChange={handleInputChange}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="department">Department</Label>
// 						<Input
// 							id="department"
// 							name="department"
// 							value={formData.department}
// 							onChange={handleInputChange}
// 							required
// 						/>
// 					</div>
// 					<Button type="submit" className="w-full">
// 						Submit Membership Request
// 					</Button>
// 				</form>
// 			</CardContent>
// 		</Card>
// 	);
// }
