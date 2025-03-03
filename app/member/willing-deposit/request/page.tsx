"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, PiggyBank, ArrowRight, CheckCircle } from "lucide-react";

export default function WillingDepositRequestPage() {
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const router = useRouter();
	const { user } = useAuth();
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/willing-deposit/request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: Number.parseFloat(amount),
					reason,
					paymentMethod,
					memberId: user?.id,
				}),
			});

			if (response.ok) {
				setIsSuccess(true);
				toast({
					title: "Request Submitted",
					description:
						"Your willing deposit request has been submitted successfully.",
					variant: "default",
				});
			} else {
				throw new Error("Failed to submit request");
			}
		} catch (error) {
			console.error("Error submitting willing deposit request:", error);
			toast({
				title: "Submission Failed",
				description:
					"There was an error submitting your request. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSuccess) {
		return (
			<Card className="max-w-md mx-auto mt-10">
				<CardHeader>
					<CardTitle className="text-center">
						<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
						Request Submitted Successfully
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center text-muted-foreground">
						Your willing deposit request has been submitted and is pending
						approval.
					</p>
				</CardContent>
				<CardFooter className="flex justify-center">
					<Button onClick={() => router.push("/member/dashboard")}>
						Return to Dashboard
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle className="text-2xl font-bold flex items-center">
						<PiggyBank className="mr-2" /> Willing Deposit Request
					</CardTitle>
					<CardDescription>
						Submit a request to make a willing deposit to your account.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="amount">Deposit Amount (ETB)</Label>
							<Input
								id="amount"
								type="number"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="Enter amount"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="reason">Reason for Deposit</Label>
							<Textarea
								id="reason"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								placeholder="Briefly explain the reason for this deposit"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="paymentMethod">Preferred Payment Method</Label>
							<Select value={paymentMethod} onValueChange={setPaymentMethod}>
								<SelectTrigger>
									<SelectValue placeholder="Select payment method" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
									<SelectItem value="cash">Cash</SelectItem>
									<SelectItem value="mobile_money">Mobile Money</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Submitting...
								</>
							) : (
								<>
									Submit Request
									<ArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button
						variant="outline"
						onClick={() => router.push("/member/dashboard")}>
						Cancel
					</Button>
					<Button
						variant="link"
						onClick={() => router.push("/member/willing-deposit/history")}>
						View Past Requests
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
