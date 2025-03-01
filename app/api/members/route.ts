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

	let effectiveDate: Date | null = null;
	let startDate: Date | null = null;
	let endDate: Date | null = null;

	if (effectiveDateStr) {
		effectiveDate = parseISO(effectiveDateStr);
		startDate = startOfMonth(effectiveDate);
		endDate = endOfMonth(effectiveDate);
	}

	try {
		const members = await prisma.member.findMany({
			include: {
				balance: true,
				savings: {
					where: effectiveDate
						? {
								savingsDate: {
									gte: startDate,
									lte: endDate,
								},
						  }
						: undefined,
					orderBy: { savingsDate: "desc" },
				},
				transactions: {
					where: effectiveDate
						? {
								transactionDate: {
									gte: startDate,
									lte: endDate,
								},
						  }
						: undefined,
					orderBy: { transactionDate: "desc" },
				},
				loans: {
					where: effectiveDate
						? {
								createdAt: {
									lte: endDate,
								},
						  }
						: undefined,
					include: {
						loanRepayments: {
							where: effectiveDate
								? {
										repaymentDate: {
											gte: startDate,
											lte: endDate,
										},
								  }
								: undefined,
							orderBy: { repaymentDate: "desc" },
						},
					},
					orderBy: { createdAt: "desc" },
				},
			},
		} as any);

		const formattedMembers = members.map((member: any) => {
			const totalSavings = member.savings.reduce(
				(sum: any, saving: any) => sum + Number(saving.amount),
				0
			);
			const totalContributions = member.transactions
				.filter((t: any) => t.type === "SAVINGS" || t.type === "LOAN_REPAYMENT")
				.reduce((sum: any, t: any) => sum + Number(t.amount), 0);
			const loanRepayments = member.loans.flatMap(
				(loan: any) => loan.loanRepayments
			);
			const totalLoanRepayments = loanRepayments.reduce(
				(sum: any, repayment: any) => sum + repayment.amount,
				0
			);

			return {
				id: member.id,
				memberNumber: member.memberNumber,
				etNumber: member.etNumber,
				name: member.name,
				division: member.division,
				department: member.department,
				section: member.section,
				group: member.group,
				effectiveDate: effectiveDate ? effectiveDate.toISOString() : null,
				balance: {
					totalSavings: totalSavings,
					totalContributions: totalContributions,
					membershipFee: member.balance?.membershipFee || 0,
					willingDeposit: member.balance?.willingDeposit || 0,
					loanRepayments: totalLoanRepayments,
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
