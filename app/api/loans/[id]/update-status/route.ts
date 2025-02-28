import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { UserRole, LoanApprovalStatus } from "@prisma/client";

const approvalOrder: { [key in UserRole]: number } = {
	MEMBER: 0,
	LOAN_OFFICER: 1,
	BRANCH_MANAGER: 2,
	REGIONAL_MANAGER: 3,
	FINANCE_ADMIN: 4,
};

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await getSession();
	if (!session || !session.id || session.role === "MEMBER") {
		console.log("Unauthorized access attempt or invalid session");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const loanId = Number.parseInt(params.id, 10);
	const { status, comments } = await req.json();

	console.log(
		`Updating loan ${loanId} to status ${status} with comments: ${comments}`
	);

	try {
		const loan = await prisma.loan.findUnique({
			where: { id: loanId },
			include: {
				approvalLogs: {
					orderBy: { approvalOrder: "desc" },
					take: 1,
				},
			},
		});

		if (!loan) {
			console.log(`Loan with id ${loanId} not found`);
			return NextResponse.json({ error: "Loan not found" }, { status: 404 });
		}

		if (loan.status === "DISBURSED" || loan.status === "REJECTED") {
			console.log(
				`Cannot update loan ${loanId} as it is already in a final state: ${loan.status}`
			);
			return NextResponse.json(
				{ error: "Loan is already in a final state" },
				{ status: 400 }
			);
		}

		const lastApproval = loan.approvalLogs[0];
		const currentApprovalOrder = approvalOrder[session.role as UserRole];

		console.log(
			`Last approval order: ${lastApproval?.approvalOrder}, Current approval order: ${currentApprovalOrder}`
		);

		if (lastApproval && currentApprovalOrder <= lastApproval.approvalOrder) {
			console.log(
				`Invalid approval order. Last: ${lastApproval.approvalOrder}, Current: ${currentApprovalOrder}`
			);
			return NextResponse.json(
				{ error: "Invalid approval order" },
				{ status: 400 }
			);
		}

		// Determine the new loan status based on the user's role and the selected status
		let newLoanStatus: LoanApprovalStatus = status as LoanApprovalStatus;
		if (status === "APPROVED") {
			if (session.role === "FINANCE_ADMIN") {
				newLoanStatus = "DISBURSED";
			} else {
				newLoanStatus = "APPROVED";
			}
		}

		// Update loan status and create approval log
		const updatedLoan = await prisma.loan.update({
			where: { id: loanId },
			data: {
				status: newLoanStatus,
				approvalLogs: {
					create: {
						approvedByUserId: session.id,
						role: session.role as UserRole,
						status: status as LoanApprovalStatus,
						approvalOrder: currentApprovalOrder,
						comments: comments,
					},
				},
			},
		});

		console.log(
			`Loan ${loanId} updated successfully. New status: ${newLoanStatus}`
		);

		return NextResponse.json(updatedLoan);
	} catch (error) {
		console.error("Error updating loan status:", error);
		return NextResponse.json(
			{
				error: "Failed to update loan status",
				details: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
