import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const members = await prisma.member.findMany({
			include: {
				balance: true,
			},
		});
		return NextResponse.json(members);
	} catch (error) {
		console.error("Error fetching members:", error);
		return NextResponse.json(
			{ error: "Failed to fetch members" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const {
			memberNumber,
			etNumber,
			name,
			division,
			department,
			section,
			group,
		} = body;

		const newMember = await prisma.member.create({
			data: {
				memberNumber: Number.parseInt(memberNumber),
				etNumber: Number.parseInt(etNumber),
				name,
				division,
				department,
				section,
				group,
				balance: {
					create: {
						totalSavings: 0,
						totalContributions: 0,
					},
				},
			},
			include: {
				balance: true,
			},
		});

		return NextResponse.json(newMember);
	} catch (error) {
		console.error("Error creating member:", error);
		return NextResponse.json(
			{ error: "Failed to create member" },
			{ status: 500 }
		);
	}
}
