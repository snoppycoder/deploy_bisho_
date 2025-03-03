import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await getSession();

	if (!session || session.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const loanId = Number.parseInt(params.id, 10);

	if (isNaN(loanId)) {
		return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
	}

	try {
		const loan = await prisma.loan.findUnique({
			where: {
				id: loanId,
				memberId: session.id,
			},
			include: {
				approvalLogs: {
					select: {
						id: true,
						status: true,
						approvalDate: true,
						comments: true,
						role: true,
					},
					orderBy: {
						approvalDate: "desc",
					},
				},
				loanRepayments: {
					select: {
						id: true,
						amount: true,
						repaymentDate: true,
						reference: true,
						sourceType: true,
						status: true,
					},
					orderBy: {
						repaymentDate: "asc",
					},
				},
				loanDocuments: {
					select: {
						id: true,
						documentType: true,
						documentUrl: true,
						uploadDate: true,
					},
					orderBy: {
						uploadDate: "desc",
					},
				},
			},
		});

		if (!loan) {
			return NextResponse.json({ error: "Loan not found" }, { status: 404 });
		}

		return NextResponse.json(loan);
	} catch (error) {
		console.error("Error fetching loan details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch loan details" },
			{ status: 500 }
		);
	}
}
