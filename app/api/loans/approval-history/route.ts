import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (!session || session.role === "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const approvalLogs = await prisma.loanApprovalLog.findMany({
			include: {
				loan: {
					select: {
						id: true,
						amount: true,
						status: true,
						member: {
							select: {
								name: true,
								etNumber: true,
							},
						},
					},
				},
				user: {
					select: {
						name: true,
					},
				},
			},
			orderBy: [{ loanId: "asc" }, { approvalOrder: "asc" }],
		});

		const formattedLogs = approvalLogs.map((log) => ({
			id: log.id,
			loanId: log.loanId,
			loanAmount: log.loan.amount,
			loanStatus: log.loan.status,
			memberName: log.loan.member.name,
			memberEtNumber: log.loan.member.etNumber,
			approvedBy: log.user.name,
			approverRole: log.role,
			status: log.status,
			approvalOrder: log.approvalOrder,
			comments: log.comments,
			approvalDate: log.approvalDate,
		}));

		return NextResponse.json(formattedLogs);
	} catch (error) {
		console.error("Error fetching approval history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch approval history" },
			{ status: 500 }
		);
	}
}
