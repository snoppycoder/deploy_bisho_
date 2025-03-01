import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
	request: NextRequest,
	{ params }: { params: { etNumber: string } }
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	// if (!session || session.role !== "MEMBER") {
	// 	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	// }

	const etNumber = Number.parseInt(params.etNumber, 10);

	// if (session.etNumber !== etNumber) {
	// 	return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	// }

	try {
		const member = await prisma.member.findUnique({
			where: { etNumber },
			include: {
				balance: true,
				savings: {
					orderBy: { savingsDate: "desc" },
					take: 5,
				},
				loans: {
					include: {
						loanRepayments: {
							orderBy: { repaymentDate: "desc" },
							take: 5,
						},
					},
					orderBy: { createdAt: "desc" },
					take: 5,
				},
				transactions: {
					orderBy: { transactionDate: "desc" },
					take: 5,
				},
			},
		});

		if (!member) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// Calculate total savings
		const totalSavings = member.savings.reduce(
			(sum, saving) => sum + (saving.amount as any),
			0
		);

		// Calculate total contributions
		const totalContributions = member.balance?.totalContributions || 0;

		// Calculate active loans
		const activeLoans = member.loans.filter(
			(loan: any) => loan.status === "ACTIVE"
		).length;

		// Calculate next payment
		const nextPayment = member.loans
			.flatMap((loan) => loan.loanRepayments)
			// .filter((repayment) => repayment.status === "PENDING")
			.sort((a, b) => a.repaymentDate.getTime() - b.repaymentDate.getTime())[0];

		return NextResponse.json({
			member: {
				...member,
				totalSavings,
				totalContributions,
				activeLoans,
				nextPayment,
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
