import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const session = await getSession();

	if (!session || session.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const loans = await prisma.loan.findMany({
			where: {
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
					},
					orderBy: {
						repaymentDate: "asc",
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(loans);
	} catch (error) {
		console.error("Error fetching member loans:", error);
		return NextResponse.json(
			{ error: "Failed to fetch loans" },
			{ status: 500 }
		);
	}
}
