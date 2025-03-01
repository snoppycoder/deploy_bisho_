import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (
		!session ||
		![
			"LOAN_OFFICER",
			"BRANCH_MANAGER",
			"REGIONAL_MANAGER",
			"FINANCE_ADMIN",
		].includes(session.role)
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const documents = await prisma.loanDocument.findMany({
			select: {
				id: true,
				loanId: true,
				documentType: true,
				fileName: true,
				uploadDate: true,
				documentUrl: true,
			},
			orderBy: { uploadDate: "desc" },
		});
		return NextResponse.json(documents);
	} catch (error) {
		console.error("Error fetching loan documents:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (
		!session ||
		![
			"LOAN_OFFICER",
			"BRANCH_MANAGER",
			"REGIONAL_MANAGER",
			"FINANCE_ADMIN",
		].includes(session.role)
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;
		const documentType = formData.get("documentType") as string;
		const loanId = Number(formData.get("loanId"));

		if (!file || !documentType || !loanId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const buffer = await file.arrayBuffer();
		const fileContent = Buffer.from(buffer);

		// Generate a unique document URL
		const documentUrl = `/api/loans/documents/${Date.now()}-${file.name}`;

		const document = await prisma.loanDocument.create({
			data: {
				loanId,
				documentType,
				fileName: file.name,
				mimeType: file.type,
				documentContent: fileContent,
				uploadedByUserId: session.id,
				documentUrl, // Add the documentUrl field
			} as any,
		});

		return NextResponse.json({
			success: true,
			documentId: document.id,
			documentUrl: document.documentUrl,
		});
	} catch (error) {
		console.error("Error uploading loan document:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
