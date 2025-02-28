"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemberDetails {
	id: number;
	name: string;
	memberNumber: number;
	etNumber: number;
	balance: {
		totalSavings: number;
		totalContributions: number;
		costOfShare: number;
		registrationFee: number;
		membershipFee: number;
		willingDeposit: number;
	};
	totalContribution: number;
	kycInfo: {
		email: string;
		phone: string;
		division: string;
		department: string;
		section: string;
		group: string;
	};
	ledger: {
		savings: Array<{
			id: number;
			amount: number;
			savingsDate: string;
		}>;
		fees: Array<{
			id: number;
			type: string;
			amount: number;
			transactionDate: string;
		}>;
		loans: Array<{
			id: number;
			amount: number;
			interestRate: number;
			tenureMonths: number;
			status: string;
			createdAt: string;
			repayments: Array<{
				id: number;
				amount: number;
				repaymentDate: string;
			}>;
		}>;
		otherTransactions: Array<{
			id: number;
			type: string;
			amount: number;
			transactionDate: string;
		}>;
	};
}

function MemberDetailPage() {
	const [memberDetails, setMemberDetails] = useState<MemberDetails | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		const fetchMemberDetails = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/members/${params.id}`);
				if (!response.ok) {
					throw new Error("Failed to fetch member details");
				}
				const data = await response.json();
				setMemberDetails(data.member);
			} catch (error) {
				console.error("Error fetching member details:", error);
				toast({
					title: "Error",
					description: "Failed to load member details. Please try again.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchMemberDetails();
	}, [params.id, toast]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				Loading member details...
			</div>
		);
	}

	if (!memberDetails) {
		return (
			<div className="flex justify-center items-center h-screen">
				Member not found
			</div>
		);
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-ET", {
			style: "currency",
			currency: "ETB",
		}).format(amount);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "bg-green-500";
			case "pending":
				return "bg-yellow-500";
			case "closed":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<div className="space-y-6 p-6 bg-gray-50 min-h-screen">
			<div className="flex justify-between items-center">
				<Button variant="outline" onClick={() => router.back()}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
				</Button>
				<div className="space-x-2">
					<Button variant="outline">
						<Printer className="mr-2 h-4 w-4" /> Print
					</Button>
					<Button variant="outline">
						<Download className="mr-2 h-4 w-4" /> Export
					</Button>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Member Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium text-gray-500">Name</p>
								<p className="text-lg font-semibold">{memberDetails.name}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">
									Member Number
								</p>
								<p className="text-lg font-semibold">
									{memberDetails.memberNumber}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">ET Number</p>
								<p className="text-lg font-semibold">
									{memberDetails.etNumber}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">Email</p>
								<p className="text-lg font-semibold">
									{memberDetails.kycInfo.email}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">Phone</p>
								<p className="text-lg font-semibold">
									{memberDetails.kycInfo.phone}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">Division</p>
								<p className="text-lg font-semibold">
									{memberDetails.kycInfo.division}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">Department</p>
								<p className="text-lg font-semibold">
									{memberDetails.kycInfo.department}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">Section</p>
								<p className="text-lg font-semibold">
									{memberDetails.kycInfo.section}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">Group</p>
								<p className="text-lg font-semibold">
									{memberDetails.kycInfo.group}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Financial Summary</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium text-gray-500">
									Total Savings
								</p>
								<p className="text-2xl font-bold text-green-600">
									{formatCurrency(memberDetails.balance.totalSavings)}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">
									Total Contributions
								</p>
								<p className="text-2xl font-bold text-blue-600">
									{formatCurrency(memberDetails.totalContribution)}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">
									Cost of Share
								</p>
								<p className="text-xl font-semibold text-purple-600">
									{formatCurrency(memberDetails.balance.costOfShare)}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">
									Registration Fee
								</p>
								<p className="text-xl font-semibold text-orange-600">
									{formatCurrency(memberDetails.balance.registrationFee)}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">
									Membership Fee
								</p>
								<p className="text-xl font-semibold text-indigo-600">
									{formatCurrency(memberDetails.balance.membershipFee)}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500">
									Willing Deposit
								</p>
								<p className="text-xl font-semibold text-teal-600">
									{formatCurrency(memberDetails.balance.willingDeposit)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Member Ledger</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="savings" className="space-y-4">
						<TabsList>
							<TabsTrigger value="savings">Savings</TabsTrigger>
							<TabsTrigger value="fees">Fees</TabsTrigger>
							<TabsTrigger value="loans">Loans</TabsTrigger>
							<TabsTrigger value="transactions">All Transactions</TabsTrigger>
						</TabsList>
						<TabsContent value="savings">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{memberDetails.ledger.savings.map((saving) => (
										<TableRow key={saving.id}>
											<TableCell>
												{new Date(saving.savingsDate).toLocaleDateString()}
											</TableCell>
											<TableCell>{formatCurrency(saving.amount)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TabsContent>
						<TabsContent value="fees">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{memberDetails.ledger.fees.map((fee) => (
										<TableRow key={fee.id}>
											<TableCell>
												{new Date(fee.transactionDate).toLocaleDateString()}
											</TableCell>
											<TableCell>{fee.type}</TableCell>
											<TableCell>{formatCurrency(fee.amount)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TabsContent>
						<TabsContent value="loans">
							{memberDetails.ledger.loans.map((loan) => (
								<Card key={loan.id} className="mb-4">
									<CardHeader>
										<div className="flex justify-between items-center">
											<CardTitle>Loan #{loan.id}</CardTitle>
											<Badge className={getStatusColor(loan.status)}>
												{loan.status}
											</Badge>
										</div>
										<CardDescription>
											Created on {new Date(loan.createdAt).toLocaleDateString()}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 gap-4 mb-4">
											<div>
												<p className="text-sm font-medium text-gray-500">
													Amount
												</p>
												<p className="text-lg font-semibold">
													{formatCurrency(loan.amount)}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Interest Rate
												</p>
												<p className="text-lg font-semibold">
													{loan.interestRate}%
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Tenure
												</p>
												<p className="text-lg font-semibold">
													{loan.tenureMonths} months
												</p>
											</div>
										</div>
										<h4 className="font-semibold mb-2">Repayments</h4>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Date</TableHead>
													<TableHead>Amount</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{loan.repayments.map((repayment) => (
													<TableRow key={repayment.id}>
														<TableCell>
															{new Date(
																repayment.repaymentDate
															).toLocaleDateString()}
														</TableCell>
														<TableCell>
															{formatCurrency(repayment.amount)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							))}
						</TabsContent>
						<TabsContent value="transactions">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{[
										...memberDetails.ledger.savings,
										...memberDetails.ledger.fees,
										...memberDetails.ledger.otherTransactions,
									]
										.sort(
											(a: any, b: any) =>
												new Date(b.savingsDate || b.transactionDate).getTime() -
												new Date(a.savingsDate || a.transactionDate).getTime()
										)
										.map((transaction: any) => (
											<TableRow key={transaction.id}>
												<TableCell>
													{new Date(
														transaction.savingsDate ||
															transaction.transactionDate
													).toLocaleDateString()}
												</TableCell>
												<TableCell>{transaction.type || "Savings"}</TableCell>
												<TableCell>
													{formatCurrency(transaction.amount)}
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}

export default MemberDetailPage;
