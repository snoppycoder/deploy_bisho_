-- AlterTable
ALTER TABLE "LoanRepayment" ADD COLUMN     "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;
