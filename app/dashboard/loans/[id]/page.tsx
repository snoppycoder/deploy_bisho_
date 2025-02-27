"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

interface Document {
	id: number;
	documentUrl: string;
	documentType: string;
	uploadDate: string;
}

export default function LoanDocumentsPage() {
	const [documents, setDocuments] = useState<Document[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [file, setFile] = useState<File | null>(null);
	const [documentType, setDocumentType] = useState("");
	const { id } = useParams();
	const { toast } = useToast();

	useEffect(() => {
		fetchDocuments();
	}, []);

	const fetchDocuments = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/loans/${id}/documents`);
			if (!response.ok) {
				throw new Error("Failed to fetch documents");
			}
			const data = await response.json();
			setDocuments(data);
		} catch (error) {
			console.error("Error fetching documents:", error);
			toast({
				title: "Error",
				description: "Failed to load documents. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file || !documentType) {
			toast({
				title: "Error",
				description: "Please select a file and document type.",
				variant: "destructive",
			});
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("documentType", documentType);

		try {
			const response = await fetch(`/api/loans/${id}/documents`, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to upload document");
			}

			toast({
				title: "Success",
				description: "Document uploaded successfully.",
			});

			fetchDocuments();
			setFile(null);
			setDocumentType("");
		} catch (error) {
			console.error("Error uploading document:", error);
			toast({
				title: "Error",
				description: "Failed to upload document. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Loan Documents</h1>
			<Card>
				<CardHeader>
					<CardTitle>Upload New Document</CardTitle>
					<CardDescription>Upload a new document for this loan</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<Label htmlFor="file">File</Label>
							<Input id="file" type="file" onChange={handleFileChange} />
						</div>
						<div>
							<Label htmlFor="documentType">Document Type</Label>
							<Input
								id="documentType"
								value={documentType}
								onChange={(e) => setDocumentType(e.target.value)}
								placeholder="e.g., AGREEMENT, COLLATERAL, OTHER"
							/>
						</div>
						<Button onClick={handleUpload}>Upload Document</Button>
					</div>
				</CardContent>
			</Card>
			{isLoading ? (
				<p>Loading documents...</p>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{documents.map((doc) => (
						<Card key={doc.id}>
							<CardHeader>
								<CardTitle>{doc.documentType}</CardTitle>
								<CardDescription>
									Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<a
									href={doc.documentUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:underline">
									View Document
								</a>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
