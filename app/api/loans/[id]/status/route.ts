import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await getSession();
	if (!session || session.role === "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const loanId = Number.parseInt(params.id, 10);
	const { status } = await req.json();

	try {
		const updatedLoan = await prisma.loan.update({
			where: { id: loanId },
			data: { status },
		});

		return NextResponse.json(updatedLoan);
	} catch (error) {
		console.error("Error updating loan status:", error);
		return NextResponse.json(
			{ error: "Failed to update loan status" },
			{ status: 500 }
		);
	}
}
