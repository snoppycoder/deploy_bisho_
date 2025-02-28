import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

const approvalOrder: { [key in UserRole]: number } = {
	MEMBER: 0,
	LOAN_OFFICER: 1,
	BRANCH_MANAGER: 2,
	REGIONAL_MANAGER: 3,
	FINANCE_ADMIN: 4,
};

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (!session || session.role === "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userRole = session.role as UserRole;
		const requiredApprovalOrder = approvalOrder[userRole] - 1;

		const pendingLoans = await prisma.loan.findMany({
			where: {
				status: "PENDING",
				approvalLogs: {
					some: {
						approvalOrder: requiredApprovalOrder,
						status: "APPROVED",
					},
				},
			},
			include: {
				member: true,
				approvalLogs: {
					orderBy: { approvalOrder: "desc" },
					take: 1,
				},
			},
		});

		return NextResponse.json(pendingLoans);
	} catch (error) {
		console.error("Error fetching pending loans:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pending loans" },
			{ status: 500 }
		);
	}
}
