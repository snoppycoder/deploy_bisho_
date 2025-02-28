"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function LoanApplicationPage() {
	const [amount, setAmount] = useState("");
	const [interestRate, setInterestRate] = useState("");
	const [tenureMonths, setTenureMonths] = useState("");
	const { user } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await fetch("/api/loans/apply", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount, interestRate, tenureMonths }),
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
		<div className="max-w-md mx-auto mt-8">
			<h1 className="text-2xl font-bold mb-4">Apply for a Loan</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="amount"
						className="block text-sm font-medium text-gray-700">
						Loan Amount
					</label>
					<Input
						type="number"
						id="amount"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						required
					/>
				</div>
				<div>
					<label
						htmlFor="interestRate"
						className="block text-sm font-medium text-gray-700">
						Interest Rate (%)
					</label>
					<Input
						type="number"
						id="interestRate"
						value={interestRate}
						onChange={(e) => setInterestRate(e.target.value)}
						required
					/>
				</div>
				<div>
					<label
						htmlFor="tenureMonths"
						className="block text-sm font-medium text-gray-700">
						Loan Tenure (months)
					</label>
					<Input
						type="number"
						id="tenureMonths"
						value={tenureMonths}
						onChange={(e) => setTenureMonths(e.target.value)}
						required
					/>
				</div>
				<Button type="submit">Submit Loan Application</Button>
			</form>
		</div>
	);
}
