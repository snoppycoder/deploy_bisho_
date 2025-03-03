import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (!session || session.role === "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const searchTerm = req.nextUrl.searchParams.get("search") || "";
	const status = req.nextUrl.searchParams.get("status") || undefined;
	const sortBy = req.nextUrl.searchParams.get("sortBy") || "createdAt";
	const sortOrder = req.nextUrl.searchParams.get("sortOrder") || "desc";

	try {
		const loans = await prisma.loan.findMany({
			where: {
				OR: [
					{ member: { name: { contains: searchTerm, mode: "insensitive" } } },
					{ id: { equals: Number.parseInt(searchTerm) || undefined } },
				],
				status: status as any,
			},
			include: {
				member: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				[sortBy]: sortOrder,
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
