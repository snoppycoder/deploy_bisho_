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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, FileText } from "lucide-react";
import Link from "next/link";

export default function MembershipRequestPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		etNumber: "",
		department: "",
		salary: "",
	});

	const [files, setFiles] = useState({
		signature: null as File | null,
		idCard: null as File | null,
	});

	const [termsAccepted, setTermsAccepted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		fileType: "signature" | "idCard"
	) => {
		const file = e.target.files?.[0];
		if (file) {
			setFiles((prev) => ({ ...prev, [fileType]: file }));
		}
	};

	const validateForm = () => {
		const requiredFields = [
			"name",
			"email",
			"phone",
			"etNumber",
			"department",
			"salary",
		];
		const missingFields = requiredFields.filter(
			(field) => !formData[field as keyof typeof formData]
		);

		if (missingFields.length > 0) {
			toast({
				title: "Missing Required Fields",
				description: `Please fill in: ${missingFields.join(", ")}`,
				variant: "destructive",
			});
			return false;
		}

		if (!files.signature) {
			toast({
				title: "Missing Signature",
				description: "Please upload your signature",
				variant: "destructive",
			});
			return false;
		}

		if (!files.idCard) {
			toast({
				title: "Missing ID Card",
				description: "Please upload your ID card",
				variant: "destructive",
			});
			return false;
		}

		if (!termsAccepted) {
			toast({
				title: "Terms and Conditions",
				description: "Please accept the terms and conditions to continue",
				variant: "destructive",
			});
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Create FormData for file uploads
			const submitData = new FormData();

			// Add form fields
			Object.entries(formData).forEach(([key, value]) => {
				submitData.append(key, value);
			});

			// Add files
			if (files.signature) {
				submitData.append("signature", files.signature);
			}
			if (files.idCard) {
				submitData.append("idCard", files.idCard);
			}

			submitData.append("termsAccepted", termsAccepted.toString());

			const response = await fetch("/api/membership/request", {
				method: "POST",
				body: submitData,
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
						Join ET Credit Association by submitting your membership request
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Personal Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-primary">
								Personal Information
							</h3>

							<div className="space-y-2">
								<Label htmlFor="name" className="font-medium">
									Full Name <span className="text-red-500">*</span>
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
										Email Address <span className="text-red-500">*</span>
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
										Phone Number <span className="text-red-500">*</span>
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

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="etNumber" className="font-medium">
										ET Number <span className="text-red-500">*</span>
									</Label>
									<Input
										id="etNumber"
										name="etNumber"
										value={formData.etNumber}
										onChange={handleInputChange}
										placeholder="Enter your ET number"
										className="focus:ring-2 focus:ring-primary/20"
										required
										disabled={isSubmitting}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="salary" className="font-medium">
										Monthly Salary <span className="text-red-500">*</span>
									</Label>
									<Input
										id="salary"
										name="salary"
										type="number"
										value={formData.salary}
										onChange={handleInputChange}
										placeholder="Enter your monthly salary"
										className="focus:ring-2 focus:ring-primary/20"
										required
										disabled={isSubmitting}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="department" className="font-medium">
									Department <span className="text-red-500">*</span>
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
						</div>

						{/* Document Uploads */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-primary">
								Required Documents
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="signature" className="font-medium">
										Signature <span className="text-red-500">*</span>
									</Label>
									<div className="relative">
										<Input
											id="signature"
											type="file"
											accept="image/*,.pdf"
											onChange={(e) => handleFileChange(e, "signature")}
											className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
											disabled={isSubmitting}
										/>
										{files.signature && (
											<div className="flex items-center mt-2 text-sm text-green-600">
												<FileText className="w-4 h-4 mr-1" />
												{files.signature.name}
											</div>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="idCard" className="font-medium">
										ID Card <span className="text-red-500">*</span>
									</Label>
									<div className="relative">
										<Input
											id="idCard"
											type="file"
											accept="image/*,.pdf"
											onChange={(e) => handleFileChange(e, "idCard")}
											className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
											disabled={isSubmitting}
										/>
										{files.idCard && (
											<div className="flex items-center mt-2 text-sm text-green-600">
												<FileText className="w-4 h-4 mr-1" />
												{files.idCard.name}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Terms and Conditions */}
						<div className="space-y-4">
							<div className="flex items-start space-x-2">
								<Checkbox
									id="terms"
									checked={termsAccepted}
									onCheckedChange={(checked) =>
										setTermsAccepted(checked as boolean)
									}
									disabled={isSubmitting}
								/>
								<div className="grid gap-1.5 leading-none">
									<Label
										htmlFor="terms"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										I agree to the{" "}
										<Link
											href="/membership/terms-and-conditions"
											className="text-primary hover:underline"
											target="_blank">
											Terms and Conditions
										</Link>{" "}
										<span className="text-red-500">*</span>
									</Label>
									<p className="text-xs text-muted-foreground">
										You must accept the terms and conditions to proceed with
										your membership application.
									</p>
								</div>
							</div>
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
						All fields marked with <span className="text-red-500">*</span> are
						mandatory. Your request will be reviewed by our administrators.
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
// import { useToast } from "@/hooks/use-toast";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Loader2 } from "lucide-react";

// export default function MembershipRequestPage() {
// 	const [formData, setFormData] = useState({
// 		name: "",
// 		email: "",
// 		phone: "",
// 		etNumber: "",
// 		department: "",
// 	});
// 	const [isSubmitting, setIsSubmitting] = useState(false);
// 	const router = useRouter();
// 	const { toast } = useToast();

// 	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const { name, value } = e.target;
// 		setFormData((prev) => ({ ...prev, [name]: value }));
// 	};

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setIsSubmitting(true);

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
// 					title: "Success!",
// 					description:
// 						"Your membership request has been submitted successfully.",
// 					variant: "default",
// 				});

// 				router.push("/");
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
// 		} finally {
// 			setIsSubmitting(false);
// 		}
// 	};

// 	return (
// 		<div className="container mx-auto py-10 px-4">
// 			<Card className="max-w-2xl mx-auto shadow-lg border-t-4 border-t-primary">
// 				<CardHeader className="space-y-1 text-center">
// 					<CardTitle className="text-2xl font-bold">
// 						Membership Registration
// 					</CardTitle>
// 					<CardDescription className="text-muted-foreground">
// 						Join our microfinance community by submitting your membership
// 						request
// 					</CardDescription>
// 				</CardHeader>

// 				<CardContent>
// 					<form onSubmit={handleSubmit} className="space-y-4">
// 						<div className="space-y-2">
// 							<Label htmlFor="name" className="font-medium">
// 								Full Name
// 							</Label>
// 							<Input
// 								id="name"
// 								name="name"
// 								value={formData.name}
// 								onChange={handleInputChange}
// 								placeholder="Enter your full name"
// 								className="focus:ring-2 focus:ring-primary/20"
// 								required
// 								disabled={isSubmitting}
// 							/>
// 						</div>

// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<div className="space-y-2">
// 								<Label htmlFor="email" className="font-medium">
// 									Email Address
// 								</Label>
// 								<Input
// 									id="email"
// 									name="email"
// 									type="email"
// 									value={formData.email}
// 									onChange={handleInputChange}
// 									placeholder="your.email@example.com"
// 									className="focus:ring-2 focus:ring-primary/20"
// 									required
// 									disabled={isSubmitting}
// 								/>
// 							</div>

// 							<div className="space-y-2">
// 								<Label htmlFor="phone" className="font-medium">
// 									Phone Number
// 								</Label>
// 								<Input
// 									id="phone"
// 									name="phone"
// 									value={formData.phone}
// 									onChange={handleInputChange}
// 									placeholder="Enter your phone number"
// 									className="focus:ring-2 focus:ring-primary/20"
// 									required
// 									disabled={isSubmitting}
// 								/>
// 							</div>
// 						</div>

// 						<div className="space-y-2">
// 							<Label htmlFor="etNumber" className="font-medium">
// 								Location
// 							</Label>
// 							<Input
// 								id="etNumber"
// 								name="etNumber"
// 								value={formData.etNumber}
// 								onChange={handleInputChange}
// 								placeholder="Enter your location"
// 								className="focus:ring-2 focus:ring-primary/20"
// 								required
// 								disabled={isSubmitting}
// 							/>
// 						</div>

// 						<div className="space-y-2">
// 							<Label htmlFor="department" className="font-medium">
// 								Department
// 							</Label>
// 							<Input
// 								id="department"
// 								name="department"
// 								value={formData.department}
// 								onChange={handleInputChange}
// 								placeholder="Enter your department"
// 								className="focus:ring-2 focus:ring-primary/20"
// 								required
// 								disabled={isSubmitting}
// 							/>
// 						</div>
// 					</form>
// 				</CardContent>

// 				<CardFooter className="flex flex-col space-y-2">
// 					<Button
// 						type="submit"
// 						className="w-full h-11 text-base font-medium transition-all"
// 						onClick={handleSubmit}
// 						disabled={isSubmitting}>
// 						{isSubmitting ? (
// 							<>
// 								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 								Submitting...
// 							</>
// 						) : (
// 							"Submit Membership Request"
// 						)}
// 					</Button>

// 					<p className="text-xs text-center text-muted-foreground mt-4">
// 						By submitting this form, you agree to our terms and conditions. Your
// 						request will be reviewed by our administrators.
// 					</p>
// 				</CardFooter>
// 			</Card>
// 		</div>
// 	);
// }
