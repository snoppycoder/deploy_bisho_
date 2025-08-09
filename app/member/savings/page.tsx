"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ArrowUpCircle,
	ArrowDownCircle,
	Clock,
	TrendingUp,
	Wallet,
	RefreshCw,
	Download,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { membersSavingsAPI } from "@/lib/api"

interface Transaction {
	id: number;
	type: string;
	amount: number;
	description?: string;
	transactionDate: string;
	status?: string;
	reference?: string;
}

interface MonthlySavings {
	month: string;
	deposits: number;
	withdrawals: number;
	net: number;
}

interface TypeDistribution {
	name: string;
	value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const typeIcons: Record<string, React.ReactNode> = {
	DEPOSIT: <ArrowUpCircle className="h-4 w-4 text-green-500" />,
	WITHDRAWAL: <ArrowDownCircle className="h-4 w-4 text-red-500" />,
	CONTRIBUTION: <TrendingUp className="h-4 w-4 text-blue-500" />,
	TRANSFER: <RefreshCw className="h-4 w-4 text-orange-500" />,
};

const typeColors: Record<string, string> = {
	DEPOSIT: "bg-green-100 text-green-800",
	WITHDRAWAL: "bg-red-100 text-red-800",
	CONTRIBUTION: "bg-blue-100 text-blue-800",
	TRANSFER: "bg-orange-100 text-orange-800",
};

export default function SavingsAndTransactionsPage() {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [savings, setSavings] = useState(0);
	const [totalDeposits, setTotalDeposits] = useState(0);
	const [totalWithdrawals, setTotalWithdrawals] = useState(0);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [monthlySavings, setMonthlySavings] = useState<MonthlySavings[]>([]);
	const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>(
		[]
	);
	const [transactionCount, setTransactionCount] = useState(0);
	const [period, setPeriod] = useState("all");
	const [type, setType] = useState("all");
	const { toast } = useToast();

	const fetchSavingsAndTransactions = async () => {
		if (!user?.etNumber) return;

		setIsLoading(true);
		try { 
			 const data = await membersSavingsAPI.getSavingsAndTransactions(
				user.etNumber,
				period,
				type
				);

			setSavings(data.totalSavings);
			setTotalDeposits(data.totalDeposits);
			setTotalWithdrawals(data.totalWithdrawals);
			setTransactions(data.recentTransactions);
			setMonthlySavings(data.monthlySavings);
			setTypeDistribution(data.typeDistribution);
			setTransactionCount(data.transactionCount);
		} catch (error) {
			console.error("Error fetching savings and transactions:", error);
			toast({
				title: "Error",
				description:
					"Failed to load savings and transactions. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSavingsAndTransactions();
	}, [toast, user, period, type]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-ET", {
			style: "currency",
			currency: "ETB",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-ET", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const handleRefresh = () => {
		fetchSavingsAndTransactions();
		toast({
			title: "Refreshed",
			description: "Your savings and transactions data has been updated.",
		});
	};

	const handleExport = () => {
		// Create CSV content
		const headers = ["Date", "Type", "Amount", "Description", "Reference"];
		const csvRows = [headers];

		transactions.forEach((transaction) => {
			const row: any = [
				formatDate(transaction.transactionDate),
				transaction.type,
				transaction.amount,
				transaction.description || "",
				transaction.reference || "",
			];
			csvRows.push(row);
		});

		const csvContent = csvRows.map((row) => row.join(",")).join("\n");

		// Create and download the file
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`transactions_${new Date().toISOString().split("T")[0]}.csv`
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold">Savings & Transactions</h1>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={handleRefresh}>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
					<Button variant="outline" size="sm" onClick={handleExport}>
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Savings
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<div className="flex items-center">
								<Wallet className="h-5 w-5 text-green-500 mr-2" />
								<p className="text-2xl font-bold">{formatCurrency(savings)}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Deposits
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<div className="flex items-center">
								<ArrowUpCircle className="h-5 w-5 text-green-500 mr-2" />
								<p className="text-2xl font-bold">
									{formatCurrency(totalDeposits)}
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Withdrawals
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<div className="flex items-center">
								<ArrowDownCircle className="h-5 w-5 text-red-500 mr-2" />
								<p className="text-2xl font-bold">
									{formatCurrency(totalWithdrawals)}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="transactions">
				<TabsList className="grid w-full grid-cols-3 mb-4">
					<TabsTrigger value="transactions">Transactions</TabsTrigger>
				</TabsList>

				<TabsContent value="transactions" className="space-y-4">
					<div className="flex flex-col sm:flex-row justify-between gap-4">
						<div className="flex gap-2 items-center">
							<p className="text-sm text-muted-foreground">Filter by period:</p>
							<Select value={period} onValueChange={setPeriod}>
								<SelectTrigger className="w-[150px]">
									<SelectValue placeholder="Select period" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All time</SelectItem>
									<SelectItem value="week">Last 7 days</SelectItem>
									<SelectItem value="month">Last 30 days</SelectItem>
									<SelectItem value="year">Last year</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex gap-2 items-center">
							<p className="text-sm text-muted-foreground">Filter by type:</p>
							<Select value={type} onValueChange={setType}>
								<SelectTrigger className="w-[150px]">
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All types</SelectItem>
									<SelectItem value="DEPOSIT">Deposits</SelectItem>
									<SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
									<SelectItem value="CONTRIBUTION">Contributions</SelectItem>
									<SelectItem value="TRANSFER">Transfers</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Recent Transactions</CardTitle>
							<CardDescription>
								Showing {transactions.length} of {transactionCount} transactions
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								Array(5)
									.fill(0)
									.map((_, i) => (
										<Skeleton key={i} className="h-12 w-full mb-2" />
									))
							) : transactions.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Description</TableHead>
											<TableHead className="text-right">Amount</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{transactions.map((transaction) => (
											<TableRow key={transaction.id}>
												<TableCell className="flex items-center gap-2">
													<Clock className="h-4 w-4 text-muted-foreground" />
													{formatDate(transaction.transactionDate)}
												</TableCell>
												<TableCell>
													<Badge
														variant="outline"
														className={`flex items-center gap-1 ${
															typeColors[transaction.type] || ""
														}`}>
														{typeIcons[transaction.type]}
														{transaction.type}
													</Badge>
												</TableCell>
												<TableCell>{transaction.description || "-"}</TableCell>
												<TableCell
													className={`text-right font-medium ${
														transaction.type === "WITHDRAWAL"
															? "text-red-600"
															: "text-green-600"
													}`}>
													{transaction.type === "WITHDRAWAL" ? "-" : "+"}
													{formatCurrency(transaction.amount)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="text-center py-8">
									<p className="text-muted-foreground">
										No transactions found for the selected filters.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
