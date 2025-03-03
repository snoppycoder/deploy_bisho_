"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
	CalendarClock,
	CheckCircle,
	Clock,
	DollarSign,
	FileText,
	AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Loan {
	id: number;
	amount: number;
	interestRate: number;
	tenureMonths: number;
	status: string;
	createdAt: string;
	remainingAmount: number;
	approvalLogs: {
		id: number;
		status: string;
		approvalDate: string;
		comments: string;
		role: string;
	}[];
	loanRepayments: {
		id: number;
		amount: number;
		repaymentDate: string;
		reference: string | null;
		sourceType: string;
		status: string;
	}[];
	totalRepaidAmount: number; // Added totalRepaidAmount field
}
interface LoanRepayment {
	id: number;
	amount: number;
	repaymentDate: string;
	reference: string | null;
	sourceType: string;
	status: string; // Added status field
}

export default function MemberLoansPage() {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		const fetchLoans = async () => {
			try {
				const response = await fetch("/api/members/loans");
				if (!response.ok) {
					throw new Error("Failed to fetch loans");
				}
				const data = await response.json();
				setLoans(data);
			} catch (error) {
				console.error("Error fetching loans:", error);
				toast({
					title: "Error",
					description: "Failed to load your loans. Please try again.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchLoans();
	}, [toast]);

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; icon: React.ReactNode }> =
			{
				PENDING: {
					color: "bg-yellow-500",
					icon: <Clock className="h-4 w-4 mr-1" />,
				},
				VERIFIED: {
					color: "bg-blue-500",
					icon: <CheckCircle className="h-4 w-4 mr-1" />,
				},
				APPROVED: {
					color: "bg-green-500",
					icon: <CheckCircle className="h-4 w-4 mr-1" />,
				},
				DISBURSED: {
					color: "bg-purple-500",
					icon: <DollarSign className="h-4 w-4 mr-1" />,
				},
				REPAID: {
					color: "bg-gray-500",
					icon: <CheckCircle className="h-4 w-4 mr-1" />,
				},
				REJECTED: {
					color: "bg-red-500",
					icon: <AlertCircle className="h-4 w-4 mr-1" />,
				},
			};

		const { color, icon } = statusMap[status] || {
			color: "bg-gray-500",
			icon: null,
		};

		return (
			<Badge className={`${color} flex items-center`}>
				{icon}
				{status}
			</Badge>
		);
	};

	// const calculateRepaymentProgress = (loan: Loan) => {
	// 	if (loan.loanRepayments.length === 0) return 0;

	// 	const totalRepaid = loan.loanRepayments.reduce(
	// 		(sum, repayment) => sum + repayment.amount,
	// 		0
	// 	);
	// 	const progressPercentage = (totalRepaid / loan.amount) * 100;

	// 	return Math.min(progressPercentage, 100);
	// };
	// const calculateRepaymentProgress = (loan: Loan) => {
	// 	const totalRepaid = loan.loanRepayments.reduce((sum, repayment) => {
	// 		return sum + (repayment.status === "PAID" ? repayment.amount : 0);
	// 	}, 0);
	// 	console.log({
	// 		loan,
	// 		loanRepayments: loan.loanRepayments,
	// 		totalRepaid,
	// 	});

	// 	if (totalRepaid === 0) return 0;
	// 	const progressPercentage = (totalRepaid / loan.amount) * 100;
	// 	return Math.min(progressPercentage, 100);
	// };

	const calculateRepaymentProgress = (loan: Loan) => {
		if (
			!loan.loanRepayments ||
			loan.loanRepayments.length === 0 ||
			loan.amount <= 0
		) {
			return 0;
		}

		// Convert loan.amount (which is a string) to a number
		const loanAmount = Number(loan.amount);

		// Ensure that loanAmount is a valid number
		if (isNaN(loanAmount)) {
			console.error("Invalid loan amount:", loan.amount);
			return 0; // If loan amount is invalid, return 0 progress
		}

		console.log(`Loan Amount: ${loanAmount}`);

		// Calculate the total repaid by converting repayment amounts (which are strings) to numbers
		const totalRepaid = loan.loanRepayments.reduce((sum, repayment) => {
			// Convert repayment.amount (which is a string) to a number
			const repaymentAmount = Number(repayment.amount);

			// Only add the repayment amount if the status is "PAID" and the amount is a valid number
			if (repayment.status === "PAID" && !isNaN(repaymentAmount)) {
				console.log(`Repayment Amount (PAID): ${repaymentAmount}`);
				return sum + repaymentAmount;
			}
			return sum;
		}, 0);

		// Round total repaid to 2 decimal places
		const totalRepaidRounded = Math.round(totalRepaid * 100) / 100;

		console.log({
			loan,
			loanRepayments: loan.loanRepayments,
			totalRepaid: totalRepaidRounded,
		});

		// Calculate progress as a percentage
		const progressPercentage = (totalRepaidRounded / loanAmount) * 100;

		// Round the progress percentage to 2 decimal places and ensure it's between 0 and 100
		const progressPercentageRounded = Math.min(
			Math.round(progressPercentage * 100) / 100,
			100
		);

		console.log(`Progress Percentage: ${progressPercentageRounded}%`);

		return progressPercentageRounded;
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "ETB",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getLoanStatusColor = (status: string) => {
		switch (status) {
			case "PENDING":
				return "bg-yellow-100 text-yellow-800";
			case "APPROVED":
				return "bg-green-100 text-green-800";
			case "PAID":
				return "bg-green-100 text-green-800";
			case "REJECTED":
				return "bg-red-100 text-red-800";
			case "OVERDUE":
				return "bg-red-100 text-red-800";
			case "DISBURSED":
				return "bg-blue-100 text-blue-800";
			case "COMPLETED":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">Loading your loans...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold tracking-tight">My Loans</h1>
				<Link href="/member/loans/apply">
					<Button>Apply for a New Loan</Button>
				</Link>
			</div>

			{loans.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="h-16 w-16 text-muted-foreground mb-4" />
						<h3 className="text-xl font-semibold mb-2">No Loans Found</h3>
						<p className="text-muted-foreground text-center mb-6">
							You don't have any loans yet. Apply for a loan to get started.
						</p>
						<Link href="/member/loans/apply">
							<Button>Apply for a Loan</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<Tabs defaultValue="active" className="space-y-4">
					<TabsList>
						<TabsTrigger value="active">Active Loans</TabsTrigger>
						<TabsTrigger value="pending">Pending Applications</TabsTrigger>
						<TabsTrigger value="history">Loan History</TabsTrigger>
					</TabsList>

					<TabsContent value="active" className="space-y-4">
						{loans.filter((loan) =>
							["APPROVED", "DISBURSED"].includes(loan.status)
						).length === 0 ? (
							<Card>
								<CardContent className="py-8 text-center">
									<p className="text-muted-foreground">
										You don't have any active loans.
									</p>
								</CardContent>
							</Card>
						) : (
							loans
								.filter((loan) =>
									["APPROVED", "DISBURSED"].includes(loan.status)
								)
								.map((loan) => (
									<Card key={loan.id} className="overflow-hidden">
										<CardHeader className="pb-2">
											<div className="flex justify-between items-start">
												<div>
													<CardTitle>Loan #{loan.id}</CardTitle>
													<CardDescription>
														Applied on {formatDate(loan.createdAt)}
													</CardDescription>
												</div>
												{getStatusBadge(loan.status)}
											</div>
										</CardHeader>
										<CardContent className="pb-2">
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
												<div>
													<p className="text-sm text-muted-foreground">
														Loan Amount
													</p>
													<p className="text-2xl font-bold">
														{formatCurrency(loan.amount)}
													</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">
														Interest Rate
													</p>
													<p className="text-2xl font-bold">
														{loan.interestRate}%
													</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">
														Tenure
													</p>
													<p className="text-2xl font-bold">
														{loan.tenureMonths} months
													</p>
												</div>
											</div>
											{/* 
											<div className="space-y-2 mb-4">
												<div className="flex justify-between text-sm">
													<span>Repayment Progress</span>
													<span>
														{Math.round(calculateRepaymentProgress(loan))}%
													</span>
												</div>
												<Progress
													value={calculateRepaymentProgress(loan)}
													className="h-2"
												/>
											</div> */}
											<div>
												<h4 className="font-semibold mb-2">
													Repayment Progress
												</h4>
												<Progress value={calculateRepaymentProgress(loan)} />
												<p className="text-sm mt-1">
													{calculateRepaymentProgress(loan)}% Repaid
												</p>
											</div>

											{loan.loanRepayments.length > 0 && (
												<div className="mt-4">
													<h4 className="font-semibold mb-2">
														Recent Repayments
													</h4>
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Date</TableHead>
																<TableHead>Amount</TableHead>
																<TableHead>Note</TableHead>
																<TableHead>Source</TableHead>
																<TableHead>Status</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{loan.loanRepayments
																.slice(0, 3)
																.map((repayment) => (
																	<TableRow key={repayment.id}>
																		<TableCell>
																			{formatDate(repayment.repaymentDate)}
																		</TableCell>
																		<TableCell>
																			{formatCurrency(repayment.amount)}
																		</TableCell>
																		{/* {JSON.stringify(repayment.status)} */}
																		<TableCell>
																			{repayment.reference || "N/A"}
																		</TableCell>
																		<TableCell>
																			{repayment.sourceType || "N/A"}
																		</TableCell>

																		<TableCell>
																			<Badge
																				className={getLoanStatusColor(
																					repayment.status
																				)}>
																				{repayment.status}
																			</Badge>
																		</TableCell>
																	</TableRow>
																))}
														</TableBody>
													</Table>
												</div>
											)}
										</CardContent>
										<CardFooter className="flex justify-between">
											<Button
												variant="outline"
												onClick={() => router.push(`/member/loans/${loan.id}`)}>
												View Details
											</Button>
											<Link href="/member/loans/calculator">
												<Button variant="secondary">
													<CalendarClock className="mr-2 h-4 w-4" />
													Repayment Schedule
												</Button>
											</Link>
										</CardFooter>
									</Card>
								))
						)}
					</TabsContent>

					<TabsContent value="pending" className="space-y-4">
						{loans.filter((loan) =>
							["PENDING", "VERIFIED"].includes(loan.status)
						).length === 0 ? (
							<Card>
								<CardContent className="py-8 text-center">
									<p className="text-muted-foreground">
										You don't have any pending loan applications.
									</p>
								</CardContent>
							</Card>
						) : (
							loans
								.filter((loan) => ["PENDING", "VERIFIED"].includes(loan.status))
								.map((loan) => (
									<Card key={loan.id}>
										<CardHeader className="pb-2">
											<div className="flex justify-between items-start">
												<div>
													<CardTitle>Loan Application #{loan.id}</CardTitle>
													<CardDescription>
														Applied on {formatDate(loan.createdAt)}
													</CardDescription>
												</div>
												{getStatusBadge(loan.status)}
											</div>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<div>
													<p className="text-sm text-muted-foreground">
														Requested Amount
													</p>
													<p className="text-xl font-bold">
														{formatCurrency(loan.amount)}
													</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">
														Interest Rate
													</p>
													<p className="text-xl font-bold">
														{loan.interestRate}%
													</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">
														Tenure
													</p>
													<p className="text-xl font-bold">
														{loan.tenureMonths} months
													</p>
												</div>
											</div>

											{loan.approvalLogs.length > 0 && (
												<div className="mt-4">
													<h4 className="font-semibold mb-2">
														Application Progress
													</h4>
													<div className="space-y-2">
														{loan.approvalLogs.map((log, index) => (
															<div
																key={log.id}
																className="flex items-start gap-2">
																<div className="mt-0.5">
																	<CheckCircle className="h-5 w-5 text-green-500" />
																</div>
																<div>
																	<p className="font-medium">
																		{log.status} by{" "}
																		{log.role.replace(/_/g, " ")}
																	</p>
																	<p className="text-sm text-muted-foreground">
																		{formatDate(log.approvalDate)}
																	</p>
																	{log.comments && (
																		<p className="text-sm mt-1 italic">
																			{log.comments}
																		</p>
																	)}
																</div>
															</div>
														))}
													</div>
												</div>
											)}
										</CardContent>
										<CardFooter>
											<Button
												variant="outline"
												onClick={() => router.push(`/member/loans/${loan.id}`)}>
												View Application Details
											</Button>
										</CardFooter>
									</Card>
								))
						)}
					</TabsContent>

					<TabsContent value="history" className="space-y-4">
						{loans.filter((loan) =>
							["REPAID", "REJECTED"].includes(loan.status)
						).length === 0 ? (
							<Card>
								<CardContent className="py-8 text-center">
									<p className="text-muted-foreground">
										You don't have any completed or rejected loans.
									</p>
								</CardContent>
							</Card>
						) : (
							loans
								.filter((loan) => ["REPAID", "REJECTED"].includes(loan.status))
								.map((loan) => (
									<Card key={loan.id}>
										<CardHeader className="pb-2">
											<div className="flex justify-between items-start">
												<div>
													<CardTitle>Loan #{loan.id}</CardTitle>
													<CardDescription>
														Applied on {formatDate(loan.createdAt)}
													</CardDescription>
												</div>
												{getStatusBadge(loan.status)}
											</div>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<div>
													<p className="text-sm text-muted-foreground">
														Loan Amount
													</p>
													<p className="text-xl font-bold">
														{formatCurrency(loan.amount)}
													</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">
														Interest Rate
													</p>
													<p className="text-xl font-bold">
														{loan.interestRate}%
													</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">
														Tenure
													</p>
													<p className="text-xl font-bold">
														{loan.tenureMonths} months
													</p>
												</div>
											</div>
										</CardContent>
										<CardFooter>
											<Button
												variant="outline"
												onClick={() => router.push(`/member/loans/${loan.id}`)}>
												View Loan History
											</Button>
										</CardFooter>
									</Card>
								))
						)}
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
