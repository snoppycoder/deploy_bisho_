"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function LoanCalculatorPage() {
	const [loanAmount, setLoanAmount] = useState("");
	const [interestRate, setInterestRate] = useState("");
	const [loanTerm, setLoanTerm] = useState("");
	const [repaymentSchedule, setRepaymentSchedule] = useState<any[]>([]);

	const calculateLoan = () => {
		const amount = Number.parseFloat(loanAmount);
		const rate = Number.parseFloat(interestRate) / 100 / 12;
		const term = Number.parseInt(loanTerm);

		if (isNaN(amount) || isNaN(rate) || isNaN(term)) {
			alert("Please enter valid numbers for all fields");
			return;
		}

		const monthlyPayment =
			(amount * rate * Math.pow(1 + rate, term)) /
			(Math.pow(1 + rate, term) - 1);
		let balance = amount;
		const schedule = [];

		for (let i = 1; i <= term; i++) {
			const interest = balance * rate;
			const principal = monthlyPayment - interest;
			balance -= principal;

			schedule.push({
				month: i,
				payment: monthlyPayment.toFixed(2),
				principal: principal.toFixed(2),
				interest: interest.toFixed(2),
				balance: balance > 0 ? balance.toFixed(2) : 0,
			});
		}

		setRepaymentSchedule(schedule);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Loan Calculator</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="grid grid-cols-3 gap-4">
						<div>
							<Label htmlFor="loanAmount">Loan Amount</Label>
							<Input
								id="loanAmount"
								value={loanAmount}
								onChange={(e) => setLoanAmount(e.target.value)}
								placeholder="Enter loan amount"
							/>
						</div>
						<div>
							<Label htmlFor="interestRate">Interest Rate (%)</Label>
							<Input
								id="interestRate"
								value={interestRate}
								onChange={(e) => setInterestRate(e.target.value)}
								placeholder="Enter interest rate"
							/>
						</div>
						<div>
							<Label htmlFor="loanTerm">Loan Term (months)</Label>
							<Input
								id="loanTerm"
								value={loanTerm}
								onChange={(e) => setLoanTerm(e.target.value)}
								placeholder="Enter loan term"
							/>
						</div>
					</div>
					<Button onClick={calculateLoan}>Calculate</Button>
				</div>
				{repaymentSchedule.length > 0 && (
					<Table className="mt-4">
						<TableHeader>
							<TableRow>
								<TableHead>Month</TableHead>
								<TableHead>Payment</TableHead>
								<TableHead>Principal</TableHead>
								<TableHead>Interest</TableHead>
								<TableHead>Balance</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{repaymentSchedule.map((row) => (
								<TableRow key={row.month}>
									<TableCell>{row.month}</TableCell>
									<TableCell>${row.payment}</TableCell>
									<TableCell>${row.principal}</TableCell>
									<TableCell>${row.interest}</TableCell>
									<TableCell>${row.balance}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
