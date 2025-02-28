import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
	req: NextRequest,
	{ params }: { params: { etNumber: string } }
) {
	const user = await getUserFromRequest(req);
	if (
		!user ||
		user.role !== "MEMBER" ||
		user?.etNumber?.toString() !== params.etNumber
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const member = await prisma.member.findUnique({
			where: { etNumber: Number.parseInt(params.etNumber) },
			include: {
				savings: true,
				transactions: {
					orderBy: { createdAt: "desc" },
					take: 10, // Limit to last 10 transactions
				},
			},
		});

		if (!member) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		const totalSavings = member.savings.reduce(
			(sum, saving) => sum + Number(saving.amount),
			0
		);

		return NextResponse.json({
			totalSavings,
			recentTransactions: member.transactions,
		});
	} catch (error) {
		console.error("Error fetching savings and transactions:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
