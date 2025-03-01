import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await getSession();
	if (
		!session ||
		![
			"LOAN_OFFICER",
			"BRANCH_MANAGER",
			"REGIONAL_MANAGER",
			"FINANCE_ADMIN",
			"MEMBER",
		].includes(session.role)
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const documentId = params.id.split("-")[0]; // Extract the document ID from the URL
		const document = await prisma.loanDocument.findUnique({
			where: { id: Number.parseInt(documentId) },
		});

		if (!document) {
			return NextResponse.json(
				{ error: "Document not found" },
				{ status: 404 }
			);
		}

		// If the user is a member, check if they have access to this document
		if (session.role === "MEMBER") {
			const loan = await prisma.loan.findUnique({
				where: { id: document.loanId },
				select: { memberId: true },
			});

			if (!loan || loan.memberId !== session.etNumber) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			}
		}

		const response = new NextResponse(document.documentContent);
		response.headers.set("Content-Type", document.mimeType);
		response.headers.set(
			"Content-Disposition",
			`inline; filename="${document.fileName}"`
		);
		return response;
	} catch (error) {
		console.error("Error fetching document:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
