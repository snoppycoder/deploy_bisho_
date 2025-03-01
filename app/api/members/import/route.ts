// import { type NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { Transaction } from "@prisma/client";

// interface MemberData {
// 	"Location Category": string;
// 	"Location": string;
// 	"Employee Number": number;
// 	"ET Number": number;
// 	"Assignment Number": number;
// 	"Name": string;
// 	"Division": string;
// 	"Department"?: string;
// 	"Section": string;
// 	"Group": string;
// 	"Assignment Status": string;
// 	"Effective Date": number;
// 	"Credit Association Savings": number;
// 	"Credit Association Membership Fee": number;
// 	"Credit Association Registration Fee": number;
// 	"Credit Association Cost of Share": number;
// 	"Credit Association Loan Repayment": number;
// 	"Credit Association Purchases": number;
// 	"Credit Association Willing Deposit": number;
// 	"Total": number;
// }

// export async function POST(request: NextRequest) {
// 	try {
// 		const membersData: MemberData[] = await request.json();

// 		const importedCount = await prisma.$transaction(async (prisma) => {
// 			let count = 0;

// 			for (const memberData of membersData) {
// 				const memberNumber = memberData["Employee Number"];
// 				const etNumber = memberData["ET Number"];

// 				if (isNaN(memberNumber) || isNaN(etNumber)) {
// 					console.error(
// 						`Invalid member number or ET number for member: ${memberData.Name}`
// 					);
// 					continue;
// 				}

// 				const jsDate = new Date(
// 					(memberData["Effective Date"] - 25569) * 86400 * 1000
// 				);

// 				// Upsert member
// 				const member = await prisma.member.upsert({
// 					where: { memberNumber },
// 					update: {
// 						etNumber,
// 						name: memberData.Name,
// 						division: memberData.Division,
// 						department: memberData.Department || null,
// 						section: memberData.Section,
// 						group: memberData.Group,
// 					},
// 					create: {
// 						memberNumber,
// 						etNumber,
// 						name: memberData.Name,
// 						division: memberData.Division,
// 						department: memberData.Department || null,
// 						section: memberData.Section,
// 						group: memberData.Group,
// 					},
// 				});
// 				// Update Savings
// 				await prisma.savings.create({
// 					data: {
// 						memberId: member.id,
// 						amount: memberData["Credit Association Savings"],
// 						savingsDate: jsDate,
// 					},
// 				});

// 				// Calculate total contributions
// 				const totalContributions =
// 					memberData["Credit Association Savings"] +
// 					memberData["Credit Association Cost of Share"] +
// 					memberData["Credit Association Willing Deposit"] +
// 					memberData["Credit Association Loan Repayment"];

// 				// Create or update MemberBalance
// 				await prisma.memberBalance.upsert({
// 					where: { memberId: member.id },
// 					update: {
// 						totalSavings: {
// 							increment: memberData["Credit Association Savings"],
// 						},
// 						costOfShare: {
// 							increment: memberData["Credit Association Cost of Share"],
// 						},
// 						registrationFee: {
// 							increment: memberData["Credit Association Registration Fee"],
// 						},
// 						membershipFee: {
// 							increment: memberData["Credit Association Membership Fee"],
// 						},
// 						willingDeposit: {
// 							increment: memberData["Credit Association Willing Deposit"],
// 						},
// 						totalContributions: { increment: totalContributions },
// 					},
// 					create: {
// 						memberId: member.id,
// 						totalSavings: memberData["Credit Association Savings"],
// 						costOfShare: memberData["Credit Association Cost of Share"],
// 						registrationFee: memberData["Credit Association Registration Fee"],
// 						membershipFee: memberData["Credit Association Membership Fee"],
// 						willingDeposit: memberData["Credit Association Willing Deposit"],
// 						totalContributions: totalContributions,
// 					},
// 				});

// 				// Create transactions
// 				const transactions = [
// 					{ type: "SAVINGS", amount: memberData["Credit Association Savings"] },
// 					{
// 						type: "MEMBERSHIP_FEE",
// 						amount: memberData["Credit Association Membership Fee"],
// 					},
// 					{
// 						type: "REGISTRATION_FEE",
// 						amount: memberData["Credit Association Registration Fee"],
// 					},
// 					{
// 						type: "COST_OF_SHARE",
// 						amount: memberData["Credit Association Cost of Share"],
// 					},
// 					{
// 						type: "LOAN_REPAYMENT",
// 						amount: memberData["Credit Association Loan Repayment"],
// 					},
// 					{
// 						type: "PURCHASE",
// 						amount: memberData["Credit Association Purchases"],
// 					},
// 					{
// 						type: "WILLING_DEPOSIT",
// 						amount: memberData["Credit Association Willing Deposit"],
// 					},
// 				];

