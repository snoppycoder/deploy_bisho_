import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LoanApprovalStatus } from "@prisma/client";

export async function GET() {
	try {
		const totalMembers = await prisma.member.count();
		const activeLoanCount = await prisma.loan.count({
			where: { status: "DISBURSED" as LoanApprovalStatus },
		});
		const totalSavings = await prisma.savings.aggregate({
			_sum: { amount: true },
		});
		const pendingApprovals = await prisma.loan.count({
			where: { status: "PENDING" as LoanApprovalStatus },
		});

		const loanStatusDistribution = await prisma.loan.groupBy({
			by: ["status"],
			_count: true,
		});

		const formattedLoanStatusDistribution = loanStatusDistribution.map(
			(item) => ({
				name: item.status,
				value: item._count,
			})
		);

		return NextResponse.json({
			totalMembers,
			activeLoanCount,
			totalSavings: totalSavings._sum.amount || 0,
			pendingApprovals,
			loanStatusDistribution: formattedLoanStatusDistribution,
		});
	} catch (error) {
		console.error("Error fetching dashboard data:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
