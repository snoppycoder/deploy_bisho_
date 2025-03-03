import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
	const session = await getSession();
	if (!session || session.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const memberBalance = await prisma.memberBalance.findUnique({
			where: { memberId: session.id },
			select: { totalContributions: true },
		});

		if (!memberBalance) {
			return NextResponse.json(
				{ error: "Member balance not found" },
				{ status: 404 }
			);
		}

		const totalContribution = memberBalance.totalContributions;

		return NextResponse.json({ totalContribution });
	} catch (error) {
		console.error("Error fetching member contribution:", error);
		return NextResponse.json(
			{ error: "Failed to fetch member contribution" },
			{ status: 500 }
		);
	}
}
