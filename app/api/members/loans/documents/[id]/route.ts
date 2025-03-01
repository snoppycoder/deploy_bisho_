import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await getSession();
	if (!session || session.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const documentId = Number.parseInt(params.id);

	try {
		const document = await prisma.loanDocument.findFirst({
			where: {
				id: documentId,
				loan: {
					memberId: session.etNumber,
				},
			},
		});

		if (!document) {
			return NextResponse.json(
				{ error: "Document not found" },
				{ status: 404 }
			);
		}

		const response = new NextResponse(document.documentContent);
		response.headers.set("Content-Type", document.mimeType);
		response.headers.set(
			"Content-Disposition",
			`attachment; filename="${document.fileName}"`
		);
		return response;
	} catch (error) {
		console.error("Error fetching member loan document:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
