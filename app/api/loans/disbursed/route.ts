import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
	const session = await getSession();
	if (!session || session.role === "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const disbursedLoans = await prisma.loan.findMany({
			where: {
				status: "DISBURSED",
			},
			include: {
				member: {
					select: {
						name: true,
						etNumber: true,
					},
				},
				loanRepayments: {
					select: {
						id: true,
						amount: true,
						repaymentDate: true,
						status: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(disbursedLoans);
	} catch (error) {
		console.error("Error fetching disbursed loans:", error);
		return NextResponse.json(
			{ error: "Failed to fetch disbursed loans" },
			{ status: 500 }
		);
	}
}
