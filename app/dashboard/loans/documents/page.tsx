"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface LoanDocument {
	id: number;
	loanId: number;
	documentType: string;
	documentUrl: string;
	uploadDate: string;
}

export default function LoanDocumentsPage() {
	const [documents, setDocuments] = useState<LoanDocument[]>([]);
	const [file, setFile] = useState<File | null>(null);
	const [documentType, setDocumentType] = useState("");
	const [loanId, setLoanId] = useState("");
	const { toast } = useToast();

	useEffect(() => {
		fetchDocuments();
	}, []);

	const fetchDocuments = async () => {
		try {
			const response = await fetch("/api/loans/documents");
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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file || !documentType || !loanId) {
			toast({ title: "Please fill all fields", variant: "destructive" });
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("documentType", documentType);
		formData.append("loanId", loanId);

		try {
			const response = await fetch("/api/loans/documents", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				toast({ title: "Document uploaded successfully" });
				fetchDocuments();
				setFile(null);
				setDocumentType("");
				setLoanId("");
			} else {
				throw new Error("Failed to upload document");
			}
		} catch (error) {
			console.error("Error uploading document:", error);
			toast({ title: "Failed to upload document", variant: "destructive" });
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Loan Documents</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 mb-4">
					<div>
						<Label htmlFor="file">Document</Label>
						<Input id="file" type="file" onChange={handleFileChange} />
					</div>
					<div>
						<Label htmlFor="documentType">Document Type</Label>
						<Input
							id="documentType"
							value={documentType}
							onChange={(e) => setDocumentType(e.target.value)}
							placeholder="Enter document type"
						/>
					</div>
					<div>
						<Label htmlFor="loanId">Loan ID</Label>
						<Input
							id="loanId"
							value={loanId}
							onChange={(e) => setLoanId(e.target.value)}
							placeholder="Enter loan ID"
						/>
					</div>
					<Button onClick={handleUpload}>Upload Document</Button>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Loan ID</TableHead>
							<TableHead>Document Type</TableHead>
							<TableHead>Upload Date</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{documents.map((doc) => (
							<TableRow key={doc.id}>
								<TableCell>{doc.loanId}</TableCell>
								<TableCell>{doc.documentType}</TableCell>
								<TableCell>
									{new Date(doc.uploadDate).toLocaleString()}
								</TableCell>
								<TableCell>
									<Button
										variant="outline"
										onClick={() => window.open(doc.documentUrl, "_blank")}>
										View
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
