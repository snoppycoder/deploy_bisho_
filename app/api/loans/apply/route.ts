import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
// import { writeFile } from "fs/promises";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session || session.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await req.formData();
		const amount = formData.get("amount");
		const interestRate = formData.get("interestRate");
		const tenureMonths = formData.get("tenureMonths");
		const purpose = formData.get("purpose");
		const coSigner1 = formData.get("coSigner1");
		const coSigner2 = formData.get("coSigner2");
		const agreement = formData.get("agreement") as File;

		if (!amount || !interestRate || !tenureMonths || !purpose || !agreement) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Fetch the member associated with the user
		// const member = await prisma.member.findUnique({
		// 	where: { memberI: session.id },
		// });

		const member = await prisma.member.findUnique({
			where: { id: session.id },
		});

		if (!member) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// Generate a unique filename for the agreement
		const fileExtension = path.extname(agreement.name);
		const fileName = `loan_agreement_${Date.now()}_${
			member.id
		}${fileExtension}`;
		const uploadDir = path.join(process.cwd(), "public", "loan_agreements");
		const filePath = path.join(uploadDir, fileName);

		// Create the upload directory if it doesn't exist
		try {
			await mkdir(uploadDir, { recursive: true });
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
				throw err;
			}
		}

		// // Generate a unique filename for the agreement
		// const fileExtension = path.extname(agreement.name);
		// const fileName = `loan_agreement_${Date.now()}_${
		// 	member.id
		// }${fileExtension}`;
		// const filePath = path.join(
		// 	process.cwd(),
		// 	"public",
		// 	"loan_agreements",
		// 	fileName
		// );

		// Read the file content and write it to the public directory
		const fileContent = await agreement.arrayBuffer();
		await writeFile(filePath, Buffer.from(fileContent));

		// Generate the public URL for the uploaded document
		const documentUrl = `/loan_agreements/${fileName}`;

		// // Read the file content and write it to the public directory
		// const fileContent = await agreement.arrayBuffer();
		// await writeFile(filePath, Buffer.from(fileContent));

		// // Generate the public URL for the uploaded document
		// const documentUrl = `/loan_agreements/${fileName}`;

		// Create the loan application in the database
		const loan = await prisma.loan.create({
			data: {
				memberId: member.id,
				amount: Number.parseFloat(amount as string),
				remainingAmount: Number.parseFloat(amount as string),
				interestRate: Number.parseFloat(interestRate as string),
				tenureMonths: Number.parseInt(tenureMonths as string, 10),
				status: "PENDING",
				// purpose: purpose as string,
				// coSigner1Id: coSigner1
				// 	? Number.parseInt(coSigner1 as string, 10)
				// 	: null,
				// coSigner2Id: coSigner2
				// 	? Number.parseInt(coSigner2 as string, 10)
				// 	: null,
				loanDocuments: {
					create: {
						documentType: "AGREEMENT",
						documentContent: "",
						uploadedByUserId: 1,
						fileName: fileName,
						mimeType: agreement.type,
						documentUrl: documentUrl,
					} as any,
				},

				approvalLogs: {
					create: {
						approvedByUserId: 1,
						role: "MEMBER",
						status: "PENDING",
						approvalOrder: 0,
						comments: "Loan application submitted",
					} as any,
				},
			},
		});

		// Create a notification for the loan officer
		await prisma.notification.create({
			data: {
				userId: 1, // This should be the loan officer's ID in a real scenario
				title: "New Loan Application",
				message: `A new loan application has been submitted by ${member.name}`,
				type: "LOAN_APPLICATION_SUBMITTED",
			} as any,
		});

		return NextResponse.json({
			success: true,
			loanId: loan.id,
			documentUrl: documentUrl,
		});
	} catch (error) {
		console.error("Error processing loan application:", error);
		return NextResponse.json(
			{ error: "Failed to process loan application" },
			{ status: 500 }
		);
	}
}

// import { type NextRequest, NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";
// import prisma from "@/lib/prisma";

// export async function POST(req: NextRequest) {
// 	const session = await getSession();
// 	console.log("SESSION");
// 	if (!session || session.role !== "MEMBER") {
// 		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 	}

// 	try {
// 		const formData = await req.formData();
// 		const amount = formData.get("amount");
// 		const interestRate = formData.get("interestRate");
// 		const tenureMonths = formData.get("tenureMonths");
// 		const remarks = formData.get("remarks");
// 		const agreement = formData.get("agreement") as File;

// 		if (!amount || !interestRate || !tenureMonths || !agreement) {
// 			return NextResponse.json(
// 				{ error: "Missing required fields" },
// 				{ status: 400 }
// 			);
// 		}

// 		console.log({ amount, userId: session.id });

// 		// // Fetch the member associated with the user
// 		const member = await prisma.member.findUnique({
// 			where: { id: session.id },
// 		});

// 		if (!member) {
// 			return NextResponse.json({ error: "Member not found" }, { status: 404 });
// 		}

// 		// // Read the file content
// 		const fileContent = await agreement.arrayBuffer();
// 		const buffer = Buffer.from(fileContent);

// 		// Generate a unique identifier for the file
// 		const fileId = `${Date.now()}-${agreement.name}`;

// 		// Create the loan application in the database
// 		const loan = await prisma.loan.create({
// 			data: {
// 				memberId: member.id, // Use the member's ID, not the user's ID
// 				amount: Number.parseFloat(amount as string),
// 				remainingAmount: Number.parseFloat(amount as string),
// 				interestRate: Number.parseFloat(interestRate as string),
// 				tenureMonths: Number.parseInt(tenureMonths as string, 10),
// 				status: "PENDING",
// 				loanDocuments: {
// 					create: {
// 						documentType: "AGREEMENT",
// 						// uploadedByUserId: session.id,
// 						uploadedByUserId: 1,
// 						documentContent: buffer,
// 						fileName: agreement.name,
// 						mimeType: agreement.type,
// 						documentUrl: `/api/loans/documents/${fileId}`,
// 					},
// 				},
// 				approvalLogs: {
// 					create: {
// 						approvedByUserId: 1,
// 						role: "MEMBER",
// 						status: "PENDING",
// 						approvalOrder: 0,
// 						comments: remarks as string,
// 					},
// 				},
// 			} as any,
// 		});

// 		// Create a notification for the loan officer
// 		await prisma.notification.create({
// 			data: {
// 				userId: 1, // This should be the loan officer's ID in a real scenario
// 				title: "New Loan Application",
// 				message: `A new loan application has been submitted by ${member.name}`,
// 				type: "LOAN_APPLICATION_SUBMITTED",
// 			},
// 		});

// 		return NextResponse.json({ success: true, loanId: loan.id });
// 	} catch (error) {
// 		console.error("Error processing loan application:", error);
// 		return NextResponse.json(
// 			{ error: "Failed to process loan application" },
// 			{ status: 500 }
// 		);
// 	}
// }