// 				await prisma.transaction.createMany({
// 					data: transactions
// 						.filter((t) => t.amount > 0)
// 						.map((t) => ({
// 							memberId: member.id,
// 							type: t.type as Transaction["type"],
// 							amount: t.amount,
// 							transactionDate: jsDate,
// 						})),
// 				});

// 				count++;
// 			}

// 			return count;
// 		});

// 		return NextResponse.json({ importedCount });
// 	} catch (error: any) {
// 		console.error("Error importing members:", error);
// 		return NextResponse.json(
// 			{ error: "Failed to import members", details: error.message },
// 			{ status: 500 }
// 		);
// 	}
// }

// export async function POST(request: NextRequest) {
// 	try {
// 		const membersData: MemberData[] = await request.json();

// 		let importedCount = 0;
// 		const errors: string[] = [];

// 		for (const memberData of membersData) {
// 			try {
// 				const memberNumber = memberData["Employee Number"];
// 				const etNumber = memberData["ET Number"];

// 				if (isNaN(memberNumber) || isNaN(etNumber)) {
// 					throw new Error(
// 						`Invalid member number or ET number for member: ${memberData.Name}`
// 					);
// 				}

// 				// Convert Excel date to JavaScript Date
// 				const excelDate = memberData["Effective Date"];
// 				const jsDate = new Date((excelDate - 25569) * 86400 * 1000);

// 				// Check if member already exists
// 				let member = await prisma.member.findFirst({
// 					where: {
// 						OR: [{ memberNumber }, { etNumber }],
// 					},
// 				});

// 				if (!member) {
// 					// Create new member if not exists
// 					member = await prisma.member.create({
// 						data: {
// 							memberNumber,
// 							etNumber,
// 							name: memberData.Name,
// 							division: memberData.Division,
// 							department: memberData.Department || null,
// 							section: memberData.Section,
// 							group: memberData.Group,
// 						},
// 					});
// 				} else {
// 					// Update existing member
// 					await prisma.member.update({
// 						where: { id: member.id },
// 						data: {
// 							name: memberData.Name,
// 							division: memberData.Division,
// 							department: memberData.Department || null,
// 							section: memberData.Section,
// 							group: memberData.Group,
// 						},
// 					});
// 				}

// 				// Update Savings
// 				await prisma.savings.create({
// 					data: {
// 						memberId: member.id,
// 						amount: memberData["Credit Association Savings"],
// 						savingsDate: jsDate,
// 					},
// 				});

// 				// Calculate total contributions
// 				const totalContributions =
// 					memberData["Credit Association Savings"] +
// 					memberData["Credit Association Cost of Share"] +
// 					memberData["Credit Association Willing Deposit"] +
// 					memberData["Credit Association Loan Repayment"];

// 				// Update MemberBalance
// 				await prisma.memberBalance.upsert({
// 					where: { memberId: member.id },
// 					update: {
// 						totalSavings: {
// 							increment: memberData["Credit Association Savings"],
// 						},
// 						costOfShare: {
// 							increment: memberData["Credit Association Cost of Share"],
// 						},
// 						registrationFee: {
// 							increment: memberData["Credit Association Registration Fee"],
// 						},
// 						membershipFee: {
// 							increment: memberData["Credit Association Membership Fee"],
// 						},
// 						willingDeposit: {
// 							increment: memberData["Credit Association Willing Deposit"],
// 						},
// 						totalContributions: { increment: totalContributions },
// 					},
// 					create: {
// 						memberId: member.id,
// 						totalSavings: memberData["Credit Association Savings"],
// 						costOfShare: memberData["Credit Association Cost of Share"],
// 						registrationFee: memberData["Credit Association Registration Fee"],
// 						membershipFee: memberData["Credit Association Membership Fee"],
// 						willingDeposit: memberData["Credit Association Willing Deposit"],
// 						totalContributions: totalContributions,
// 					},
// 				});

// 				// Handle Loan Repayment
// 				if (memberData["Credit Association Loan Repayment"] > 0) {
// 					const loan = await prisma.loan.findFirst({
// 						where: { memberId: member.id, status: "DISBURSED" },
// 						orderBy: { createdAt: "desc" },
// 					});

