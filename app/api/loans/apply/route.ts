import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
	const session = await getSession();
	console.log("SESSION");
	if (!session || session.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await req.formData();
		const amount = formData.get("amount");
		const interestRate = formData.get("interestRate");
		const tenureMonths = formData.get("tenureMonths");
		const remarks = formData.get("remarks");
		const agreement = formData.get("agreement") as File;

		if (!amount || !interestRate || !tenureMonths || !agreement) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		console.log({ amount, userId: session.id });

		// // Fetch the member associated with the user
		const member = await prisma.member.findUnique({
			where: { id: session.id },
		});

		if (!member) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// // Read the file content
		const fileContent = await agreement.arrayBuffer();
		const buffer = Buffer.from(fileContent);

		// Generate a unique identifier for the file
		const fileId = `${Date.now()}-${agreement.name}`;

		// Create the loan application in the database
		const loan = await prisma.loan.create({
			data: {
				memberId: member.id, // Use the member's ID, not the user's ID
				amount: Number.parseFloat(amount as string),
				interestRate: Number.parseFloat(interestRate as string),
				tenureMonths: Number.parseInt(tenureMonths as string, 10),
				status: "PENDING",
				loanDocuments: {
					create: {
						documentType: "AGREEMENT",
						// uploadedByUserId: session.id,
						uploadedByUserId: 1,
						documentContent: buffer,
						fileName: agreement.name,
						mimeType: agreement.type,
						documentUrl: `/api/loans/documents/${fileId}`,
					},
				},
				approvalLogs: {
					create: {
						approvedByUserId: 1,
						role: "MEMBER",
						status: "PENDING",
						approvalOrder: 0,
						comments: remarks as string,
					},
				},
			} as any,
		});

		// // Create a notification for the loan officer
		await prisma.notification.create({
			data: {
				userId: 1, // This should be the loan officer's ID in a real scenario
				title: "New Loan Application",
				message: `A new loan application has been submitted by ${member.name}`,
				type: "LOAN_APPLICATION_SUBMITTED",
			} as any,
		});

		return NextResponse.json({ success: true, loanId: loan.id });
	} catch (error) {
		console.error("Error processing loan application:", error);
		return NextResponse.json(
			{ error: "Failed to process loan application" },
			{ status: 500 }
		);
	}
}
