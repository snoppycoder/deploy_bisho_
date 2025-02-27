import { PrismaClient, UserRole } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.loanDocument.deleteMany({})
  await prisma.loanRepayment.deleteMany({})
  await prisma.loanApprovalLog.deleteMany({})
  await prisma.loan.deleteMany({})
  await prisma.transaction.deleteMany({})
  await prisma.savings.deleteMany({})
  await prisma.memberBalance.deleteMany({})
  await prisma.memberHistory.deleteMany({})
  await prisma.member.deleteMany({})
  await prisma.user.deleteMany({})

  // Create admin users
  const adminUsers = [
    {
      name: "Loan Officer",
      email: "loan.officer@example.com",
      phone: "1234567890",
      password: await bcrypt.hash("password123", 10),
      role: UserRole.LOAN_OFFICER,
    },
    {
      name: "Branch Manager",
      email: "branch.manager@example.com",
      phone: "2345678901",
      password: await bcrypt.hash("password123", 10),
      role: UserRole.BRANCH_MANAGER,
    },
    {
      name: "Regional Manager",
      email: "regional.manager@example.com",
      phone: "3456789012",
      password: await bcrypt.hash("password123", 10),
      role: UserRole.REGIONAL_MANAGER,
    },
    {
      name: "Finance Admin",
      email: "finance.admin@example.com",
      phone: "4567890123",
      password: await bcrypt.hash("password123", 10),
      role: UserRole.FINANCE_ADMIN,
    },
  ]

  for (const userData of adminUsers) {
    await prisma.user.create({
      data: userData,
    })
  }

  // Create member users with associated member records
  const memberUsers = [
    {
      user: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "5678901234",
        password: await bcrypt.hash("password123", 10),
        role: UserRole.MEMBER,
      },
      member: {
        memberNumber: 10001,
        etNumber: 20001,
        name: "John Doe",
        division: "Engineering",
        department: "Software",
        section: "Development",
        group: "Backend",
      },
    },
    {
      user: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "6789012345",
        password: await bcrypt.hash("password123", 10),
        role: UserRole.MEMBER,
      },
      member: {
        memberNumber: 10002,
        etNumber: 20002,
        name: "Jane Smith",
        division: "Engineering",
        department: "Software",
        section: "Development",
        group: "Frontend",
      },
    },
    {
      user: {
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        phone: "7890123456",
        password: await bcrypt.hash("password123", 10),
        role: UserRole.MEMBER,
      },
      member: {
        memberNumber: 10003,
        etNumber: 20003,
        name: "Bob Johnson",
        division: "Finance",
        department: "Accounting",
        section: "Payroll",
        group: "Processing",
      },
    },
  ]

  for (const { user, member } of memberUsers) {
    const createdUser = await prisma.user.create({
      data: user,
    })

    const createdMember = await prisma.member.create({
      data: {
        ...member,
        userId: createdUser.id,
      },
    })

    // Create member balance
    await prisma.memberBalance.create({
      data: {
        memberId: createdMember.id,
        totalSavings: 1000.0,
        totalContributions: 500.0,
      },
    })

    // Create savings entries
    await prisma.savings.create({
      data: {
        memberId: createdMember.id,
        amount: 500.0,
        savingsDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
    })

    await prisma.savings.create({
      data: {
        memberId: createdMember.id,
        amount: 500.0,
        savingsDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
    })

    // Create transactions
    await prisma.transaction.create({
      data: {
        memberId: createdMember.id,
        type: "SAVINGS",
        amount: 500.0,
        reference: "Monthly Savings",
        transactionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.transaction.create({
      data: {
        memberId: createdMember.id,
        type: "SAVINGS",
        amount: 500.0,
        reference: "Monthly Savings",
        transactionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.transaction.create({
      data: {
        memberId: createdMember.id,
        type: "MEMBERSHIP_FEE",
        amount: 100.0,
        reference: "Annual Membership Fee",
        transactionDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.transaction.create({
      data: {
        memberId: createdMember.id,
        type: "COST_OF_SHARE",
        amount: 400.0,
        reference: "Share Purchase",
        transactionDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // Create sample loans
  const loanOfficer = await prisma.user.findFirst({
    where: { role: UserRole.LOAN_OFFICER },
  })

  const branchManager = await prisma.user.findFirst({
    where: { role: UserRole.BRANCH_MANAGER },
  })

  const regionalManager = await prisma.user.findFirst({
    where: { role: UserRole.REGIONAL_MANAGER },
  })

  const financeAdmin = await prisma.user.findFirst({
    where: { role: UserRole.FINANCE_ADMIN },
  })

  if (!loanOfficer || !branchManager || !regionalManager || !financeAdmin) {
    throw new Error("Required admin users not found")
  }

  const member1 = await prisma.member.findFirst({
    where: { memberNumber: 10001 },
  })

  const member2 = await prisma.member.findFirst({
    where: { memberNumber: 10002 },
  })

  if (!member1 || !member2) {
    throw new Error("Required members not found")
  }

  // Create a fully approved and disbursed loan
  const loan1 = await prisma.loan.create({
    data: {
      memberId: member1.id,
      amount: 5000.0,
      interestRate: 5.0,
      tenureMonths: 12,
      status: "DISBURSED",
    },
  })

  // Create approval logs for loan1
  await prisma.loanApprovalLog.create({
    data: {
      loanId: loan1.id,
      approvedByUserId: loanOfficer.id,
      role: UserRole.LOAN_OFFICER,
      status: "VERIFIED",
      approvalOrder: 1,
      comments: "All documents verified",
      approvalDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.loanApprovalLog.create({
    data: {
      loanId: loan1.id,
      approvedByUserId: branchManager.id,
      role: UserRole.BRANCH_MANAGER,
      status: "APPROVED",
      approvalOrder: 2,
      comments: "Approved based on good savings history",
      approvalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.loanApprovalLog.create({
    data: {
      loanId: loan1.id,
      approvedByUserId: financeAdmin.id,
      role: UserRole.FINANCE_ADMIN,
      status: "DISBURSED",
      approvalOrder: 3,
      comments: "Funds disbursed to member account",
      approvalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  })

  // Create loan document for loan1
  await prisma.loanDocument.create({
    data: {
      loanId: loan1.id,
      uploadedByUserId: member1.userId!,
      documentUrl: "/documents/loan1_agreement.pdf",
      documentType: "AGREEMENT",
    },
  })

  // Create loan repayments for loan1
  await prisma.loanRepayment.create({
    data: {
      loanId: loan1.id,
      amount: 450.0,
      repaymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reference: "ERP-12345",
      sourceType: "ERP_PAYROLL",
    },
  })

  // Create a pending loan
  const loan2 = await prisma.loan.create({
    data: {
      memberId: member2.id,
      amount: 10000.0,
      interestRate: 6.0,
      tenureMonths: 24,
      status: "PENDING",
    },
  })

  // Create loan document for loan2
  await prisma.loanDocument.create({
    data: {
      loanId: loan2.id,
      uploadedByUserId: member2.userId!,
      documentUrl: "/documents/loan2_agreement.pdf",
      documentType: "AGREEMENT",
    },
  })

  console.log("Database seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

