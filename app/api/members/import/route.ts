import { type NextRequest, NextResponse } from "next/server";
import xmlrpc from "xmlrpc";
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

interface Account {
	id: number;
	code: string;
	name: string;
	account_type: string;
}

interface TransactionDetails {
	type: string;
	amount?: number;
	principal?: number;
	interest?: number;
	date?: string;
	reference?: string;
	journalId?: number;
}

interface JournalLineItem {
	account_id: number;
	name: string;
	debit: number;
	credit: number;
}

interface JournalEntry {
	move_type: string;
	journal_id: number;
	date: string;
	ref: string;
	line_ids: [number, number, JournalLineItem][];
}

const ODOO_CONFIG = {
	host: "116.202.104.180",
	port: 8069,
	db: "test",
	username: "admin",
	password: "admin",
	commonPath: "/xmlrpc/2/common",
	objectPath: "/xmlrpc/2/object",
};

const ACCOUNTS: Record<string, Account> = {
	cash: { id: 102, code: "211002", name: "Cash", account_type: "asset_cash" },
	bank: { id: 101, code: "211001", name: "Bank", account_type: "asset_cash" },
	tradeDebtors: {
		id: 9,
		code: "221100",
		name: "Trade Debtors",
		account_type: "asset_receivable",
	},
	suspense: {
		id: 5,
		code: "220100",
		name: "Suspense",
		account_type: "asset_receivable",
	},
	otherDeposits: {
		id: 38,
		code: "305400",
		name: "Other deposits",
		account_type: "liability_current",
	},
	commercialLoan: {
		id: 40,
		code: "310300",
		name: "Commercial Loan",
		account_type: "liability_current",
	},
	salesIncome: {
		id: 1,
		code: "110000",
		name: "Sales of Goods and Services",
		account_type: "income",
	},
	exchangeGain: {
		id: 98,
		code: "120000",
		name: "Foreign Exchange Currency Gain Account",
		account_type: "income_other",
	},
	interestExpense: {
		id: 97,
		code: "643400",
		name: "Payments of interest and bank charges on local debt",
		account_type: "expense",
	},
	feeExpense: {
		id: 81,
		code: "625600",
		name: "Fees and charges",
		account_type: "expense",
	},
	equity: {
		id: 42,
		code: "401000",
		name: "Share capital / equity",
		account_type: "equity",
	},
	undistributedProfits: {
		id: 109,
		code: "999999",
		name: "Undistributed Profits/Losses",
		account_type: "equity_unaffected",
	},
	cashDifferenceGain: {
		id: 106,
		code: "999001",
		name: "Cash Difference Gain",
		account_type: "income_other",
	},
	cashDifferenceLoss: {
		id: 107,
		code: "999002",
		name: "Cash Difference Loss",
		account_type: "expense",
	},
};

