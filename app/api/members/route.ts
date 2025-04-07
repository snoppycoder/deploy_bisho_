import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(request.url);
	const effectiveDateStr = url.searchParams.get("effectiveDate");

	let effectiveDate: Date;
	let startDate: Date;
	let endDate: Date;

	if (effectiveDateStr) {
		effectiveDate = parseISO(effectiveDateStr);
	} else {
		effectiveDate = new Date(); // Use current date if no effectiveDate is provided
	}

	startDate = startOfMonth(effectiveDate);
	endDate = endOfMonth(effectiveDate);

	console.log("API: Effective Date:", effectiveDate.toISOString()); // Debug log
	console.log("API: Start Date:", startDate.toISOString()); // Debug log
	console.log("API: End Date:", endDate.toISOString()); // Debug log

	try {
		const members = await prisma.member.findMany({
			include: {
				balance: true,
				savings: {
					where: {
						savingsDate: {
							gte: startDate,
							lte: endDate,
						},
					},
					orderBy: { savingsDate: "desc" },
				},
				transactions: {
					where: {
						transactionDate: {
							gte: startDate,
							lte: endDate,
						},
					},
					orderBy: { transactionDate: "desc" },
				},
				loans: {
					where: {
						createdAt: {
							lte: endDate,
						},
					},
					include: {
						loanRepayments: {
							where: {
								repaymentDate: {
									gte: startDate,
									lte: endDate,
								},
							},
							orderBy: { repaymentDate: "desc" },
						},
					},
					orderBy: { createdAt: "desc" },
				},
			},
		});

		// Update the formattedMembers mapping function to correctly filter transactions by type
		const formattedMembers = members.map((member) => {
			// Find the most recent transaction for each type within the month
			const savingsTransaction = member.transactions.find(
				(t) => t.type === "SAVINGS"
			);
			const membershipFeeTransaction = member.transactions.find(
				(t) => t.type === "MEMBERSHIP_FEE"
			);
			const willingDepositTransaction = member.transactions.find(
				(t) => t.type === "WILLING_DEPOSIT"
			);
			const loanRepaymentTransaction = member.transactions.find(
				(t) => t.type === "LOAN_REPAYMENT"
			);

			// Calculate total contributions (sum of savings and loan repayments)
			const totalContributions =
				(savingsTransaction ? Number(savingsTransaction.amount) : 0) +
				(loanRepaymentTransaction
					? Number(loanRepaymentTransaction.amount)
					: 0);

			return {
				id: member.id,
				memberNumber: member.memberNumber,
				etNumber: member.etNumber,
				name: member.name,
				division: member.division,
				department: member.department,
				section: member.section,
				group: member.group,
				effectiveDate: startDate.toISOString(),
				balance: {
					totalSavings: savingsTransaction
						? Number(savingsTransaction.amount)
						: 0,
					totalContributions: totalContributions,
					membershipFee: membershipFeeTransaction
						? Number(membershipFeeTransaction.amount)
						: 0,
					willingDeposit: willingDepositTransaction
						? Number(willingDepositTransaction.amount)
						: 0,
					loanRepayments: loanRepaymentTransaction
						? Number(loanRepaymentTransaction.amount)
						: 0,
				},
			};
		});

		return NextResponse.json(formattedMembers);
	} catch (error) {
		console.error("Error fetching members:", error);
		return NextResponse.json(
			{ error: "Failed to fetch members" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const {
			memberNumber,
			etNumber,
			name,
			division,
			department,
			section,
			group,
		} = body;

		const newMember = await prisma.member.create({
			data: {
				memberNumber: Number.parseInt(memberNumber),
				etNumber: Number.parseInt(etNumber),
				name,
				division,
				department,
				section,
				group,
				balance: {
					create: {
						totalSavings: 0,
						totalContributions: 0,
					},
				},
			},
			include: {
				balance: true,
			},
		});

		return NextResponse.json(newMember);
	} catch (error) {
		console.error("Error creating member:", error);
		return NextResponse.json(
			{ error: "Failed to create member" },
			{ status: 500 }
		);
	}
}
