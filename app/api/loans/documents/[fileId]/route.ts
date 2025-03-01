import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
	req: NextRequest,
	{ params }: { params: { fileId: string } }
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const fileId = params.fileId;
		const document = await prisma.loanDocument.findFirst({
			where: {
				documentUrl: `/api/loans/documents/${fileId}`,
			},
		});

		if (!document) {
			return NextResponse.json(
				{ error: "Document not found" },
				{ status: 404 }
			);
		}

		// Create a response with the file content
		const response = new NextResponse(document.documentContent);

		// Set the appropriate headers
		response.headers.set("Content-Type", document.mimeType);
		response.headers.set(
			"Content-Disposition",
			`inline; filename="${document.fileName}"`
		);

		return response;
	} catch (error) {
		console.error("Error retrieving document:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve document" },
			{ status: 500 }
		);
	}
}
