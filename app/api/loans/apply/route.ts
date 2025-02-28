import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { LoanApprovalStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
	const user = await getUserFromRequest(req);
	if (!user || user.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const { amount, interestRate, tenureMonths } = body;

	try {
		const loan = await prisma.loan.create({
			data: {
				memberId: Number(user.id),
				amount,
				interestRate,
				tenureMonths: Number(tenureMonths),
				status: "PENDING" as LoanApprovalStatus,
			},
		});

		// Create initial approval log
		await prisma.loanApprovalLog.create({
			data: {
				loanId: loan.id,
				approvedByUserId: user.id,
				role: "MEMBER",
				status: "PENDING",
				approvalOrder: 0,
				comments: "Loan application submitted",
			} as any,
		});

		return NextResponse.json(loan);
	} catch (error) {
		console.error("Error creating loan:", error);
		return NextResponse.json(
			{ error: "Failed to create loan" },
			{ status: 500 }
		);
	}
}
