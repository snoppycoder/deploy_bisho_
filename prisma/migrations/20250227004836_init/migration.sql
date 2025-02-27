-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SAVINGS', 'MEMBERSHIP_FEE', 'REGISTRATION_FEE', 'COST_OF_SHARE', 'LOAN_REPAYMENT', 'PURCHASE', 'WILLING_DEPOSIT');

-- CreateEnum
CREATE TYPE "LoanApprovalStatus" AS ENUM ('PENDING', 'VERIFIED', 'APPROVED', 'DISBURSED', 'REPAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'FINANCE_ADMIN');

-- CreateEnum
CREATE TYPE "RepaymentSourceType" AS ENUM ('ERP_PAYROLL', 'MANUAL_PAYMENT', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('AGREEMENT', 'COLLATERAL', 'OTHER');

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "memberNumber" INTEGER NOT NULL,
    "etNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "division" TEXT,
    "department" TEXT,
    "section" TEXT,
    "group" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberHistory" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,

    CONSTRAINT "MemberHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberBalance" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "totalSavings" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "totalContributions" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Savings" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "savingsDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reference" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "interestRate" DECIMAL(65,30) NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "status" "LoanApprovalStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanRepayment" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "repaymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,
    "sourceType" "RepaymentSourceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanRepayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanApprovalLog" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "approvedByUserId" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "LoanApprovalStatus" NOT NULL,
    "approvalOrder" INTEGER NOT NULL,
    "comments" TEXT,
    "approvalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanApprovalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanDocument" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "uploadedByUserId" INTEGER NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberNumber_key" ON "Member"("memberNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_etNumber_key" ON "Member"("etNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberBalance_memberId_key" ON "MemberBalance"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberHistory" ADD CONSTRAINT "MemberHistory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberBalance" ADD CONSTRAINT "MemberBalance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Savings" ADD CONSTRAINT "Savings_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRepayment" ADD CONSTRAINT "LoanRepayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApprovalLog" ADD CONSTRAINT "LoanApprovalLog_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanApprovalLog" ADD CONSTRAINT "LoanApprovalLog_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDocument" ADD CONSTRAINT "LoanDocument_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDocument" ADD CONSTRAINT "LoanDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
