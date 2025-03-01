"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
	ArrowLeft,
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
	}[];
	loanDocuments: {
		id: number;
		documentType: string;
		documentUrl: string;
		uploadDate: string;
	}[];
}

export default function LoanDetailPage() {
	const [loan, setLoan] = useState<Loan | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		const fetchLoanDetails = async () => {
			try {
				const response = await fetch(`/api/members/loans/${params.id}`);
				if (!response.ok) {
					throw new Error("Failed to fetch loan details");
				}
				const data = await response.json();
				setLoan(data);
			} catch (error) {
				console.error("Error fetching loan details:", error);
				toast({
					title: "Error",
					description: "Failed to load loan details. Please try again.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchLoanDetails();
	}, [params.id, toast]);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "bg-yellow-500";
			case "paid":
				return "bg-green-500";
			case "overdue":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

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

	const calculateRepaymentProgress = (loan: Loan) => {
		if (loan.loanRepayments.length === 0) return 0;

		const totalRepaid = loan.loanRepayments.reduce(
			(sum, repayment) => sum + repayment.amount,
			0
		);
		const progressPercentage = (totalRepaid / loan.amount) * 100;

		console.log({
			loan,
		});

		return Math.min(progressPercentage, 100);
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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">Loading loan details...</p>
				</div>
			</div>
		);
	}

	if (!loan) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<AlertCircle className="h-16 w-16 text-destructive mb-4" />
				<h2 className="text-2xl font-bold mb-2">Loan Not Found</h2>
				<p className="text-muted-foreground mb-4">
					The loan you're looking for doesn't exist or you don't have access to
					it.
				</p>
				<Button onClick={() => router.push("/member/loans")}>
					Back to Loans
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center">
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.back()}
					className="mr-4">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<h1 className="text-3xl font-bold tracking-tight">
					Loan #{loan.id} Details
				</h1>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Loan Overview</CardTitle>
							<CardDescription>
								Applied on {formatDate(loan.createdAt)}
							</CardDescription>
						</div>
						{getStatusBadge(loan.status)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
						<div>
							<p className="text-sm text-muted-foreground">Loan Amount</p>
							<p className="text-2xl font-bold">
								{formatCurrency(loan.amount)}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Interest Rate</p>
							<p className="text-2xl font-bold">{loan.interestRate}%</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Tenure</p>
							<p className="text-2xl font-bold">{loan.tenureMonths} months</p>
						</div>
					</div>

					{["APPROVED", "DISBURSED", "REPAID"].includes(loan.status) && (
						<div className="space-y-2 mb-6">
							<div className="flex justify-between text-sm">
								<span>Repayment Progress</span>
								<span>{Math.round(calculateRepaymentProgress(loan))}%</span>
							</div>
							<Progress
								value={calculateRepaymentProgress(loan)}
								className="h-2"
							/>
						</div>
					)}
				</CardContent>
			</Card>

			<Tabs defaultValue="repayments" className="space-y-4">
				<TabsList>
					<TabsTrigger value="repayments">Repayments</TabsTrigger>
					<TabsTrigger value="approvals">Approval History</TabsTrigger>
					<TabsTrigger value="documents">Documents</TabsTrigger>
				</TabsList>

				<TabsContent value="repayments">
					<Card>
						<CardHeader>
							<CardTitle>Repayment Schedule</CardTitle>
							<CardDescription>
								Track your loan repayments and upcoming installments
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loan.loanRepayments.length === 0 ? (
								<div className="text-center py-6">
									<CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										No repayment schedule available yet. This will be generated
										once your loan is disbursed.
									</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Due Date</TableHead>
											<TableHead>Amount</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{loan.loanRepayments.map((repayment) => (
											<TableRow key={repayment.id}>
												<TableCell>
													{new Date(
														repayment.repaymentDate
													).toLocaleDateString()}
												</TableCell>
												<TableCell>
													ETB {Number(repayment.amount).toFixed(2)}
												</TableCell>
												<TableCell>
													{/* <Badge className={getStatusColor(repayment.status)}>
													{repayment.status}
												</Badge> */}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
						{/* <CardContent>
							{loan.loanRepayments.length === 0 ? (
								<div className="text-center py-6">
									<CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										No repayment schedule available yet. This will be generated
										once your loan is disbursed.
									</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Amount</TableHead>
											<TableHead>Reference</TableHead>
											<TableHead>Source</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{loan.loanRepayments.map((repayment) => (
											<TableRow key={repayment.id}>
												<TableCell>
													{formatDate(repayment.repaymentDate)}
												</TableCell>
												<TableCell>
													{formatCurrency(repayment.amount)}
												</TableCell>
												<TableCell>{repayment.reference || "N/A"}</TableCell>
												<TableCell>{repayment.sourceType}</TableCell>
												<TableCell>
													<Badge
														variant="outline"
														className="bg-green-100 text-green-800">
														Paid
													</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent> */}
						<CardFooter>
							<Link href="/member/loans/calculator">
								<Button variant="outline">
									<CalendarClock className="mr-2 h-4 w-4" />
									Calculate Repayment Schedule
								</Button>
							</Link>
						</CardFooter>
					</Card>
				</TabsContent>

				<TabsContent value="approvals">
					<Card>
						<CardHeader>
							<CardTitle>Approval History</CardTitle>
							<CardDescription>
								Track the progress of your loan application
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loan.approvalLogs.length === 0 ? (
								<div className="text-center py-6">
									<Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										Your loan application is awaiting initial review.
									</p>
								</div>
							) : (
								<div className="space-y-6">
									{loan.approvalLogs.map((log, index) => (
										<div
											key={log.id}
											className="flex items-start gap-4 relative">
											{index < loan.approvalLogs.length - 1 && (
												<div className="absolute left-[18px] top-8 bottom-0 w-0.5 bg-muted-foreground/20 z-0"></div>
											)}
											<div className="rounded-full bg-primary p-2 z-10">
												<CheckCircle className="h-5 w-5 text-primary-foreground" />
											</div>
											<div className="flex-1">
												<div className="flex justify-between items-start">
													<div>
														<p className="font-medium">
															{log.status} by {log.role.replace(/_/g, " ")}
														</p>
														<p className="text-sm text-muted-foreground">
															{formatDate(log.approvalDate)}
														</p>
													</div>
													{getStatusBadge(log.status)}
												</div>
												{log.comments && (
													<div className="mt-2 p-3 bg-muted rounded-md">
														<p className="text-sm italic">{log.comments}</p>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="documents">
					<Card>
						<CardHeader>
							<CardTitle>Loan Documents</CardTitle>
							<CardDescription>
								View and download documents related to your loan
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loan.loanDocuments.length === 0 ? (
								<div className="text-center py-6">
									<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										No documents have been uploaded for this loan yet.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{loan.loanDocuments.map((doc) => (
										<Card key={doc.id} className="overflow-hidden">
											<CardHeader className="pb-2">
												<CardTitle className="text-lg">
													{doc.documentType}
												</CardTitle>
												<CardDescription>
													Uploaded on {formatDate(doc.uploadDate)}
												</CardDescription>
											</CardHeader>
											<CardFooter className="pt-2">
												<a
													href={doc.documentUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="w-full">
													<Button variant="outline" className="w-full">
														View Document
													</Button>
												</a>
											</CardFooter>
										</Card>
									))}
								</div>
							)}
						</CardContent>
						<CardFooter>
							<Link href="/member/kyc">
								<Button variant="outline">
									<FileText className="mr-2 h-4 w-4" />
									Upload Additional Documents
								</Button>
							</Link>
						</CardFooter>
					</Card>
				</TabsContent>

				{/* <Card>
					<CardHeader>
						<CardTitle>Repayment Schedule</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Due Date</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loanDetail.loanRepayments.map((repayment) => (
									<TableRow key={repayment.id}>
										<TableCell>
											{new Date(repayment.repaymentDate).toLocaleDateString()}
										</TableCell>
										<TableCell>${repayment.amount.toFixed(2)}</TableCell>
										<TableCell>
											<Badge className={getStatusColor(repayment.status)}>
												{repayment.status}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card> */}
			</Tabs>
		</div>
	);
}
