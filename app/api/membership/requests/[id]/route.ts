import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getSession();
	if (!session || !["ADMIN", "FINANCE_ADMIN"].includes(session.role)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { status } = await req.json();
		const id = Number.parseInt(params.id);

		const updatedRequest = await prisma.membershipRequest.update({
			where: { id },
			data: { status },
		});

		return NextResponse.json(updatedRequest);
	} catch (error) {
		console.error("Error updating membership request:", error);
		return NextResponse.json(
			{ error: "Failed to update membership request" },
			{ status: 500 }
		);
	}
}
