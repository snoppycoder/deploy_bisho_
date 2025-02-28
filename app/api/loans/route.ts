import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (!session || session.role === "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const loans = await prisma.loan.findMany({
			include: {
				member: {
					select: {
						name: true,
					},
				},
			},
		});

		return NextResponse.json(loans);
	} catch (error) {
		console.error("Error fetching loans:", error);
		return NextResponse.json(
			{ error: "Failed to fetch loans" },
			{ status: 500 }
		);
	}
}
