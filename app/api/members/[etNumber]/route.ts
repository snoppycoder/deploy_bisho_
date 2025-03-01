import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LoanApprovalStatus } from "@prisma/client";

export async function GET(
	request: NextRequest,
	{ params }: { params: { etNumber: string } }
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const etNumber = Number.parseInt(params.etNumber, 10);

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
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// Calculate total savings
		const totalSavings = member.savings.reduce(
			(sum, saving) => sum + Number(saving.amount),
			0
		);

		// Calculate total contributions
		const totalContributions = member.balance?.totalContributions || 0;

		// Calculate active loans
		const activeLoans = member.loans.filter(
			(loan) => loan.status === ("DISBURSED" as LoanApprovalStatus)
		).length;

		// Prepare fees
		const fees = member.transactions.filter((transaction) =>
			[
				"MEMBERSHIP_FEE",
				"REGISTRATION_FEE",
				"COST_OF_SHARE",
				"WILLING_DEPOSIT",
			].includes(transaction.type)
		);

		return NextResponse.json({
			member: {
				...member,
				totalSavings,
				totalContributions,
				activeLoans,
				fees,
			},
		});
	} catch (error) {
		console.error("Error fetching member details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch member details" },
			{ status: 500 }
		);
	}
}