// 					if (loan) {
// 						await prisma.loanRepayment.create({
// 							data: {
// 								loanId: loan.id,
// 								amount: memberData["Credit Association Loan Repayment"],
// 								repaymentDate: jsDate,
// 								sourceType: "ERP_PAYROLL",
// 							},
// 						});
// 					}
// 				}

// 				// Create Transactions
// 				const transactions = [
// 					{ type: "SAVINGS", amount: memberData["Credit Association Savings"] },
// 					{
// 						type: "MEMBERSHIP_FEE",
// 						amount: memberData["Credit Association Membership Fee"],
// 					},
// 					{
// 						type: "REGISTRATION_FEE",
// 						amount: memberData["Credit Association Registration Fee"],
// 					},
// 					{
// 						type: "COST_OF_SHARE",
// 						amount: memberData["Credit Association Cost of Share"],
// 					},
// 					{
// 						type: "LOAN_REPAYMENT",
// 						amount: memberData["Credit Association Loan Repayment"],
// 					},
// 					{
// 						type: "PURCHASE",
// 						amount: memberData["Credit Association Purchases"],
// 					},
// 					{
// 						type: "WILLING_DEPOSIT",
// 						amount: memberData["Credit Association Willing Deposit"],
// 					},
// 				];

// 				for (const transaction of transactions) {
// 					if (transaction.amount > 0) {
// 						await prisma.transaction.create({
// 							data: {
// 								memberId: member.id,
// 								type: transaction.type as Transaction["type"],
// 								amount: transaction.amount,
// 								transactionDate: jsDate,
// 							},
// 						});
// 					}
// 				}

// 				importedCount++;
// 			} catch (error: any) {
// 				console.error(`Error processing member: ${memberData.Name}`, error);
// 				errors.push(
// 					`Failed to import member ${memberData.Name}: ${error.message}`
// 				);
// 			}
// 		}

// 		return NextResponse.json({ importedCount, errors });
// 	} catch (error: any) {
// 		console.error("Error importing members:", error);
// 		return NextResponse.json(
// 			{ error: "Failed to import members", details: error.message },
// 			{ status: 500 }
// 		);
// 	}
// }

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LoanApprovalStatus, TransactionType } from "@prisma/client";

interface MemberData {
	"Location Category": string;
	"Location": string;
	"Employee Number": number;
	"ET Number": number;
	"Assignment Number": number;
	"Name": string;
	"Division": string;
	"Department"?: string;
	"Section": string;
	"Group": string;
	"Assignment Status": string;
	"Effective Date": number;
	"Credit Association Savings": number;
	"Credit Association Membership Fee": number;
	"Credit Association Registration Fee": number;
	"Credit Association Cost of Share": number;
	"Credit Association Loan Repayment": number;
	"Credit Association Purchases": number;
	"Credit Association Willing Deposit": number;
	"Total": number;
}

