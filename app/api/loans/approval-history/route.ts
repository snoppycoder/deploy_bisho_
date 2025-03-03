import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (!session || session.role === "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const searchParams = req.nextUrl.searchParams;
	const search = searchParams.get("search") || "";
	const status = searchParams.get("status") || "ALL";
	const fromDate = searchParams.get("fromDate");
	const toDate = searchParams.get("toDate");
	const page = Number.parseInt(searchParams.get("page") || "1", 10);
	const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10);

	try {
		const where: Prisma.LoanApprovalLogWhereInput = {
			OR: [
				{ loan: { id: { equals: Number.parseInt(search) || undefined } } },
				{
					loan: { member: { name: { contains: search, mode: "insensitive" } } },
				},
				{ user: { name: { contains: search, mode: "insensitive" } } },
			],
			...(status !== "ALL" && {
				status: status as Prisma.EnumLoanApprovalStatusFilter,
			}),
			...(fromDate &&
				toDate && {
					approvalDate: {
						gte: new Date(fromDate),
						lte: new Date(toDate),
					},
				}),
		};

		const [approvalLogs, totalCount] = await Promise.all([
			prisma.loanApprovalLog.findMany({
				where,
				include: {
					loan: {
						select: {
							id: true,
							amount: true,
							status: true,
							member: {
								select: {
									name: true,
									etNumber: true,
								},
							},
						},
					},
					user: {
						select: {
							name: true,
						},
					},
				},
				orderBy: [{ loanId: "asc" }, { approvalOrder: "asc" }],
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.loanApprovalLog.count({ where }),
		]);

		const formattedLogs = approvalLogs.map((log) => ({
			id: log.id,
			loanId: log.loanId,
			loanAmount: log.loan.amount,
			loanStatus: log.loan.status,
			memberName: log.loan.member.name,
			memberEtNumber: log.loan.member.etNumber,
			approvedBy: log.user.name,
			approverRole: log.role,
			status: log.status,
			approvalOrder: log.approvalOrder,
			comments: log.comments,
			approvalDate: log.approvalDate,
		}));

		return NextResponse.json({
			logs: formattedLogs,
			totalCount,
			totalPages: Math.ceil(totalCount / pageSize),
		});
	} catch (error) {
		console.error("Error fetching approval history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch approval history" },
			{ status: 500 }
		);
	}
}
