"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

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

export default function ImportMembersPage() {
	const [file, setFile] = useState<File | null>(null);
	const [importErrors, setImportErrors] = useState<string[]>([]);
	const router = useRouter();
	const { toast } = useToast();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	const handleImport = async () => {
		if (!file) {
			toast({
				title: "Error",
				description: "Please select a file to import.",
				variant: "destructive",
			});
			return;
		}

		const reader = new FileReader();
		reader.onload = async (e) => {
			const data = new Uint8Array(e.target?.result as ArrayBuffer);
			const workbook = XLSX.read(data, { type: "array" });
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const jsonData: MemberData[] = XLSX.utils.sheet_to_json(worksheet);

			try {
				const response = await fetch("/api/members/import", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(jsonData),
				});

				if (!response.ok) {
					throw new Error("Failed to import members");
				}

				const result = await response.json();

				if (result.errors && result.errors.length > 0) {
					setImportErrors(result.errors);
				}

				toast({
					title: "Success",
					description: `Imported ${result.importedCount} members successfully.`,
				});

				if (result.importedCount > 0) {
					router.push("/dashboard/members");
				}
			} catch (error) {
				console.error("Error importing members:", error);
				toast({
					title: "Error",
					description: "Failed to import members. Please try again.",
					variant: "destructive",
				});
			}
		};

		reader.readAsArrayBuffer(file);
	};

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Import Members</h1>
			<Card>
				<CardHeader>
					<CardTitle>Import Members from Excel</CardTitle>
					<CardDescription>
						Upload an Excel file containing member data
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<Label htmlFor="file">Excel File</Label>
							<Input
								id="file"
								type="file"
								accept=".xlsx, .xls"
								onChange={handleFileChange}
							/>
						</div>
						<Button onClick={handleImport}>Import Members</Button>
					</div>
				</CardContent>
			</Card>
			{importErrors.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Import Errors</CardTitle>
						<CardDescription>
							The following errors occurred during import:
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="list-disc pl-5">
							{importErrors.map((error, index) => (
								<li key={index} className="text-red-500">
									{error}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