export async function POST(request: NextRequest) {
	try {
		const membersData: MemberData[] = await request.json();

		const importedCount = await prisma.$transaction(async (prisma) => {
			let count = 0;

			for (const memberData of membersData) {
				const memberNumber = memberData["Employee Number"];
				const etNumber = memberData["ET Number"];

				if (isNaN(memberNumber) || isNaN(etNumber)) {
					console.error(
						`Invalid member number or ET number for member: ${memberData.Name}`
					);
					continue;
				}

				const jsDate = new Date(
					(memberData["Effective Date"] - 25569) * 86400 * 1000
				);

				// Upsert member
				const member = await prisma.member.upsert({
					where: { etNumber },
					update: {
						etNumber,
						name: memberData.Name,
						division: memberData.Division,
						department: memberData.Department || null,
						section: memberData.Section,
						group: memberData.Group,
					},
					create: {
						memberNumber,
						etNumber,
						name: memberData.Name,
						division: memberData.Division,
						department: memberData.Department || null,
						section: memberData.Section,
						group: memberData.Group,
					},
				});

				// Create or update MemberBalance
				await prisma.memberBalance.upsert({
					where: { memberId: member.id },
					update: {
						totalSavings: {
							increment: memberData["Credit Association Savings"],
						},
						costOfShare: {
							increment: memberData["Credit Association Cost of Share"],
						},
						registrationFee: {
							increment: memberData["Credit Association Registration Fee"],
						},
						membershipFee: {
							increment: memberData["Credit Association Membership Fee"],
						},
						willingDeposit: {
							increment: memberData["Credit Association Willing Deposit"],
						},
						totalContributions: {
							increment:
								memberData["Credit Association Purchases"] +
								memberData["Credit Association Loan Repayment"],
						},
					},
					create: {
						memberId: member.id,
						totalSavings: memberData["Credit Association Savings"],
						costOfShare: memberData["Credit Association Cost of Share"],
						registrationFee: memberData["Credit Association Registration Fee"],
						membershipFee: memberData["Credit Association Membership Fee"],
						willingDeposit: memberData["Credit Association Willing Deposit"],
						totalContributions:
							memberData["Credit Association Purchases"] +
							memberData["Credit Association Loan Repayment"],
					},
				});

				// Handle loan repayment
				if (memberData["Credit Association Loan Repayment"] > 0) {
					try {
						await handleLoanRepayment(
							prisma,
							member.id,
							memberData["Credit Association Loan Repayment"],
							jsDate
						);
					} catch (error) {
						console.error(
							`Error processing loan repayment for member ${member.name}:`,
							error
						);
						// Consider how you want to handle this error (e.g., continue processing other members or throw)
					}
				}

				// Create transactions
				const transactions = [
					{ type: "SAVINGS", amount: memberData["Credit Association Savings"] },
					{
						type: "MEMBERSHIP_FEE",
						amount: memberData["Credit Association Membership Fee"],
					},
					{
						type: "REGISTRATION_FEE",
						amount: memberData["Credit Association Registration Fee"],
					},
					{
						type: "COST_OF_SHARE",
						amount: memberData["Credit Association Cost of Share"],
					},
					{
						type: "LOAN_REPAYMENT",
						amount: memberData["Credit Association Loan Repayment"],
					},
					{
						type: "PURCHASE",
						amount: memberData["Credit Association Purchases"],
					},
					{
						type: "WILLING_DEPOSIT",
						amount: memberData["Credit Association Willing Deposit"],
					},
				];

				await prisma.transaction.createMany({
					data: transactions
						.filter((t) => t.amount > 0)
						.map((t) => ({
							memberId: member.id,
							type: t.type as TransactionType,
							amount: t.amount,
							transactionDate: jsDate,
						})),
				});

				count++;
			}

			return count;
		});

		return NextResponse.json({ importedCount });
	} catch (error: any) {
		console.error("Error importing members:", error);
		return NextResponse.json(
			{ error: "Failed to import members", details: error.message },
			{ status: 500 }
		);
	}
}

async function handleLoanRepayment(
	prisma: any,
	memberId: number,
	repaymentAmount: number,
	repaymentDate: Date
) {
	// Find the active (DISBURSED) loan for the member
	const activeLoan = await prisma.loan.findFirst({
		where: {
			memberId: memberId,
			status: LoanStatus.DISBURSED,
		},
		include: {
			loanRepayments: {
				orderBy: { repaymentDate: "asc" },
				where: { status: "PENDING" },
			},
		},
	});

	if (!activeLoan) {
		throw new Error("No active loan found for the member");
	}

	// Find the next pending repayment
	const nextRepayment = activeLoan.loanRepayments[0];

	if (!nextRepayment) {
		throw new Error("No pending repayments found for the active loan");
	}

	// Validate repayment amount
	if (repaymentAmount < nextRepayment.amount) {
		throw new Error(
			`Repayment amount ${repaymentAmount} is less than the expected amount ${nextRepayment.amount}`
		);
	}

	// Record the repayment
	await prisma.loanRepayment.update({
		where: { id: nextRepayment.id },
		data: {
			amount: repaymentAmount,
			repaymentDate: repaymentDate,
			status: "PAID",
		},
	});

	// Create a transaction record
	await prisma.transaction.create({
		data: {
			memberId: memberId,
			type: TransactionType.LOAN_REPAYMENT,
			amount: repaymentAmount,
			transactionDate: repaymentDate,
		},
	});

	// Update loan balance
	const updatedLoanBalance = activeLoan.amount - repaymentAmount;
	await prisma.loan.update({
		where: { id: activeLoan.id },
		data: {
			amount: updatedLoanBalance,
		},
	});

	// If the loan is fully repaid, update its status
	if (updatedLoanBalance <= 0) {
		await prisma.loan.update({
			where: { id: activeLoan.id },
			data: {
				status: LoanStatus.REPAID,
			},
		});
	}
}
