import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const { name, email, phone, etNumber, department } = await req.json();

		// if (!prisma.membershipRequest) {
		// 	console.error("prisma.membershipRequest is undefined");
		// 	return NextResponse.json(
		// 		{ error: "MembershipRequest model not found in Prisma client" },
		// 		{ status: 500 }
		// 	);
		// }

		const membershipRequest = await prisma.membershipRequest.create({
			data: {
				name,
				email,
				phone,
				// etNumber: Number.parseInt(etNumber),
				department,
				status: "PENDING",
			},
		});

		return NextResponse.json(membershipRequest, { status: 201 });
	} catch (error) {
		console.error("Error creating membership request:", error);
		return NextResponse.json(
			{
				error: "Failed to create membership request",
				details: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
