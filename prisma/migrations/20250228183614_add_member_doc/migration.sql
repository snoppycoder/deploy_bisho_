/*
  Warnings:

  - You are about to drop the column `documentUrl` on the `LoanDocument` table. All the data in the column will be lost.
  - Added the required column `documentContent` to the `LoanDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `LoanDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `LoanDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoanDocument" DROP COLUMN "documentUrl",
ADD COLUMN     "documentContent" BYTEA NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL;
