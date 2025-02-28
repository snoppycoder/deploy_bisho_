"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-provider";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface Transaction {
	id: number;
	type: string;
	amount: number;
	date: string;
}

export default function SavingsAndTransactionsPage() {
	const { user } = useAuth();
	const [savings, setSavings] = useState(0);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const { toast } = useToast();

	useEffect(() => {
		const fetchSavingsAndTransactions = async () => {
			console.log({
				et: user,
			});
			if (user?.etNumber) {
				try {
					const response = await fetch(
						`/api/members/${user?.etNumber}/savings-and-transactions`
					);

					if (!response.ok) {
						throw new Error("Failed to fetch savings and transactions");
					}
					const data = await response.json();
					console.log({
						data,
					});
					setSavings(data.totalSavings);
					setTransactions(data.recentTransactions);
				} catch (error) {
					console.error("Error fetching savings and transactions:", error);
					toast({
						title: "Error",
						description:
							"Failed to load savings and transactions. Please try again.",
						variant: "destructive",
					});
				}
			}
		};

		fetchSavingsAndTransactions();
	}, [toast, user]);

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Savings & Transactions</h1>
			<Card>
				<CardHeader>
					<CardTitle>Total Savings</CardTitle>
					<CardDescription>Your current savings balance</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-4xl font-bold text-green-600">
						{new Intl.NumberFormat("en-ET", {
							style: "currency",
							currency: "ETB",
						}).format(savings)}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Recent Transactions</CardTitle>
					<CardDescription>Your latest financial activities</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{transactions.map((transaction) => (
								<TableRow key={transaction.id}>
									<TableCell>
										{new Date(transaction.date).toLocaleDateString()}
									</TableCell>
									<TableCell>{transaction.type}</TableCell>
									<TableCell>
										{new Intl.NumberFormat("en-ET", {
											style: "currency",
											currency: "ETB",
										}).format(transaction.amount)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
