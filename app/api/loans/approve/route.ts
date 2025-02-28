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

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session || session.role === "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { loanId, status, comments } = await req.json();

		const loan = await prisma.loan.findUnique({
			where: { id: Number(loanId) },
			include: {
				approvalLogs: { orderBy: { approvalOrder: "desc" }, take: 1 },
			},
		});

		if (!loan) {
			return NextResponse.json({ error: "Loan not found" }, { status: 404 });
		}

		const lastApproval = loan.approvalLogs[0];
		if (
			approvalOrder[session.role as UserRole] !==
			(lastApproval?.approvalOrder || 0) + 1
		) {
			return NextResponse.json(
				{ error: "Invalid approval order" },
				{ status: 400 }
			);
		}

		const newStatus: LoanApprovalStatus =
			status === "APPROVED" ? "APPROVED" : "REJECTED";

		const updatedLoan = await prisma.loan.update({
			where: { id: loanId },
			data: {
				status: newStatus,
				approvalLogs: {
					create: {
						approvedByUserId: session.id,
						role: session.role as UserRole,
						status: newStatus,
						approvalOrder: approvalOrder[session.role as UserRole],
						comments,
					} as any,
				},
			},
		});

		// If final approval by Finance Admin, change status to DISBURSED
		if (session.role === "FINANCE_ADMIN" && status === "APPROVED") {
			await prisma.loan.update({
				where: { id: loanId },
				data: { status: "DISBURSED" },
			});
		}

		return NextResponse.json(updatedLoan);
	} catch (error) {
		console.error("Error approving loan:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// import { type NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getUserFromRequest } from "@/lib/auth";
// import { UserRole, LoanApprovalStatus } from "@prisma/client";

// const approvalOrder: { [key in UserRole]: number } = {
// 	MEMBER: 0,
// 	LOAN_OFFICER: 1,
// 	BRANCH_MANAGER: 2,
// 	REGIONAL_MANAGER: 3,
// 	FINANCE_ADMIN: 4,
// };

// export async function POST(req: NextRequest) {
// 	const user = await getUserFromRequest(req);
// 	if (!user || user.role === UserRole.MEMBER) {
// 		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 	}

// 	const body = await req.json();
// 	const { loanId, status, comments } = body;

// 	try {
// 		const loan = await prisma.loan.findUnique({
// 			where: { id: loanId },
// 			include: {
// 				approvalLogs: { orderBy: { approvalOrder: "desc" }, take: 1 },
// 			},
// 		});

// 		if (!loan) {
// 			return NextResponse.json({ error: "Loan not found" }, { status: 404 });
// 		}

// 		const lastApproval = loan.approvalLogs[0];
// 		if (approvalOrder[user.role] !== lastApproval.approvalOrder + 1) {
// 			return NextResponse.json(
// 				{ error: "Invalid approval order" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Check if the user has the required role for the current approval step
// 		if (
// 			!hasRequiredRoleForApproval(user.role, lastApproval.approvalOrder + 1)
// 		) {
// 			return NextResponse.json(
// 				{ error: "Unauthorized for this approval step" },
// 				{ status: 401 }
// 			);
// 		}

// 		const newStatus: LoanApprovalStatus =
// 			status === "APPROVED"
// 				? LoanApprovalStatus.APPROVED
// 				: LoanApprovalStatus.REJECTED;

// 		const updatedLoan = await prisma.loan.update({
// 			where: { id: loanId },
// 			data: {
// 				status: newStatus,
// 				approvalLogs: {
// 					create: {
// 						approvedByUserId: user.id,
// 						role: user.role,
// 						status: newStatus,
// 						approvalOrder: approvalOrder[user.role],
// 						comments,
// 					} as any,
// 				},
// 			},
// 		});

// 		// If final approval by Finance Admin, change status to DISBURSED
// 		if (user.role === UserRole.FINANCE_ADMIN && status === "APPROVED") {
// 			await prisma.loan.update({
// 				where: { id: loanId },
// 				data: { status: LoanApprovalStatus.DISBURSED },
// 			});
// 		}

// 		return NextResponse.json(updatedLoan);
// 	} catch (error) {
// 		console.error("Error approving loan:", error);
// 		return NextResponse.json(
// 			{ error: "Failed to approve loan" },
// 			{ status: 500 }
// 		);
// 	}
// }

// function hasRequiredRoleForApproval(
// 	role: UserRole,
// 	approvalStep: number
// ): boolean {
// 	switch (approvalStep) {
// 		case 1:
// 			return role === UserRole.LOAN_OFFICER;
// 		case 2:
// 			return role === UserRole.BRANCH_MANAGER;
// 		case 3:
// 			return role === UserRole.REGIONAL_MANAGER;
// 		case 4:
// 			return role === UserRole.FINANCE_ADMIN;
// 		default:
// 			return false;
// 	}
// }
