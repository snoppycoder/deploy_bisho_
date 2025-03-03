import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
	const session = await getSession();
	if (!session || !["ADMIN", "FINANCE_ADMIN"].includes(session.role)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const requests = await prisma.membershipRequest.findMany({
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(requests);
	} catch (error) {
		console.error("Error fetching membership requests:", error);
		return NextResponse.json(
			{ error: "Failed to fetch membership requests" },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	const session = await getSession();
	if (!session || !["ADMIN", "FINANCE_ADMIN"].includes(session.role)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { name, email, phone, department, memberNumber } = await req.json();

		// const newMember = await prisma.member.create({
		// 	data: {
		// 		name,
		// 		etNumber:"",
		// 		memberNumber,
		// 		division: department, // Assuming division is equivalent to department
		// 		user: {
		// 			create: {
		// 				name,
		// 				email,
		// 				phone,
		// 				password: "defaultPassword", // You should implement a secure password generation or reset mechanism
		// 				role: "MEMBER",
		// 			},
		// 		},
		// 	},
		// });

		// return NextResponse.json(newMember);
	} catch (error) {
		console.error("Error creating member:", error);
		return NextResponse.json(
			{ error: "Failed to create member" },
			{ status: 500 }
		);
	}
}
