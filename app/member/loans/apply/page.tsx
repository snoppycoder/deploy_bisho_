"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
	amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
		message: "Amount must be a positive number",
	}),
	interestRate: z
		.string()
		.refine(
			(val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 30,
			{
				message: "Interest rate must be between 0.1 and 30",
			}
		),
	tenureMonths: z
		.string()
		.refine(
			(val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 60,
			{
				message: "Tenure must be between 1 and 60 months",
			}
		),
	remarks: z.string().max(500, "Remarks must not exceed 500 characters"),
});

export default function LoanApplicationPage() {
	const [file, setFile] = useState<File | null>(null);
	const { user } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: "",
			interestRate: "",
			tenureMonths: "",
			remarks: "",
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!file) {
			toast({
				title: "Please upload the loan agreement form",
				variant: "destructive",
			});
			return;
		}

		const formData = new FormData();
		formData.append("amount", values.amount);
		formData.append("interestRate", values.interestRate);
		formData.append("tenureMonths", values.tenureMonths);
		formData.append("remarks", values.remarks);
		formData.append("agreement", file);

		try {
			const response = await fetch("/api/loans/apply", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				toast({ title: "Loan application submitted successfully" });
				router.push("/member/loans");
			} else {
				throw new Error("Failed to submit loan application");
			}
		} catch (error) {
			console.error("Error submitting loan application:", error);
			toast({
				title: "Failed to submit loan application",
				variant: "destructive",
			});
		}
	};

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Apply for a Loan</CardTitle>
				<CardDescription>
					Fill out the form below to submit your loan application
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Loan Amount</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="Enter loan amount"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Enter the amount you wish to borrow
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="interestRate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Interest Rate (%)</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.1"
											placeholder="Enter interest rate"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Enter the annual interest rate
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="tenureMonths"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Loan Tenure (months)</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="Enter loan tenure"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Enter the loan repayment period in months
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="remarks"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Remarks</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter loan purpose or additional information"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Specify the reason for the loan (max 500 characters)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormItem>
							<FormLabel>Loan Agreement Form</FormLabel>
							<FormControl>
								<Input
									type="file"
									onChange={handleFileChange}
									accept=".pdf,.doc,.docx"
								/>
							</FormControl>
							<FormDescription>
								Upload the signed loan agreement form (PDF or Word document)
							</FormDescription>
						</FormItem>
						<Button type="submit">Submit Loan Application</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
} // "use client";

// import type React from "react";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/auth-provider";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/components/ui/use-toast";

// export default function LoanApplicationPage() {
// 	const [amount, setAmount] = useState("");
// 	const [interestRate, setInterestRate] = useState("");
// 	const [tenureMonths, setTenureMonths] = useState("");
// 	const { user } = useAuth();
// 	const router = useRouter();
// 	const { toast } = useToast();

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		try {
// 			const response = await fetch("/api/loans/apply", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({ amount, interestRate, tenureMonths }),
// 			});

// 			if (response.ok) {
// 				toast({ title: "Loan application submitted successfully" });
// 				router.push("/member/loans");
// 			} else {
// 				throw new Error("Failed to submit loan application");
// 			}
// 		} catch (error) {
// 			console.error("Error submitting loan application:", error);
// 			toast({
// 				title: "Failed to submit loan application",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	return (
// 		<div className="max-w-md mx-auto mt-8">
// 			<h1 className="text-2xl font-bold mb-4">Apply for a Loan</h1>
// 			<form onSubmit={handleSubmit} className="space-y-4">
// 				<div>
// 					<label
// 						htmlFor="amount"
// 						className="block text-sm font-medium text-gray-700">
// 						Loan Amount
// 					</label>
// 					<Input
// 						type="number"
// 						id="amount"
// 						value={amount}
// 						onChange={(e) => setAmount(e.target.value)}
// 						required
// 					/>
// 				</div>
// 				<div>
// 					<label
// 						htmlFor="interestRate"
// 						className="block text-sm font-medium text-gray-700">
// 						Interest Rate (%)
// 					</label>
// 					<Input
// 						type="number"
// 						id="interestRate"
// 						value={interestRate}
// 						onChange={(e) => setInterestRate(e.target.value)}
// 						required
// 					/>
// 				</div>
// 				<div>
// 					<label
// 						htmlFor="tenureMonths"
// 						className="block text-sm font-medium text-gray-700">
// 						Loan Tenure (months)
// 					</label>
// 					<Input
// 						type="number"
// 						id="tenureMonths"
// 						value={tenureMonths}
// 						onChange={(e) => setTenureMonths(e.target.value)}
// 						required
// 					/>
// 				</div>
// 				<Button type="submit">Submit Loan Application</Button>
// 			</form>
// 		</div>
// 	);
// }
