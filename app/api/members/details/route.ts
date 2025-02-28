import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
	try {
		const session = await getSession();

		if (!session || !session.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const memberDetails = await prisma.member.findUnique({
			where: { id: session.id },
			include: {
				user: true,
				loans: true,
				savings: true,
				// Include other related data as needed
			},
		});

		if (!memberDetails) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		return NextResponse.json({ memberDetails });
	} catch (error) {
		console.error("Error fetching member details:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
