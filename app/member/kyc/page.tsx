"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { membersAPI } from "@/lib/api"

export default function KYCDocumentsPage() {
	const [file, setFile] = useState<File | null>(null);
	const [documentType, setDocumentType] = useState("");
	const { toast } = useToast();

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
			const response = await membersAPI.uploadKYC(formData);
			toast({
				title: "Success",
				description: "Document uploaded successfully.",
			});

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
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">KYC Documents</h1>
			<Card>
				<CardHeader>
					<CardTitle>Upload KYC Document</CardTitle>
					<CardDescription>
						Please upload your KYC documents here
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<Label htmlFor="file">Document File</Label>
							<Input id="file" type="file" onChange={handleFileChange} />
						</div>
						<div>
							<Label htmlFor="documentType">Document Type</Label>
							<Input
								id="documentType"
								value={documentType}
								onChange={(e) => setDocumentType(e.target.value)}
								placeholder="e.g., National ID, Passport, Utility Bill"
							/>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button onClick={handleUpload}>Upload Document</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
