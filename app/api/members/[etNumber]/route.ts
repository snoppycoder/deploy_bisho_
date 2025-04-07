import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { LoanApprovalStatus } from "@prisma/client";

export async function GET(
	request: NextRequest,
	{ params }: { params: { etNumber: string } }
) {
	// Add cache control headers to prevent caching
	const headers = new Headers({
		"Cache-Control": "no-cache, no-store, must-revalidate",
		"Pragma": "no-cache",
		"Expires": "0",
	});

	const session = await getSession();
	if (!session) {
		return NextResponse.json(
			{ error: "Unauthorized" },
			{ status: 401, headers }
		);
	}

	const etNumber = Number.parseInt(params.etNumber, 10);
	if (isNaN(etNumber)) {
		return NextResponse.json(
			{ error: "Invalid ET Number format" },
			{ status: 400, headers }
		);
	}

	try {
		const member = await prisma.member.findUnique({
			where: { etNumber },
			include: {
				balance: true,
				savings: {
					orderBy: { savingsDate: "desc" },
				},
				loans: {
					include: {
						loanRepayments: {
							orderBy: { repaymentDate: "desc" },
						},
					},
					orderBy: { createdAt: "desc" },
				},
				transactions: {
					orderBy: { transactionDate: "desc" },
				},
			},
		});

		if (!member) {
			return NextResponse.json(
				{ error: "Member not found" },
				{ status: 404, headers }
			);
		}

		// Define transaction types for better maintainability
		const TransactionType = {
			SAVINGS: "SAVINGS",
			MEMBERSHIP_FEE: "MEMBERSHIP_FEE",
			LOAN_REPAYMENT: "LOAN_REPAYMENT",
			WILLING_DEPOSIT: "WILLING_DEPOSIT",
			REGISTRATION_FEE: "REGISTRATION_FEE",
			COST_OF_SHARE: "COST_OF_SHARE",
		};

		// Helper function to calculate total amount for a specific transaction type
		const calculateTotalByType = (type: any) => {
			return member.transactions
				.filter((transaction) => transaction.type === type)
				.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
		};

		// Helper function to get the latest transaction of a specific type
		const getLatestTransactionByType = (type: any) => {
			return member.transactions
				.filter((transaction) => transaction.type === type)
				.sort(
					(a, b) =>
						new Date(b.transactionDate).getTime() -
						new Date(a.transactionDate).getTime()
				)[0];
		};

		// Calculate financial metrics
		const totalSavings = calculateTotalByType(TransactionType.SAVINGS);
		const totalLoanRepayment = calculateTotalByType(
			TransactionType.LOAN_REPAYMENT
		);
		const totalMembershipFee = calculateTotalByType(
			TransactionType.MEMBERSHIP_FEE
		);
		const totalWillingDeposit = calculateTotalByType(
			TransactionType.WILLING_DEPOSIT
		);
		const totalRegistrationFee = calculateTotalByType(
			TransactionType.REGISTRATION_FEE
		);
		const totalCostOfShare = calculateTotalByType(
			TransactionType.COST_OF_SHARE
		);

		// Calculate total contributions
		const contributionTypes = [
			TransactionType.SAVINGS,
			TransactionType.MEMBERSHIP_FEE,
			TransactionType.LOAN_REPAYMENT,
			TransactionType.WILLING_DEPOSIT,
		];

		const totalContributions = member.transactions
			.filter((transaction) => contributionTypes.includes(transaction.type))
			.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

		// Get latest transactions
		const lastSavingsTransaction = getLatestTransactionByType(
			TransactionType.SAVINGS
		);
		const lastContributionTransaction = member.transactions
			.filter((transaction) => contributionTypes.includes(transaction.type))
			.sort(
				(a, b) =>
					new Date(b.transactionDate).getTime() -
					new Date(a.transactionDate).getTime()
			)[0];

		// Calculate loan metrics
		const activeLoans = member.loans.filter(
			(loan) => loan.status === ("DISBURSED" as LoanApprovalStatus)
		).length;

		const totalLoanAmount = member.loans
			.filter((loan) => loan.status === ("DISBURSED" as LoanApprovalStatus))
			.reduce((sum, loan) => sum + Number(loan.amount), 0);

		// Find next payment due
		const nextPayment =
			member.loans
				.filter((loan) => loan.status === ("DISBURSED" as LoanApprovalStatus))
				.flatMap((loan) => loan.loanRepayments)
				.filter((repayment) => repayment.status === "PENDING")
				.sort(
					(a, b) =>
						new Date(a.repaymentDate).getTime() -
						new Date(b.repaymentDate).getTime()
				)[0] || null;

		// Prepare chart data
		const prepareChartData = (transactions: any, type: any) => {
			return transactions
				.filter((transaction: any) => transaction.type === type)
				.map((transaction: any) => ({
					date: transaction.transactionDate,
					amount: Number(transaction.amount),
				}))
				.sort(
					(a: any, b: any) =>
						new Date(a.date).getTime() - new Date(b.date).getTime()
				);
		};

		const savingsHistory = prepareChartData(
			member.transactions,
			TransactionType.SAVINGS
		);
		const loanRepaymentHistory = prepareChartData(
			member.transactions,
			TransactionType.LOAN_REPAYMENT
		);

		// Group transactions by type for pie chart
		const transactionsByType = member.transactions.reduce(
			(acc, transaction) => {
				const type = transaction.type;
				if (!acc[type]) {
					acc[type] = 0;
				}
				acc[type] += Number(transaction.amount);
				return acc;
			},
			{} as Record<string, number>
		);

		// Calculate loan repayment progress
		const loanRepaymentProgress = member.loans
			.filter((loan) => loan.status === ("DISBURSED" as LoanApprovalStatus))
			.map((loan) => {
				const totalRepaid = loan.loanRepayments
					.filter((repayment) => repayment.status === "PAID")
					.reduce((sum, repayment) => sum + Number(repayment.amount), 0);

				const remainingAmount = Number(loan.amount) - totalRepaid;
				const progress = (totalRepaid / Number(loan.amount)) * 100;

				return {
					loanId: loan.id,
					loanAmount: Number(loan.amount),
					totalRepaid,
					remainingAmount,
					progress: isNaN(progress) ? 0 : progress,
				};
			});

		return NextResponse.json(
			{
				member: {
					...member,
					totalSavings,
					totalContributions,
					totalLoanRepayment,
					totalMembershipFee,
					totalWillingDeposit,
					totalRegistrationFee,
					totalCostOfShare,
					activeLoans,
					totalLoanAmount,
					nextPayment,
					lastSavingsAmount: lastSavingsTransaction?.amount || 0,
					lastContributionAmount: lastContributionTransaction?.amount || 0,
					savingsHistory,
					loanRepaymentHistory,
					transactionsByType,
					loanRepaymentProgress,
				},
			},
			{ headers }
		);
	} catch (error) {
		console.error("Error fetching member details:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch member details",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500, headers }
		);
	}
}
