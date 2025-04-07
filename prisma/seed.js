import {
	PrismaClient,
	UserRole,
	// LoanStatus,
	DocumentType,
	RepaymentSourceType,
	TransactionType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	// Clear existing data
	await prisma.loanDocument.deleteMany({});
	await prisma.loanRepayment.deleteMany({});
	await prisma.loanApprovalLog.deleteMany({});
	await prisma.loan.deleteMany({});
	await prisma.transaction.deleteMany({});
	await prisma.savings.deleteMany({});
	await prisma.memberBalance.deleteMany({});
	await prisma.memberHistory.deleteMany({});
	await prisma.notification.deleteMany({});
	await prisma.member.deleteMany({});
	await prisma.user.deleteMany({});

	// Create admin users
	const adminUsers = [
		{
			name: "Loan Officer",
			email: "loan.officer@example.com",
			phone: "0913228899",
			password: await bcrypt.hash("password123", 10),
			role: UserRole.LOAN_OFFICER,
		},
		{
			name: "Branch Manager",
			email: "branch.manager@example.com",
			phone: "0913228888",
			password: await bcrypt.hash("password123", 10),
			role: UserRole.BRANCH_MANAGER,
		},
		{
			name: "Regional Manager",
			email: "regional.manager@example.com",
			phone: "0913228811",
			password: await bcrypt.hash("password123", 10),
			role: UserRole.REGIONAL_MANAGER,
		},
		{
			name: "Finance Admin",
			email: "finance.admin@example.com",
			phone: "0913228833",
			password: await bcrypt.hash("password123", 10),
			role: UserRole.FINANCE_ADMIN,
		},
	];

	for (const userData of adminUsers) {
		await prisma.user.create({
			data: userData,
		});
	}

	// Create sample loans
	const loanOfficer = await prisma.user.findFirst({
		where: { role: UserRole.LOAN_OFFICER },
	});

	const branchManager = await prisma.user.findFirst({
		where: { role: UserRole.BRANCH_MANAGER },
	});

	const regionalManager = await prisma.user.findFirst({
		where: { role: UserRole.REGIONAL_MANAGER },
	});

	const financeAdmin = await prisma.user.findFirst({
		where: { role: UserRole.FINANCE_ADMIN },
	});

	if (!loanOfficer || !branchManager || !regionalManager || !financeAdmin) {
		throw new Error("Required admin users not found");
	}

	console.log("Database seeded successfully");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
