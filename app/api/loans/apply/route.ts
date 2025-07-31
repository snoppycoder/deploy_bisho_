import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
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

		// Validate business rules
		const loanAmount = Number.parseFloat(amount as string);
		const rate = Number.parseFloat(interestRate as string);
		const tenure = Number.parseInt(tenureMonths as string, 10);

		// Validate fixed values
		if (rate !== 9.5) {
			return NextResponse.json(
				{ error: "Interest rate must be 9.5%" },
				{ status: 400 }
			);
		}

		if (tenure !== 120) {
			return NextResponse.json(
				{ error: "Loan tenure must be 120 months (10 years)" },
				{ status: 400 }
			);
		}

		// Fetch the member with balance and active loans
		const member = await prisma.member.findUnique({
			where: { id: session.id },
			include: {
				balance: true,
				loans: {
					where: {
						status: {
							in: ["PENDING", "VERIFIED", "APPROVED", "DISBURSED"],
						},
					},
				},
			},
		});

		if (!member) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// Business rule validations
		const monthlySalary = 15000; // This should come from member data
		const maxLoanBasedOnSalary = monthlySalary * 30;
		const hasActiveLoan = member.loans.length > 0;
		const requiredContributionRate = hasActiveLoan ? 0.35 : 0.3;
		const totalContribution = Number(member.balance?.totalContributions || 0);
		const maxLoanBasedOnContribution =
			totalContribution / requiredContributionRate;
		const maxLoanAmount = Math.min(
			maxLoanBasedOnSalary,
			maxLoanBasedOnContribution
		);
		const requiredContribution = loanAmount * requiredContributionRate;

		// Validate loan amount against limits
		if (loanAmount > maxLoanAmount) {
			return NextResponse.json(
				{
					error: `Loan amount exceeds maximum limit of ${maxLoanAmount.toLocaleString()} ETB`,
				},
				{ status: 400 }
			);
		}

		// Validate contribution requirement
		if (totalContribution < requiredContribution) {
			return NextResponse.json(
				{
					error: `Insufficient contribution. Required: ${requiredContribution.toLocaleString()} ETB, Available: ${totalContribution.toLocaleString()} ETB`,
				},
				{ status: 400 }
			);
		}

		// Handle file upload
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

		// Read the file content and write it to the public directory
		const fileContent = await agreement.arrayBuffer();
		await writeFile(filePath, Buffer.from(fileContent));

		// Generate the public URL for the uploaded document
		const documentUrl = `/loan_agreements/${fileName}`;

		// Create the loan application in the database
		const loan = await prisma.loan.create({
			data: {
				memberId: member.id,
				amount: loanAmount,
				remainingAmount: loanAmount,
				interestRate: rate,
				tenureMonths: tenure,
				status: "PENDING",
				loanDocuments: {
					create: {
						documentType: "AGREEMENT",
						documentContent: "",
						uploadedByUserId: Number(process.env.ADMIN_ID || 1),
						fileName: fileName,
						mimeType: agreement.type,
						documentUrl: documentUrl,
					} as any,
				},
				approvalLogs: {
					create: {
						approvedByUserId: Number(process.env.ADMIN_ID || 1),
						role: "MEMBER",
						status: "PENDING",
						approvalOrder: 0,
						comments: `Loan application submitted. Purpose: ${purpose}. Co-signers: ${
							coSigner1 ? `ID:${coSigner1}` : "None"
						}, ${coSigner2 ? `ID:${coSigner2}` : "None"}`,
					} as any,
				},
			},
		});

		// Create a notification for the loan officer
		await prisma.notification.create({
			data: {
				userId: Number(process.env.ADMIN_ID || 1),
				title: "New Loan Application",
				message: `New loan application for ${loanAmount.toLocaleString()} ETB submitted by ${
					member.name
				}`,
				type: "LOAN_APPLICATION_SUBMITTED",
			} as any,
		});

		return NextResponse.json({
			success: true,
			loanId: loan.id,
			documentUrl: documentUrl,
			message: "Loan application submitted successfully",
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
// // import { writeFile } from "fs/promises";
// import path from "path";
// import { writeFile, mkdir } from "fs/promises";

// export async function POST(req: NextRequest) {
// 	const session = await getSession();
// 	if (!session || session.role !== "MEMBER") {
// 		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 	}

// 	try {
// 		const formData = await req.formData();
// 		const amount = formData.get("amount");
// 		const interestRate = formData.get("interestRate");
// 		const tenureMonths = formData.get("tenureMonths");
// 		const purpose = formData.get("purpose");
// 		const coSigner1 = formData.get("coSigner1");
// 		const coSigner2 = formData.get("coSigner2");
// 		const agreement = formData.get("agreement") as File;

// 		if (!amount || !interestRate || !tenureMonths || !purpose || !agreement) {
// 			return NextResponse.json(
// 				{ error: "Missing required fields" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Fetch the member associated with the user
// 		// const member = await prisma.member.findUnique({
// 		// 	where: { memberI: session.id },
// 		// });

// 		const member = await prisma.member.findUnique({
// 			where: { id: session.id },
// 		});

// 		if (!member) {
// 			return NextResponse.json({ error: "Member not found" }, { status: 404 });
// 		}

// 		// Generate a unique filename for the agreement
// 		const fileExtension = path.extname(agreement.name);
// 		const fileName = `loan_agreement_${Date.now()}_${
// 			member.id
// 		}${fileExtension}`;
// 		const uploadDir = path.join(process.cwd(), "public", "loan_agreements");
// 		const filePath = path.join(uploadDir, fileName);

// 		// Create the upload directory if it doesn't exist
// 		try {
// 			await mkdir(uploadDir, { recursive: true });
// 		} catch (err) {
// 			if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
// 				throw err;
// 			}
// 		}

// 		// // Generate a unique filename for the agreement
// 		// const fileExtension = path.extname(agreement.name);
// 		// const fileName = `loan_agreement_${Date.now()}_${
// 		// 	member.id
// 		// }${fileExtension}`;
// 		// const filePath = path.join(
// 		// 	process.cwd(),
// 		// 	"public",
// 		// 	"loan_agreements",
// 		// 	fileName
// 		// );

// 		// Read the file content and write it to the public directory
// 		const fileContent = await agreement.arrayBuffer();
// 		await writeFile(filePath, Buffer.from(fileContent));

// 		// Generate the public URL for the uploaded document
// 		const documentUrl = `/loan_agreements/${fileName}`;

// 		// // Read the file content and write it to the public directory
// 		// const fileContent = await agreement.arrayBuffer();
// 		// await writeFile(filePath, Buffer.from(fileContent));

// 		// // Generate the public URL for the uploaded document
// 		// const documentUrl = `/loan_agreements/${fileName}`;

// 		// Create the loan application in the database
// 		const loan = await prisma.loan.create({
// 			data: {
// 				memberId: member.id,
// 				amount: Number.parseFloat(amount as string),
// 				remainingAmount: Number.parseFloat(amount as string),
// 				interestRate: Number.parseFloat(interestRate as string),
// 				tenureMonths: Number.parseInt(tenureMonths as string, 10),
// 				status: "PENDING",
// 				// purpose: purpose as string,
// 				// coSigner1Id: coSigner1
// 				// 	? Number.parseInt(coSigner1 as string, 10)
// 				// 	: null,
// 				// coSigner2Id: coSigner2
// 				// 	? Number.parseInt(coSigner2 as string, 10)
// 				// 	: null,
// 				loanDocuments: {
// 					create: {
// 						documentType: "AGREEMENT",
// 						documentContent: "",
// 						uploadedByUserId: Number(process.env.ADMIN_ID),
// 						fileName: fileName,
// 						mimeType: agreement.type,
// 						documentUrl: documentUrl,
// 					} as any,
// 				},

// 				approvalLogs: {
// 					create: {
// 						approvedByUserId: Number(process.env.ADMIN_ID),
// 						role: "MEMBER",
// 						status: "PENDING",
// 						approvalOrder: 0,
// 						comments: "Loan application submitted",
// 					} as any,
// 				},
// 			},
// 		});

// 		// Create a notification for the loan officer
// 		await prisma.notification.create({
// 			data: {
// 				userId: Number(process.env.ADMIN_ID), // This should be the loan officer's ID in a real scenario
// 				title: "New Loan Application",
// 				message: `A new loan application has been submitted by ${member.name}`,
// 				type: "LOAN_APPLICATION_SUBMITTED",
// 			} as any,
// 		});

// 		return NextResponse.json({
// 			success: true,
// 			loanId: loan.id,
// 			documentUrl: documentUrl,
// 		});
// 	} catch (error) {
// 		console.error("Error processing loan application:", error);
// 		return NextResponse.json(
// 			{ error: "Failed to process loan application" },
// 			{ status: 500 }
// 		);
// 	}
// }
