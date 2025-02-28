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
		user.etNumber?.toString() !== params.etNumber
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// const membershipRequests = await prisma.membershipRequest.findMany({
		// 	where: { member: { etNumber: Number.parseInt(params.etNumber) } },
		// 	orderBy: { createdAt: "desc" },
		// });
		// return NextResponse.json(membershipRequests);
	} catch (error) {
		console.error("Error fetching membership requests:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(
	req: NextRequest,
	{ params }: { params: { etNumber: string } }
) {
	const user = await getUserFromRequest(req);
	if (
		!user ||
		user.role !== "MEMBER" ||
		user.etNumber?.toString() !== params.etNumber
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const data = await req.json();
		const { type, details } = data;

		// const newMembershipRequest = await prisma.membershipRequest.create({
		// 	data: {
		// 		type,
		// 		details,
		// 		status: "PENDING",
		// 		member: { connect: { etNumber: Number.parseInt(params.etNumber) } },
		// 	},
		// });

		// return NextResponse.json(newMembershipRequest, { status: 201 });
	} catch (error) {
		console.error("Error creating membership request:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
