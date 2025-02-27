"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

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
	repaymentType: z.enum(["equal", "reducing"]),
});

type RepaymentSchedule = {
	month: number;
	payment: number;
	principal: number;
	interest: number;
	balance: number;
};

export default function LoanCalculatorPage() {
	const [schedule, setSchedule] = useState<RepaymentSchedule[]>([]);
	const [summary, setSummary] = useState<{
		totalPayment: number;
		totalInterest: number;
		monthlyPayment: number;
	} | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: "5000",
			interestRate: "5",
			tenureMonths: "12",
			repaymentType: "equal",
		},
	});

	function calculateEqualPayments(
		principal: number,
		annualRate: number,
		months: number
	): RepaymentSchedule[] {
		const monthlyRate = annualRate / 100 / 12;
		const monthlyPayment =
			(principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
			(Math.pow(1 + monthlyRate, months) - 1);

		let balance = principal;
		const schedule: RepaymentSchedule[] = [];

		for (let month = 1; month <= months; month++) {
			const interest = balance * monthlyRate;
			const principalPaid = monthlyPayment - interest;
			balance -= principalPaid;

			schedule.push({
				month,
				payment: Number.parseFloat(monthlyPayment.toFixed(2)),
				principal: Number.parseFloat(principalPaid.toFixed(2)),
				interest: Number.parseFloat(interest.toFixed(2)),
				balance: Number.parseFloat(balance.toFixed(2)),
			});
		}

		return schedule;
	}

	function calculateReducingPayments(
		principal: number,
		annualRate: number,
		months: number
	): RepaymentSchedule[] {
		const monthlyRate = annualRate / 100 / 12;
		const principalPayment = principal / months;

		let balance = principal;
		const schedule: RepaymentSchedule[] = [];

		for (let month = 1; month <= months; month++) {
			const interest = balance * monthlyRate;
			const payment = principalPayment + interest;
			balance -= principalPayment;

			schedule.push({
				month,
				payment: Number.parseFloat(payment.toFixed(2)),
				principal: Number.parseFloat(principalPayment.toFixed(2)),
				interest: Number.parseFloat(interest.toFixed(2)),
				balance: Number.parseFloat(balance.toFixed(2)),
			});
		}

		return schedule;
	}

	function onSubmit(values: z.infer<typeof formSchema>) {
		const principal = Number.parseFloat(values.amount);
		const interestRate = Number.parseFloat(values.interestRate);
		const tenureMonths = Number.parseInt(values.tenureMonths);
		const repaymentType = values.repaymentType;

		let calculatedSchedule: RepaymentSchedule[];

		if (repaymentType === "equal") {
			calculatedSchedule = calculateEqualPayments(
				principal,
				interestRate,
				tenureMonths
			);
		} else {
			calculatedSchedule = calculateReducingPayments(
				principal,
				interestRate,
				tenureMonths
			);
		}

		setSchedule(calculatedSchedule);

		// Calculate summary
		const totalPayment = calculatedSchedule.reduce(
			(sum, item) => sum + item.payment,
			0
		);
		const totalInterest = calculatedSchedule.reduce(
			(sum, item) => sum + item.interest,
			0
		);
		const monthlyPayment = calculatedSchedule[0].payment;

		setSummary({
			totalPayment: Number.parseFloat(totalPayment.toFixed(2)),
			totalInterest: Number.parseFloat(totalInterest.toFixed(2)),
			monthlyPayment: Number.parseFloat(monthlyPayment.toFixed(2)),
		});
	}

	return (
		<div className="flex flex-col gap-5">
			<h1 className="text-3xl font-bold tracking-tight">
				Loan Repayment Calculator
			</h1>

			<div className="grid gap-5 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Loan Details</CardTitle>
						<CardDescription>
							Enter your loan details to calculate repayment schedule
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4">
								<FormField
									control={form.control}
									name="amount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Loan Amount ($)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormDescription>
												Enter the principal amount
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
											<FormLabel>Annual Interest Rate (%)</FormLabel>
											<FormControl>
												<Input {...field} />
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
											<FormLabel>Loan Tenure (Months)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormDescription>
												Enter the number of months
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="repaymentType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Repayment Type</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select repayment type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="equal">
														Equal Installments (EMI)
													</SelectItem>
													<SelectItem value="reducing">
														Reducing Balance
													</SelectItem>
												</SelectContent>
											</Select>
											<FormDescription>
												Select the type of repayment calculation
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full">
									Calculate
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				{summary && (
					<Card>
						<CardHeader>
							<CardTitle>Loan Summary</CardTitle>
							<CardDescription>Summary of your loan repayment</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">
										Principal Amount
									</p>
									<p className="text-2xl font-bold">
										${form.getValues().amount}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Interest Rate</p>
									<p className="text-2xl font-bold">
										{form.getValues().interestRate}%
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Loan Tenure</p>
									<p className="text-2xl font-bold">
										{form.getValues().tenureMonths} months
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Monthly Payment
									</p>
									<p className="text-2xl font-bold">
										${summary.monthlyPayment}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Total Interest
									</p>
									<p className="text-2xl font-bold">${summary.totalInterest}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Total Payment</p>
									<p className="text-2xl font-bold">${summary.totalPayment}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{schedule.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Repayment Schedule</CardTitle>
						<CardDescription>
							Monthly breakdown of your loan repayment
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Month</TableHead>
										<TableHead>Payment</TableHead>
										<TableHead>Principal</TableHead>
										<TableHead>Interest</TableHead>
										<TableHead>Remaining Balance</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{schedule.map((item) => (
										<TableRow key={item.month}>
											<TableCell>{item.month}</TableCell>
											<TableCell>${item.payment}</TableCell>
											<TableCell>${item.principal}</TableCell>
											<TableCell>${item.principal}</TableCell>
											<TableCell>${item.interest}</TableCell>
											<TableCell>${item.balance}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
