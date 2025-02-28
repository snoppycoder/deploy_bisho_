/*
  Warnings:

  - Added the required column `effectiveDate` to the `MemberHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MemberHistory" ADD COLUMN     "effectiveDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Member_name_idx" ON "Member"("name");

-- CreateIndex
CREATE INDEX "Member_division_idx" ON "Member"("division");

-- CreateIndex
CREATE INDEX "Member_department_idx" ON "Member"("department");

-- CreateIndex
CREATE INDEX "Member_section_idx" ON "Member"("section");

-- CreateIndex
CREATE INDEX "Member_group_idx" ON "Member"("group");

-- CreateIndex
CREATE INDEX "Transaction_memberId_transactionDate_idx" ON "Transaction"("memberId", "transactionDate");

-- CreateIndex
CREATE INDEX "Transaction_type_transactionDate_idx" ON "Transaction"("type", "transactionDate");
