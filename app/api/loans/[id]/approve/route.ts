import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendNotification } from "@/lib/notifications";

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = params;
	const { status, comments } = await request.json();

	try {
		const loan = await prisma.loan.findUnique({
			where: { id: Number.parseInt(id) },
			include: { member: true },
		});

		if (!loan) {
			return NextResponse.json({ error: "Loan not found" }, { status: 404 });
		}

		const updatedLoan = await prisma.loan.update({
			where: { id: Number.parseInt(id) },
			data: {
				status,
				approvalLogs: {
					create: {
						approvedByUserId: session.id,
						role: session.role,
						status,
						approvalOrder: 1, // This should be determined based on the approval workflow
						comments,
					},
				},
			},
		});

		// Send notification to the member
		await sendNotification({
			userId: loan.member.userId,
			title: "Loan Status Update",
			message: `Your loan application status has been updated to ${status}.`,
			type: "LOAN_STATUS_UPDATE",
		});

		// If the loan is approved, send notification to finance admin for disbursement
		if (status === "APPROVED") {
			const financeAdmins = await prisma.user.findMany({
				where: { role: "FINANCE_ADMIN" },
			});

			for (const admin of financeAdmins) {
				await sendNotification({
					userId: admin.id,
					title: "Loan Ready for Disbursement",
					message: `A loan (ID: ${loan.id}) has been approved and is ready for disbursement.`,
					type: "LOAN_DISBURSEMENT_READY",
				});
			}
		}

		return NextResponse.json(updatedLoan);
	} catch (error) {
		console.error("Error updating loan:", error);
		return NextResponse.json(
			{ error: "Failed to update loan" },
			{ status: 500 }
		);
	}
}