export async function POST(request: NextRequest) {
	try {
		const membersData: MemberData[] = await request.json();
		const skipped: string[] = [];
		const failed: string[] = [];

		const importedCount = await prisma.$transaction(async (prisma) => {
			let count = 0;
			const safeAmount = (val: any) => Number(val) || 0;

			for (const memberData of membersData) {
				const memberNumber = memberData["Employee Number"];
				const etNumber = memberData["ET Number"];

				if (isNaN(memberNumber) || isNaN(etNumber)) {
					console.error(
						`Invalid member number or ET number for member: ${memberData.Name}`
					);
					skipped.push(memberData.Name);
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
						totalContributions:
							safeAmount(memberData["Credit Association Savings"]) +
							safeAmount(memberData["Credit Association Cost of Share"]) +
							safeAmount(memberData["Credit Association Registration Fee"]) +
							safeAmount(memberData["Credit Association Purchases"]) +
							safeAmount(memberData["Credit Association Loan Repayment"]),
						// totalContributions: {
						// 	increment:
						// 		memberData["Credit Association Savings"] +
						// 		memberData["Credit Association Cost of Share"] +
						// 		memberData["Credit Association Registration Fee"] +
						// 		memberData["Credit Association Purchases"] +
						// 		memberData["Credit Association Loan Repayment"],
						// },
					},
					create: {
						memberId: member.id,
						totalSavings: memberData["Credit Association Savings"],
						costOfShare: memberData["Credit Association Cost of Share"],
						registrationFee: memberData["Credit Association Registration Fee"],
						membershipFee: memberData["Credit Association Membership Fee"],
						willingDeposit: memberData["Credit Association Willing Deposit"],
						totalContributions:
							memberData["Credit Association Savings"] +
							memberData["Credit Association Cost of Share"] +
							memberData["Credit Association Registration Fee"] +
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
							jsDate,
							"ERP_PAYROLL", // sourceType
							`BULK_IMPORT_${jsDate.getTime()}`
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
						type: "PURCHASE",
						amount: memberData["Credit Association Purchases"],
					},
					{
						type: "WILLING_DEPOSIT",
						amount: memberData["Credit Association Willing Deposit"],
					},
				];

				const filteredTransactions = transactions.filter((t) => t.amount > 0);

				await prisma.transaction.createMany({
					data: filteredTransactions.map((t) => ({
						memberId: member.id,
						type: t.type as TransactionType,
						amount: t.amount,
						transactionDate: jsDate,
					})),
				});

				for (const tx of filteredTransactions) {
					await createJournalEntry({
						type: mapToAccountingType(tx.type as TransactionType),
						principal: tx.amount,
						interest: 50,
						date: jsDate,
						reference: `${tx.type}-${etNumber}-${jsDate.toISOString()}`,
						journalId: 3,
					});
				}

				count++;
			}

			return count;
		});

		return NextResponse.json({ importedCount, skipped, failed });
	} catch (error: any) {
		console.error("Error importing members:", error);
		// failed.push(member.name);
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
	repaymentDate: Date,
	sourceType: string = "ERP_PAYROLL", // default sourceType
	reference?: string
) {
	const activeLoan = await prisma.loan.findFirst({
		where: {
			memberId,
			status: LoanApprovalStatus.DISBURSED,
		},
		include: {
			loanRepayments: {
				orderBy: { repaymentDate: "asc" },
				where: { status: "PENDING" },
			},
		},
		orderBy: { createdAt: "desc" },
	});

	if (!activeLoan) {
		throw new Error("No active loan found for the member");
	}

	let remainingAmount = repaymentAmount;

	for (const repayment of activeLoan.loanRepayments) {
		if (remainingAmount <= 0) break;

		const unpaidPortion =
			Number(repayment.amount) - Number(repayment.paidAmount);

		if (unpaidPortion <= 0) continue;

		const amountToApply = Math.min(remainingAmount, unpaidPortion);

		if (amountToApply <= 0) continue;

		const newPaidAmount = Number(repayment.paidAmount) + amountToApply;
		const newStatus =
			newPaidAmount >= Number(repayment.amount) ? "PAID" : "PENDING";

		await prisma.loanRepayment.update({
			where: { id: repayment.id },
			data: {
				paidAmount: newPaidAmount,
				repaymentDate,
				status: newStatus,
			},
		});

		remainingAmount -= amountToApply;
	}

	// Record the actual LoanPayment
	if (repaymentAmount > 0) {
		await prisma.loanPayment.create({
			data: {
				loanId: activeLoan.id,
				memberId,
				amount: repaymentAmount,
				paymentDate: repaymentDate,
				sourceType,
				reference,
			},
		});
	}

	// Create transaction log
	if (repaymentAmount > 0) {
		await prisma.transaction.create({
			data: {
				memberId,
				type: TransactionType.LOAN_REPAYMENT,
				amount: repaymentAmount,
				transactionDate: repaymentDate,
				reference,
			},
		});

		await createJournalEntry({
			type: mapToAccountingType(
				TransactionType.LOAN_REPAYMENT as TransactionType
			),
			principal: repaymentAmount,
			interest: 50,
			date: repaymentDate,
			reference: `${
				TransactionType.LOAN_REPAYMENT
			}-${memberId}-${repaymentDate.toISOString()}`,
			journalId: 3,
		});
	}

	// Recalculate remaining loan balance
	const totalRepaidResult = await prisma.loanRepayment.aggregate({
		where: { loanId: activeLoan.id },
		_sum: { paidAmount: true },
	});
	const totalRepaid = totalRepaidResult._sum.paidAmount || 0;
	const newRemaining = Number(activeLoan.amount) - Number(totalRepaid);

	await prisma.loan.update({
		where: { id: activeLoan.id },
		data: {
			remainingAmount: newRemaining,
		},
	});

	if (newRemaining <= 0) {
		await prisma.loan.update({
			where: { id: activeLoan.id },
			data: {
				status: LoanApprovalStatus.REPAID,
			},
		});
	}
}

