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

export default function ImportMembersPage() {
	const [file, setFile] = useState<File | null>(null);
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
			const jsonData = XLSX.utils.sheet_to_json(worksheet);

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

				toast({
					title: "Success",
					description: "Members imported successfully.",
				});

				router.push("/dashboard/members");
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
		</div>
	);
}
