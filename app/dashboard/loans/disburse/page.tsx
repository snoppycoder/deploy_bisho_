"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	BarChart,
	Bar,
} from "recharts";
import { DollarSign, Users, TrendingUp, Calendar, Search } from "lucide-react";

interface Loan {
	id: number;
	memberId: number;
	amount: number;
	interestRate: number;
	tenureMonths: number;
	status: string;
	createdAt: string;
	member: {
		name: string;
		etNumber: number;
	};
	loanRepayments: {
		id: number;
		amount: number;
		repaymentDate: string;
		status: string;
	}[];
}

export default function DisbursedLoansPage() {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		fetchDisbursedLoans();
	}, []);

	const fetchDisbursedLoans = async () => {
		try {
			const response = await fetch("/api/loans/disbursed");
			if (response.ok) {
				const data = await response.json();
				setLoans(data);
			} else {
				throw new Error("Failed to fetch disbursed loans");
			}
		} catch (error) {
			console.error("Error fetching disbursed loans:", error);
			toast({
				title: "Failed to fetch disbursed loans",
				variant: "destructive",
			});
		}
	};

	const filteredLoans = loans.filter(
		(loan) =>
			loan.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			loan.member.etNumber.toString().includes(searchTerm) ||
			loan.id.toString().includes(searchTerm)
	);

	// const totalDisbursed = loans.reduce((sum, loan) => sum + loan.amount, 0);
	// const averageLoanAmount = totalDisbursed / loans.length || 0;
	const totalDisbursed = loans.reduce(
		(sum, loan) => sum + Number(loan.amount),
		0
	);
	const averageLoanAmount = loans.length ? totalDisbursed / loans.length : 0;

	const statusCounts = loans.reduce((acc, loan) => {
		acc[loan.status] = (acc[loan.status] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const pieChartData = Object.entries(statusCounts).map(([name, value]) => ({
		name,
		value,
	}));

	const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

	const monthlyData = loans.reduce((acc, loan) => {
		const month = new Date(loan.createdAt).toLocaleString("default", {
			month: "short",
		});
		acc[month] = (acc[month] || 0) + loan.amount;
		return acc;
	}, {} as Record<string, number>);

	const lineChartData = Object.entries(monthlyData).map(([name, amount]) => ({
		name,
		amount,
	}));

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "ETB",
			maximumFractionDigits: 2,
		}).format(value);

	const formattedTotalDisbursed = formatCurrency(totalDisbursed);
	const formattedAverageLoanAmount = formatCurrency(averageLoanAmount);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Disbursed Loans Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<Card className="bg-blue-50">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-blue-600">
							Total Disbursed
						</CardTitle>
						<DollarSign className="w-4 h-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-900">
							{formattedTotalDisbursed}
						</div>
						<p className="text-xs text-blue-600">Total amount disbursed</p>
					</CardContent>
				</Card>
				<Card className="bg-green-50">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-green-600">
							Number of Loans
						</CardTitle>
						<Users className="w-4 h-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-900">
							{loans.length}
						</div>
						<p className="text-xs text-green-600">Total disbursed loans</p>
					</CardContent>
				</Card>
				<Card className="bg-yellow-50">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-yellow-600">
							Average Loan Amount
						</CardTitle>
						<TrendingUp className="w-4 h-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-900">
							{formattedAverageLoanAmount}
						</div>
						<p className="text-xs text-yellow-600">Average per loan</p>
					</CardContent>
				</Card>
				<Card className="bg-purple-50">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-purple-600">
							Latest Disbursement
						</CardTitle>
						<Calendar className="w-4 h-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-purple-900">
							{loans.length > 0
								? new Date(loans[0].createdAt).toLocaleDateString()
								: "N/A"}
						</div>
						<p className="text-xs text-purple-600">Date of most recent loan</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				<Card>
					<CardHeader>
						<CardTitle>Loan Status Distribution</CardTitle>
					</CardHeader>
					<CardContent className="h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={pieChartData}
									cx="50%"
									cy="50%"
									labelLine={false}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}>
									{pieChartData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Monthly Disbursement Trend</CardTitle>
					</CardHeader>
					<CardContent className="h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={lineChartData}>
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip
									formatter={(value) => formatCurrency(value as number)}
								/>
								<Legend />
								<Bar dataKey="amount" fill="#8884d8" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Disbursed Loans</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex items-center">
						<Search className="w-4 h-4 mr-2 text-gray-500" />
						<Input
							placeholder="Search by member name, ET number, or loan ID"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="max-w-sm"
						/>
					</div>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Loan ID</TableHead>
									<TableHead>Member Name</TableHead>
									<TableHead>ET Number</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Interest Rate</TableHead>
									<TableHead>Tenure (Months)</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredLoans.map((loan) => (
									<TableRow key={loan.id}>
										<TableCell>{loan.id}</TableCell>
										<TableCell>{loan.member.name}</TableCell>
										<TableCell>{loan.member.etNumber}</TableCell>
										<TableCell>{formatCurrency(loan.amount)}</TableCell>
										<TableCell>{loan.interestRate}%</TableCell>
										<TableCell>{loan.tenureMonths}</TableCell>
										<TableCell>
											<Badge variant="outline" className="capitalize">
												{loan.status.toLowerCase()}
											</Badge>
										</TableCell>
										<TableCell>
											<Dialog>
												<DialogTrigger asChild>
													<Button
														variant="outline"
														size="sm"
														onClick={() => setSelectedLoan(loan)}>
														View Repayments
													</Button>
												</DialogTrigger>
												<DialogContent className="max-w-3xl">
													<DialogHeader>
														<DialogTitle>
															Repayment Schedule - Loan #{loan.id}
														</DialogTitle>
													</DialogHeader>
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Repayment ID</TableHead>
																<TableHead>Amount</TableHead>
																<TableHead>Due Date</TableHead>
																<TableHead>Status</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{loan.loanRepayments.map((repayment) => (
																<TableRow key={repayment.id}>
																	<TableCell>{repayment.id}</TableCell>
																	<TableCell>
																		{formatCurrency(repayment.amount)}
																	</TableCell>
																	<TableCell>
																		{new Date(
																			repayment.repaymentDate
																		).toLocaleDateString()}
																	</TableCell>
																	<TableCell>
																		<Badge
																			variant="outline"
																			className="capitalize">
																			{repayment.status.toLowerCase()}
																		</Badge>
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</DialogContent>
											</Dialog>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