function mapToAccountingType(transactionType: string): string {
	switch (transactionType) {
		case "SAVINGS":
		case "WILLING_DEPOSIT":
		case "REGISTRATION_FEE":
		case "MEMBERSHIP_FEE":
		case "COST_OF_SHARE":
			return "deposit";
		case "PURCHASE":
			return "withdrawal";
		case "LOAN_REPAYMENT":
			return "loanRepayment";
		default:
			throw new Error(`Unknown accounting mapping for: ${transactionType}`);
	}
}

async function createJournalEntry(transactionDetails: any) {
	try {
		// Odoo server details
		const host = "116.202.104.180";
		const port = 8069;
		const db = "test";
		const username = "admin";
		const password = "admin";

		// Define account mapping
		const accounts = {
			cash: {
				id: 102,
				code: "211002",
				name: "Cash",
				account_type: "asset_cash",
			},
			bank: {
				id: 101,
				code: "211001",
				name: "Bank",
				account_type: "asset_cash",
			},
			tradeDebtors: {
				id: 9,
				code: "221100",
				name: "Trade Debtors",
				account_type: "asset_receivable",
			},
			suspense: {
				id: 5,
				code: "220100",
				name: "Suspense",
				account_type: "asset_receivable",
			},
			otherDeposits: {
				id: 38,
				code: "305400",
				name: "Other deposits",
				account_type: "liability_current",
			},
			commercialLoan: {
				id: 40,
				code: "310300",
				name: "Commercial Loan",
				account_type: "liability_current",
			},
			salesIncome: {
				id: 1,
				code: "110000",
				name: "Sales of Goods and Services",
				account_type: "income",
			},
			exchangeGain: {
				id: 98,
				code: "120000",
				name: "Foreign Exchange Currency Gain Account",
				account_type: "income_other",
			},
			interestExpense: {
				id: 97,
				code: "643400",
				name: "Payments of interest and bank charges on local debt",
				account_type: "expense",
			},
			feeExpense: {
				id: 81,
				code: "625600",
				name: "Fees and charges",
				account_type: "expense",
			},
			equity: {
				id: 42,
				code: "401000",
				name: "Share capital / equity",
				account_type: "equity",
			},
			undistributedProfits: {
				id: 109,
				code: "999999",
				name: "Undistributed Profits/Losses",
				account_type: "equity_unaffected",
			},
			cashDifferenceGain: {
				id: 106,
				code: "999001",
				name: "Cash Difference Gain",
				account_type: "income_other",
			},
			cashDifferenceLoss: {
				id: 107,
				code: "999002",
				name: "Cash Difference Loss",
				account_type: "expense",
			},
		};

		// Initialize line items
		const lineItems = [];

		// Handle different transaction types
		switch (transactionDetails.type) {
			case "SAVINGS":
			case "WILLING_DEPOSIT":
				lineItems.push(
					[
						0,
						0,
						{
							account_id: accounts.cash.id,
							name: "Cash",
							debit: transactionDetails.amount,
							credit: 0,
						},
					],
					[
						0,
						0,
						{
							account_id: accounts.otherDeposits.id,
							name: "Deposit Liability",
							debit: 0,
							credit: transactionDetails.amount,
						},
					]
				);
				break;

			case "LOAN_DISBURSEMENT":
				lineItems.push(
					[
						0,
						0,
						{
							account_id: accounts.tradeDebtors.id,
							name: "Loan Receivable",
							debit: transactionDetails.amount,
							credit: 0,
						},
					],
					[
						0,
						0,
						{
							account_id: accounts.cash.id,
							name: "Cash",
							debit: 0,
							credit: transactionDetails.amount,
						},
					]
				);
				break;

			case "LOAN_REPAYMENT":
				lineItems.push(
					[
						0,
						0,
						{
							account_id: accounts.cash.id,
							name: "Cash",
							debit: transactionDetails.principal,
							credit: 0,
						},
					],
					[
						0,
						0,
						{
							account_id: accounts.tradeDebtors.id,
							name: "Loan Receivable",
							debit: 0,
							credit: transactionDetails.principal,
						},
					]
				);
				if (transactionDetails.interest > 0) {
					lineItems.push(
						[
							0,
							0,
							{
								account_id: accounts.cash.id,
								name: "Cash",
								debit: transactionDetails.interest,
								credit: 0,
							},
						],
						[
							0,
							0,
							{
								account_id: accounts.salesIncome.id,
								name: "Interest Income",
								debit: 0,
								credit: transactionDetails.interest,
							},
						]
					);
				}
				break;

			case "WITHDRAWAL":
				lineItems.push(
					[
						0,
						0,
						{
							account_id: accounts.otherDeposits.id,
							name: "Deposit Liability",
							debit: transactionDetails.amount,
							credit: 0,
						},
					],
					[
						0,
						0,
						{
							account_id: accounts.cash.id,
							name: "Cash",
							debit: 0,
							credit: transactionDetails.amount,
						},
					]
				);
				break;

			case "INTEREST_INCOME":
				lineItems.push(
					[
						0,
						0,
						{
							account_id: accounts.cash.id,
							name: "Cash",
							debit: transactionDetails.amount,
							credit: 0,
						},
					],
					[
						0,
						0,
						{
							account_id: accounts.salesIncome.id,
							name: "Interest Income",
							debit: 0,
							credit: transactionDetails.amount,
						},
					]
				);
				break;

			case "INTEREST_EXPENSE":
				lineItems.push(
					[
						0,
						0,
						{
							account_id: accounts.interestExpense.id,
							name: "Interest Expense",
							debit: transactionDetails.amount,
							credit: 0,
						},
					],
					[
						0,
						0,
						{
							account_id: accounts.cash.id,
							name: "Cash",
							debit: 0,
							credit: transactionDetails.amount,
						},
					]
				);
				break;

			default:
				throw new Error(
					`Unsupported transaction type: ${transactionDetails.type}`
				);
		}

		// Create XML-RPC client
		const commonClient = xmlrpc.createClient({
			host,
			port,
			path: "/xmlrpc/2/common",
		});

		// Authenticate and create journal entry
		const uid = await new Promise((resolve, reject) => {
			commonClient.methodCall(
				"authenticate",
				[db, username, password, {}],
				(error: any, result: any) => {
					if (error) reject(error);
					else resolve(result);
				}
			);
		});

		const objectClient = xmlrpc.createClient({
			host,
			port,
			path: "/xmlrpc/2/object",
		});

		const journalEntry = {
			move_type: "entry",
			journal_id: transactionDetails.journalId || 3,
			date: transactionDetails.date || new Date().toISOString().split("T")[0],
			ref:
				transactionDetails.reference ||
				`Microfinance Transaction: ${transactionDetails.type}`,
			line_ids: lineItems,
		};

		const entryId = await new Promise((resolve, reject) => {
			objectClient.methodCall(
				"execute_kw",
				[db, uid, password, "account.move", "create", [journalEntry]],
				(error: any, result: any) => {
					if (error) reject(error);
					else resolve(result);
				}
			);
		});

		console.log(`✅ Journal entry created with ID: ${entryId}`);
		return entryId;
	} catch (error: any) {
		console.error("❌ Error in createJournalEntry:", error.message);
		throw error;
	}
}
