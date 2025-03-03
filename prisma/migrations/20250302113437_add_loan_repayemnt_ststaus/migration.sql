-- CreateEnum
CREATE TYPE "RepaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- AlterTable
ALTER TABLE "LoanRepayment" ADD COLUMN     "status" "RepaymentStatus" NOT NULL DEFAULT 'PENDING';
