import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const members = await prisma.member.findMany({
			include: {
				balance: true,
				savings: {
					orderBy: { savingsDate: "desc" },
					take: 1,
				},
				loans: {
					where: { status: "DISBURSED" },
					orderBy: { createdAt: "desc" },
					take: 1,
					include: {
						loanRepayments: {
							orderBy: { repaymentDate: "desc" },
							take: 1,
						},
					},
				},
				transactions: {
					orderBy: { transactionDate: "desc" },
					take: 7, // One for each transaction type
				},
			},
		});

		const exportData = members.map((member) => ({
			"Location Category": "", // You may need to add this field to your schema if required
			"Location": "", // You may need to add this field to your schema if required
			"Employee Number": member.memberNumber,
			"ET Number": member.etNumber,
			"Assignment Number": "", // You may need to add this field to your schema if required
			"Name": member.name,
			"Division": member.division,
			"Department": member.department,
			"Section": member.section,
			"Group": member.group,
			"Assignment": "", // You may need to add this field to your schema if required
			"Status": "", // You may need to add this field to your schema if required
			"Effective Date":
				member.savings[0]?.savingsDate.toISOString().split("T")[0] || "",
			"Credit Association Savings": member.savings[0]?.amount || 0,
			"Credit Association Membership Fee":
				member.transactions.find((t) => t.type === "MEMBERSHIP_FEE")?.amount ||
				0,
			"Credit Association Registration Fee":
				member.transactions.find((t) => t.type === "REGISTRATION_FEE")
					?.amount || 0,
			"Credit Association Cost of Share":
				member.transactions.find((t) => t.type === "COST_OF_SHARE")?.amount ||
				0,
			"Credit Association Loan Repayment":
				member.loans[0]?.loanRepayments[0]?.amount || 0,
			"Credit Association Purchases":
				member.transactions.find((t) => t.type === "PURCHASE")?.amount || 0,
			"Credit Association Willing Deposit":
				member.transactions.find((t) => t.type === "WILLING_DEPOSIT")?.amount ||
				0,
			"Total": member.balance?.totalSavings || 0,
		}));

		return NextResponse.json(exportData);
	} catch (error) {
		console.error("Error exporting members:", error);
		return NextResponse.json(
			{ error: "Failed to export members" },
			{ status: 500 }
		);
	}
}
