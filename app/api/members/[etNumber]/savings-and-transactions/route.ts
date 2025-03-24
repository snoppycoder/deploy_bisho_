import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
	req: NextRequest,
	{ params }: { params: { etNumber: string } }
) {
	const user = await getUserFromRequest(req);
	console.log({
		user,
	});
	if (
		!user ||
		user.role !== "MEMBER" ||
		user?.etNumber?.toString() !== params.etNumber
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Get the query parameters for filtering
		const url = new URL(req.url);
		const period = url.searchParams.get("period") || "all";
		const type = url.searchParams.get("type") || "all";

		// Calculate date range based on period
		let startDate: Date | undefined;
		const now = new Date();

		if (period === "week") {
			startDate = new Date(now);
			startDate.setDate(now.getDate() - 7);
		} else if (period === "month") {
			startDate = new Date(now);
			startDate.setMonth(now.getMonth() - 1);
		} else if (period === "year") {
			startDate = new Date(now);
			startDate.setFullYear(now.getFullYear() - 1);
		}

		// Build the where clause for transactions
		const whereClause: any = {
			memberId: Number.parseInt(params.etNumber),
		};

		if (startDate) {
			whereClause.transactionDate = {
				gte: startDate,
			} as any;
		}

		if (type !== "all") {
			whereClause.type = type;
		}

		// Fetch member data
		const member = await prisma.member.findUnique({
			where: { etNumber: Number.parseInt(params.etNumber) },
		});

		if (!member) {
			return NextResponse.json({ error: "Member not found" }, { status: 404 });
		}

		// Fetch transactions with filtering
		const transactions = await prisma.transaction.findMany({
			where: whereClause,
			orderBy: { transactionDate: "desc" },
		});

		// Calculate total savings from transactions
		const savingsTransactions = transactions.filter(
			(t: any) => t.type === "SAVINGS"
		);

		console.log({
			savingsTransactions,
		});

		const withdrawalTransactions = transactions.filter(
			(t: any) => t.type === "WITHDRAWAL"
		);

		const totalDeposits = savingsTransactions.reduce(
			(sum, t) => sum + Number(t.amount),
			0
		);

		const totalWithdrawals = withdrawalTransactions.reduce(
			(sum, t) => sum + Number(t.amount),
			0
		);

		const totalSavings = totalDeposits - totalWithdrawals;

		// Get monthly savings data for chart
		const last6Months = Array.from({ length: 6 }, (_, i) => {
			const date = new Date();
			date.setMonth(date.getMonth() - i);
			return {
				month: date.toLocaleString("default", { month: "short" }),
				year: date.getFullYear(),
				monthIndex: date.getMonth(),
				fullYear: date.getFullYear(),
			};
		}).reverse();

		const monthlySavings = await Promise.all(
			last6Months.map(async ({ month, year, monthIndex, fullYear }) => {
				const startOfMonth = new Date(fullYear, monthIndex, 1);
				const endOfMonth = new Date(fullYear, monthIndex + 1, 0);

				const monthlyDeposits = await prisma.transaction.findMany({
					where: {
						memberId: Number.parseInt(params.etNumber),
						type: { in: ["MEMBERSHIP_FEE", "WILLING_DEPOSIT", "SAVINGS"] },
						transactionDate: {
							gte: startOfMonth,
							lte: endOfMonth,
						},
					},
				});

				const monthlyWithdrawals = await prisma.transaction.findMany({
					where: {
						memberId: Number.parseInt(params.etNumber),
						type: "LOAN_REPAYMENT",
						transactionDate: {
							gte: startOfMonth,
							lte: endOfMonth,
						},
					},
				});

				const deposits = monthlyDeposits.reduce(
					(sum, t) => sum + Number(t.amount),
					0
				);
				const withdrawals = monthlyWithdrawals.reduce(
					(sum, t) => sum + Number(t.amount),
					0
				);

				return {
					month: `${month} ${year}`,
					deposits,
					withdrawals,
					net: deposits - withdrawals,
				};
			})
		);

		// Get transaction type distribution for pie chart
		const transactionTypes = await prisma.transaction.groupBy({
			by: ["type"],
			where: {
				memberId: Number.parseInt(params.etNumber),
			},
			_sum: {
				amount: true,
			},
		});

		const typeDistribution = transactionTypes.map((type) => ({
			name: type.type,
			value: Number(type._sum.amount) || 0,
		}));

		return NextResponse.json({
			totalSavings,
			totalDeposits,
			totalWithdrawals,
			recentTransactions: transactions.slice(0, 10),
			monthlySavings,
			typeDistribution,
			transactionCount: transactions.length,
		});
	} catch (error) {
		console.error("Error fetching savings and transactions:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
