import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
	const session = await getSession();
	if (!session || session.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Get member data with balance and active loans
		const member = await prisma.member.findUnique({
			where: { id: session.id },
			include: {
				balance: true,
				loans: {
					where: {
						status: {
							in: ["PENDING", "VERIFIED", "APPROVED", "DISBURSED"],
						},
					},
				},
			},
		});

		if (!member) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// Calculate member's monthly salary (this should come from member data)
		// For now, we'll use a placeholder - in real implementation, this should be stored in the member record
		const monthlySalary = 15000; // This should be fetched from member.salary or similar field

		const totalContribution = member.balance?.totalContributions || 0;
		const hasActiveLoan = member.loans.length > 0;

		return NextResponse.json({
			totalContribution: Number(totalContribution),
			monthlySalary,
			hasActiveLoan,
		});
	} catch (error) {
		console.error("Error fetching member loan eligibility:", error);
		return NextResponse.json(
			{ error: "Failed to fetch member loan eligibility" },
			{ status: 500 }
		);
	}
}
