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
		const loanApplications = await prisma.loan.findMany({
			where: { member: { etNumber: Number.parseInt(params.etNumber) } },
			orderBy: { createdAt: "desc" },
			// include: { loan: true },
		});

		return NextResponse.json(loanApplications);
	} catch (error) {
		console.error("Error fetching loan applications:", error);
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
		const { amount, purpose, term } = data;

		const newLoanApplication = await prisma.loan.create({
			data: {
				amount,
				// purpose,
				// term,
				status: "PENDING",
				member: { connect: { etNumber: Number.parseInt(params.etNumber) } },
			} as any,
		});

		return NextResponse.json(newLoanApplication, { status: 201 });
	} catch (error) {
		console.error("Error creating loan application:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
