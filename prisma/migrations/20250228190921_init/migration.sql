/*
  Warnings:

  - Added the required column `documentUrl` to the `LoanDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoanDocument" ADD COLUMN     "documentUrl" TEXT NOT NULL;
