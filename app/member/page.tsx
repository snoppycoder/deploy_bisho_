"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-provider";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AreaChart, LineChart } from "@/components/ui/chart";
import { CreditCard, DollarSign, PiggyBank, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MemberData {
	name: string;
	totalSavings: number;
	totalContributions: number;
	activeLoans: number;
	nextPayment: {
		amount: number;
		repaymentDate: string;
	} | null;
	savings: Array<{ savingsDate: string; amount: number }>;
	loans: Array<{
		id: number;
		amount: number;
		loanRepayments: Array<{
			repaymentDate: string;
			amount: number;
			status: string;
		}>;
	}>;
	transactions: Array<{
		transactionDate: string;
		amount: number;
		type: string;
	}>;
}

export default function MemberDashboardPage() {
	const { user } = useAuth();
	const [memberData, setMemberData] = useState<MemberData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchMemberData = async () => {
			console.log({
				et: user?.etNumber,
			});
			if (user?.etNumber) {
				try {
					const response = await fetch(`/api/members/${user.etNumber}`);

					if (!response.ok) {
						throw new Error("Failed to fetch member data");
					}
					const data = await response.json();
					console.log({ data });
					setMemberData(data.member);
				} catch (err) {
					setError("Failed to load member data");
					console.error(err);
				} finally {
					setIsLoading(false);
				}
			}
		};

		fetchMemberData();
	}, [user]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error || !memberData) {
		return <div>Error: {error || "Failed to load member data"}</div>;
	}

	return (
		<div className="flex flex-col gap-5">
			<h1 className="text-3xl font-bold tracking-tight">
				Welcome, {memberData.name}
			</h1>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Savings</CardTitle>
						<PiggyBank className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							ETB {Number(memberData.totalSavings).toFixed(2)}
						</div>
						<p className="text-xs text-muted-foreground">
							+ETB {Number(memberData.savings[0]?.amount).toFixed(2) || "0.00"}{" "}
							last deposit
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Loans</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{memberData.activeLoans}</div>
						<p className="text-xs text-muted-foreground">
							Total: ETB
							{Number(
								memberData.loans.reduce((sum, loan) => sum + loan.amount, 0)
							).toFixed(2)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Contributions
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							ETB {Number(memberData.totalContributions).toFixed(2)}
						</div>
						<p className="text-xs text-muted-foreground">
							+ETB{" "}
							{Number(memberData.transactions[0]?.amount).toFixed(2) || "0.00"}{" "}
							last contribution
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Next Payment</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							ETB {Number(memberData.nextPayment?.amount).toFixed(2) || "0.00"}
						</div>
						<p className="text-xs text-muted-foreground">
							Due on{" "}
							{memberData.nextPayment?.repaymentDate.split("T")[0] || "N/A"}
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Savings Growth</CardTitle>
						<CardDescription>Your savings over time</CardDescription>
					</CardHeader>
					<CardContent className="px-2">
						<AreaChart
							data={memberData.savings.map((saving) => ({
								name: saving.savingsDate.split("T")[0],
								amount: saving.amount,
							}))}
							index="name"
							categories={["amount"]}
							colors={["green"]}
							valueFormatter={(value) => `ETB ${Number(value).toFixed(2)}`}
							className="h-[300px]"
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Loan Repayment Schedule</CardTitle>
						<CardDescription>Your loan repayment progress</CardDescription>
					</CardHeader>
					<CardContent className="px-2">
						<LineChart
							data={
								memberData.loans[0]?.loanRepayments.map((repayment) => ({
									name: repayment.repaymentDate.split("T")[0],
									amount: repayment.amount,
									status: repayment.status,
								})) || []
							}
							index="name"
							categories={["amount"]}
							colors={["blue"]}
							valueFormatter={(value) => `ETB ${Number(value).toFixed(2)}`}
							className="h-[300px]"
						/>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>
							Common tasks you might want to perform
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-2">
							<Link href="/member/loans/apply">
								<Button className="w-full">Apply for a Loan</Button>
							</Link>
							<Link href="/member/loans/calculator">
								<Button variant="outline" className="w-full">
									Calculate Loan Repayment
								</Button>
							</Link>
							<Link href="/member/profile">
								<Button variant="outline" className="w-full">
									Update Profile
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Recent Transactions</CardTitle>
						<CardDescription>
							Your most recent financial activities
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{memberData.transactions.map((transaction, index) => (
								<div key={index} className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">{transaction.type}</p>
										<p className="text-xs text-muted-foreground">
											{transaction.transactionDate.split("T")[0]}
										</p>
									</div>
									<div
										className={`text-sm font-medium ${
											transaction.amount > 0 ? "text-green-500" : "text-red-500"
										}`}>
										{transaction.amount > 0 ? "+" : "-"}$
										{Math.abs(transaction.amount).toFixed(2)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
