"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

export default function ExportMembersPage() {
	const [isExporting, setIsExporting] = useState(false);
	const { toast } = useToast();

	const handleExport = async () => {
		setIsExporting(true);

		try {
			const response = await fetch("/api/members");
			if (!response.ok) {
				throw new Error("Failed to fetch members");
			}

			const members = await response.json();

			const worksheet = XLSX.utils.json_to_sheet(members);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

			XLSX.writeFile(workbook, "members_export.xlsx");

			toast({
				title: "Success",
				description: "Members exported successfully.",
			});
		} catch (error) {
			console.error("Error exporting members:", error);
			toast({
				title: "Error",
				description: "Failed to export members. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Export Members</h1>
			<Card>
				<CardHeader>
					<CardTitle>Export Members to Excel</CardTitle>
					<CardDescription>
						Download an Excel file containing all member data
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={handleExport} disabled={isExporting}>
						{isExporting ? "Exporting..." : "Export Members"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
