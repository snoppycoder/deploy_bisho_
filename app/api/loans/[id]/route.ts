import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await getSession();
	if (!session || session.role === "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const loanId = Number.parseInt(params.id, 10);

	try {
		const loan = await prisma.loan.findUnique({
			where: { id: loanId },
			include: {
				member: {
					select: {
						name: true,
						etNumber: true,
						user: {
							select: {
								email: true,
								phone: true,
							},
						},
					},
				},
				approvalLogs: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
					orderBy: {
						approvalOrder: "asc",
					},
				},
				loanRepayments: {
					orderBy: {
						repaymentDate: "asc",
					},
				},
				loanDocuments: {
					select: {
						id: true,
						documentType: true,
						documentUrl: true,
						fileName: true,
						uploadDate: true,
					},
				},
			},
		});

		if (!loan) {
			return NextResponse.json({ error: "Loan not found" }, { status: 404 });
		}

		// Restructure the data to match the frontend expectations
		const restructuredLoan = {
			...loan,
			member: {
				...loan.member,
				email: loan.member.user?.email,
				phone: loan.member.user?.phone,
			},
		};

		return NextResponse.json(restructuredLoan);
	} catch (error) {
		console.error("Error fetching loan details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch loan details" },
			{ status: 500 }
		);
	}
}
