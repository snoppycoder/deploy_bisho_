"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { loanDocument } from "@/lib/api"
interface LoanDocument {
	id: number;
	loanId: number;
	documentType: string;
	fileName: string;
	uploadDate: string;
}

export default function MemberLoanDocumentsPage() {
	const [documents, setDocuments] = useState<LoanDocument[]>([]);
	const { toast } = useToast();

	useEffect(() => {
		fetchDocuments();
	}, []);

	const fetchDocuments = async () => {
		try {
			const response = await loanDocument.getLoanDocument();
			if (response.ok) {
				const data = await response.json();
				setDocuments(data);
			} else {
				throw new Error("Failed to fetch loan documents");
			}
		} catch (error) {
			console.error("Error fetching loan documents:", error);
			toast({
				title: "Failed to fetch loan documents",
				variant: "destructive",
			});
		}
	};

	const handleDownload = async (documentId: number) => {
		try {
			const response = await loanDocument.getLoanDocumentById(documentId);
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.style.display = "none";
				a.href = url;
				a.download =
					documents.find((doc) => doc.id === documentId)?.fileName ||
					"document";
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
			} else {
				throw new Error("Failed to download document");
			}
		} catch (error) {
			console.error("Error downloading document:", error);
			toast({ title: "Failed to download document", variant: "destructive" });
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>My Loan Documents</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Loan ID</TableHead>
							<TableHead>Document Type</TableHead>
							<TableHead>File Name</TableHead>
							<TableHead>Upload Date</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{documents.map((doc) => (
							<TableRow key={doc.id}>
								<TableCell>{doc.loanId}</TableCell>
								<TableCell>{doc.documentType}</TableCell>
								<TableCell>{doc.fileName}</TableCell>
								<TableCell>
									{new Date(doc.uploadDate).toLocaleString()}
								</TableCell>
								<TableCell>
									<Button
										variant="outline"
										onClick={() => handleDownload(doc.id)}>
										Download
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
