import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (!session || session.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const documents = await prisma.loanDocument.findMany({
			where: {
				loan: {
					memberId: session.etNumber,
				},
			},
			select: {
				id: true,
				loanId: true,
				documentType: true,
				fileName: true,
				uploadDate: true,
			},
			orderBy: { uploadDate: "desc" },
		});
		return NextResponse.json(documents);
	} catch (error) {
		console.error("Error fetching member loan documents:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
