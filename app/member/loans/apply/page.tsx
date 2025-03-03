"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";

interface Member {
	id: number;
	name: string;
	etNumber: number;
}

export default function LoanApplicationPage() {
	const [amount, setAmount] = useState("");
	const [interestRate, setInterestRate] = useState("7");
	const [tenureMonths, setTenureMonths] = useState("");
	const [purpose, setPurpose] = useState("");
	const [coSigner1, setCoSigner1] = useState("");
	const [coSigner2, setCoSigner2] = useState("");
	const [members, setMembers] = useState<Member[]>([]);
	const [file, setFile] = useState<File | null>(null);
	const [maxLoanAmount, setMaxLoanAmount] = useState(0);
	const { user } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		fetchMembers();
		fetchMemberContribution();
	}, []);

	const fetchMembers = async () => {
		try {
			const response = await fetch("/api/members");
			if (response.ok) {
				const data = await response.json();
				setMembers(data.filter((member: Member) => member.id !== user?.id));
			} else {
				throw new Error("Failed to fetch members");
			}
		} catch (error) {
			console.error("Error fetching members:", error);
			toast({
				title: "Error",
				description: "Failed to load members. Please try again.",
				variant: "destructive",
			});
		}
	};

	const fetchMemberContribution = async () => {
		try {
			const response = await fetch("/api/members/contribution");
			if (response.ok) {
				const data = await response.json();
				setMaxLoanAmount(data.totalContribution / 3);
			} else {
				throw new Error("Failed to fetch member contribution");
			}
		} catch (error) {
			console.error("Error fetching member contribution:", error);
			toast({
				title: "Error",
				description: "Failed to load your contribution data. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) {
			toast({
				title: "Error",
				description: "Please upload the signed loan agreement document.",
				variant: "destructive",
			});
			return;
		}

		const amountValue = Number.parseFloat(amount);
		if (amountValue > maxLoanAmount) {
			toast({
				title: "Error",
				description: `Loan amount cannot exceed ${maxLoanAmount.toFixed(
					2
				)} ETB (1/3 of your total contribution).`,
				variant: "destructive",
			});
			return;
		}

		if (Number.parseFloat(interestRate) !== 7) {
			toast({
				title: "Error",
				description: "Interest rate must be 7%.",
				variant: "destructive",
			});
			return;
		}

		if (Number.parseInt(tenureMonths) > 6) {
			toast({
				title: "Error",
				description: "Loan tenure cannot exceed 6 months.",
				variant: "destructive",
			});
			return;
		}

		const formData = new FormData();
		formData.append("amount", amount);
		formData.append("interestRate", interestRate);
		formData.append("tenureMonths", tenureMonths);
		formData.append("purpose", purpose);
		formData.append("coSigner1", coSigner1);
		formData.append("coSigner2", coSigner2);
		formData.append("agreement", file);

		try {
			const response = await fetch("/api/loans/apply", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const data = await response.json();
				toast({
					title: "Loan application submitted successfully",
					description: `Your agreement document has been uploaded: ${data.documentUrl}`,
				});
				router.push("/member/loans");
			} else {
				throw new Error("Failed to submit loan application");
			}
		} catch (error) {
			console.error("Error submitting loan application:", error);
			toast({
				title: "Failed to submit loan application",
				variant: "destructive",
			});
		}
	};

	const handleDownloadAgreement = async () => {
		try {
			const response = await fetch("/api/loans/agreement-template");
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.style.display = "none";
				a.href = url;
				a.download = "loan_agreement_template.pdf";
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
			} else {
				throw new Error("Failed to download agreement template");
			}
		} catch (error) {
			console.error("Error downloading agreement template:", error);
			toast({
				title: "Error",
				description: "Failed to download agreement template. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Apply for a Loan</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-6 flex flex-col items-center">
					<Button
						onClick={handleDownloadAgreement}
						variant="outline"
						className="w-full h-32 flex flex-col items-center justify-center">
						<FileText size={48} className="mb-2" />
						<span>Download Loan Agreement Template</span>
					</Button>
					<p className="mt-2 text-sm text-gray-500">
						Please download, review, and sign the loan agreement before
						uploading.
					</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="amount">Loan Amount (ETB)</Label>
						<Input
							type="number"
							id="amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							max={maxLoanAmount}
							required
						/>
						<p className="text-sm text-gray-500 mt-1">
							Maximum amount: {maxLoanAmount.toFixed(2)} ETB
						</p>
					</div>
					<div>
						<Label htmlFor="interestRate">Interest Rate (%)</Label>
						<Input
							type="number"
							id="interestRate"
							value={interestRate}
							onChange={(e) => setInterestRate(e.target.value)}
							required
							disabled
						/>
					</div>
					<div>
						<Label htmlFor="tenureMonths">Loan Tenure (months)</Label>
						<Input
							type="number"
							id="tenureMonths"
							value={tenureMonths}
							onChange={(e) => setTenureMonths(e.target.value)}
							max={6}
							required
						/>
					</div>
					<div>
						<Label htmlFor="purpose">Loan Purpose</Label>
						<Input
							type="text"
							id="purpose"
							value={purpose}
							onChange={(e) => setPurpose(e.target.value)}
							required
						/>
					</div>
					<div>
						<Label htmlFor="coSigner1">Co-Signer 1</Label>
						<Select value={coSigner1} onValueChange={setCoSigner1}>
							<SelectTrigger>
								<SelectValue placeholder="Select Co-Signer 1" />
							</SelectTrigger>
							<SelectContent>
								{members.map((member) => (
									<SelectItem key={member.id} value={member.id.toString()}>
										{member.name} (ET: {member.etNumber})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="coSigner2">Co-Signer 2</Label>
						<Select value={coSigner2} onValueChange={setCoSigner2}>
							<SelectTrigger>
								<SelectValue placeholder="Select Co-Signer 2" />
							</SelectTrigger>
							<SelectContent>
								{members.map((member) => (
									<SelectItem key={member.id} value={member.id.toString()}>
										{member.name} (ET: {member.etNumber})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="agreement">Signed Loan Agreement Document</Label>
						<Input
							type="file"
							id="agreement"
							onChange={handleFileChange}
							accept=".pdf,.doc,.docx"
							required
						/>
					</div>
					<Button type="submit" className="w-full">
						Submit Loan Application
					</Button>
				</form>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button
					variant="outline"
					onClick={() => router.push("/member/loans/calculator")}>
					Go to Loan Calculator
				</Button>
				<Button variant="outline" onClick={() => router.push("/member/loans")}>
					Back to Loans
				</Button>
			</CardFooter>
		</Card>
	);
}

// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/auth-provider";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/components/ui/use-toast";
// import {
// 	Card,
// 	CardHeader,
// 	CardTitle,
// 	CardContent,
// 	CardFooter,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { FileText } from "lucide-react";

// interface Member {
// 	id: number;
// 	name: string;
// 	etNumber: number;
// }

// export default function LoanApplicationPage() {
// 	const [amount, setAmount] = useState("");
// 	const [interestRate, setInterestRate] = useState("7");
// 	const [tenureMonths, setTenureMonths] = useState("");
// 	const [purpose, setPurpose] = useState("");
// 	const [coSigner1, setCoSigner1] = useState("");
// 	const [coSigner2, setCoSigner2] = useState("");
// 	const [members, setMembers] = useState<Member[]>([]);
// 	const [file, setFile] = useState<File | null>(null);
// 	const [maxLoanAmount, setMaxLoanAmount] = useState(0);
// 	const { user } = useAuth();
// 	const router = useRouter();
// 	const { toast } = useToast();

// 	useEffect(() => {
// 		fetchMembers();
// 		fetchMemberContribution();
// 	}, []);

// 	const fetchMembers = async () => {
// 		try {
// 			const response = await fetch("/api/members");
// 			if (response.ok) {
// 				const data = await response.json();
// 				setMembers(data.filter((member: Member) => member.id !== user?.id));
// 			} else {
// 				throw new Error("Failed to fetch members");
// 			}
// 		} catch (error) {
// 			console.error("Error fetching members:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to load members. Please try again.",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const fetchMemberContribution = async () => {
// 		try {
// 			const response = await fetch("/api/members/contribution");
// 			if (response.ok) {
// 				const data = await response.json();
// 				setMaxLoanAmount(data.totalContribution / 3);
// 			} else {
// 				throw new Error("Failed to fetch member contribution");
// 			}
// 		} catch (error) {
// 			console.error("Error fetching member contribution:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to load your contribution data. Please try again.",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		if (e.target.files) {
// 			setFile(e.target.files[0]);
// 		}
// 	};

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		if (!file) {
// 			toast({
// 				title: "Error",
// 				description: "Please upload the signed loan agreement document.",
// 				variant: "destructive",
// 			});
// 			return;
// 		}

// 		const amountValue = Number.parseFloat(amount);
// 		if (amountValue > maxLoanAmount) {
// 			toast({
// 				title: "Error",
// 				description: `Loan amount cannot exceed ${maxLoanAmount.toFixed(
// 					2
// 				)} ETB (1/3 of your total contribution).`,
// 				variant: "destructive",
// 			});
// 			return;
// 		}

// 		if (Number.parseFloat(interestRate) !== 7) {
// 			toast({
// 				title: "Error",
// 				description: "Interest rate must be 7%.",
// 				variant: "destructive",
// 			});
// 			return;
// 		}

// 		if (Number.parseInt(tenureMonths) > 6) {
// 			toast({
// 				title: "Error",
// 				description: "Loan tenure cannot exceed 6 months.",
// 				variant: "destructive",
// 			});
// 			return;
// 		}

// 		const formData = new FormData();
// 		formData.append("amount", amount);
// 		formData.append("interestRate", interestRate);
// 		formData.append("tenureMonths", tenureMonths);
// 		formData.append("purpose", purpose);
// 		formData.append("coSigner1", coSigner1);
// 		formData.append("coSigner2", coSigner2);
// 		formData.append("agreement", file);

// 		try {
// 			const response = await fetch("/api/loans/apply", {
// 				method: "POST",
// 				body: formData,
// 			});

// 			if (response.ok) {
// 				toast({ title: "Loan application submitted successfully" });
// 				router.push("/member/loans");
// 			} else {
// 				throw new Error("Failed to submit loan application");
// 			}
// 		} catch (error) {
// 			console.error("Error submitting loan application:", error);
// 			toast({
// 				title: "Failed to submit loan application",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const handleDownloadAgreement = async () => {
// 		try {
// 			const response = await fetch("/api/loans/agreement-template");
// 			if (response.ok) {
// 				const blob = await response.blob();
// 				const url = window.URL.createObjectURL(blob);
// 				const a = document.createElement("a");
// 				a.style.display = "none";
// 				a.href = url;
// 				a.download = "loan_agreement_template.pdf";
// 				document.body.appendChild(a);
// 				a.click();
// 				window.URL.revokeObjectURL(url);
// 			} else {
// 				throw new Error("Failed to download agreement template");
// 			}
// 		} catch (error) {
// 			console.error("Error downloading agreement template:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to download agreement template. Please try again.",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	return (
// 		<Card className="max-w-2xl mx-auto">
// 			<CardHeader>
// 				<CardTitle>Apply for a Loan</CardTitle>
// 			</CardHeader>
// 			<CardContent>
// 				<div className="mb-6 flex flex-col items-center">
// 					<Button
// 						onClick={handleDownloadAgreement}
// 						variant="outline"
// 						className="w-full h-32 flex flex-col items-center justify-center">
// 						<FileText size={48} className="mb-2" />
// 						<span>Download Loan Agreement Template</span>
// 					</Button>
// 					<p className="mt-2 text-sm text-gray-500">
// 						Please download, review, and sign the loan agreement before
// 						uploading.
// 					</p>
// 				</div>
// 				<form onSubmit={handleSubmit} className="space-y-4">
// 					<div>
// 						<Label htmlFor="amount">Loan Amount (ETB)</Label>
// 						<Input
// 							type="number"
// 							id="amount"
// 							value={amount}
// 							onChange={(e) => setAmount(e.target.value)}
// 							max={maxLoanAmount}
// 							required
// 						/>
// 						<p className="text-sm text-gray-500 mt-1">
// 							Maximum amount: {maxLoanAmount.toFixed(2)} ETB
// 						</p>
// 					</div>
// 					<div>
// 						<Label htmlFor="interestRate">Interest Rate (%)</Label>
// 						<Input
// 							type="number"
// 							id="interestRate"
// 							value={interestRate}
// 							onChange={(e) => setInterestRate(e.target.value)}
// 							required
// 							disabled
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="tenureMonths">Loan Tenure (months)</Label>
// 						<Input
// 							type="number"
// 							id="tenureMonths"
// 							value={tenureMonths}
// 							onChange={(e) => setTenureMonths(e.target.value)}
// 							max={6}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="purpose">Loan Purpose</Label>
// 						<Input
// 							type="text"
// 							id="purpose"
// 							value={purpose}
// 							onChange={(e) => setPurpose(e.target.value)}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="coSigner1">Co-Signer 1</Label>
// 						<Select value={coSigner1} onValueChange={setCoSigner1}>
// 							<SelectTrigger>
// 								<SelectValue placeholder="Select Co-Signer 1" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								{members.map((member) => (
// 									<SelectItem key={member.id} value={member.id.toString()}>
// 										{member.name} (ET: {member.etNumber})
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 					</div>
// 					<div>
// 						<Label htmlFor="coSigner2">Co-Signer 2</Label>
// 						<Select value={coSigner2} onValueChange={setCoSigner2}>
// 							<SelectTrigger>
// 								<SelectValue placeholder="Select Co-Signer 2" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								{members.map((member) => (
// 									<SelectItem key={member.id} value={member.id.toString()}>
// 										{member.name} (ET: {member.etNumber})
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 					</div>
// 					<div>
// 						<Label htmlFor="agreement">Signed Loan Agreement Document</Label>
// 						<Input
// 							type="file"
// 							id="agreement"
// 							onChange={handleFileChange}
// 							accept=".pdf,.doc,.docx"
// 							required
// 						/>
// 					</div>
// 					<Button type="submit" className="w-full">
// 						Submit Loan Application
// 					</Button>
// 				</form>
// 			</CardContent>
// 			<CardFooter className="flex justify-between">
// 				<Button
// 					variant="outline"
// 					onClick={() => router.push("/member/loans/calculator")}>
// 					Go to Loan Calculator
// 				</Button>
// 				<Button variant="outline" onClick={() => router.push("/member/loans")}>
// 					Back to Loans
// 				</Button>
// 			</CardFooter>
// 		</Card>
// 	);
// }

// "use client";

// import type React from "react";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/auth-provider";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/components/ui/use-toast";
// import {
// 	Card,
// 	CardHeader,
// 	CardTitle,
// 	CardContent,
// 	CardFooter,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { FileText } from "lucide-react";

// interface Member {
// 	id: number;
// 	name: string;
// 	etNumber: number;
// }

// export default function LoanApplicationPage() {
// 	const [amount, setAmount] = useState("");
// 	const [interestRate, setInterestRate] = useState("");
// 	const [tenureMonths, setTenureMonths] = useState("");
// 	const [purpose, setPurpose] = useState("");
// 	const [coSigner1, setCoSigner1] = useState("");
// 	const [coSigner2, setCoSigner2] = useState("");
// 	const [members, setMembers] = useState<Member[]>([]);
// 	const [file, setFile] = useState<File | null>(null);
// 	const { user } = useAuth();
// 	const router = useRouter();
// 	const { toast } = useToast();

// 	useEffect(() => {
// 		fetchMembers();
// 	}, []);

// 	const fetchMembers = async () => {
// 		try {
// 			const response = await fetch("/api/members");
// 			if (response.ok) {
// 				const data = await response.json();
// 				setMembers(data.filter((member: Member) => member.id !== user?.id));
// 			} else {
// 				throw new Error("Failed to fetch members");
// 			}
// 		} catch (error) {
// 			console.error("Error fetching members:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to load members. Please try again.",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		if (e.target.files) {
// 			setFile(e.target.files[0]);
// 		}
// 	};

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		if (!file) {
// 			toast({
// 				title: "Error",
// 				description: "Please upload the signed loan agreement document.",
// 				variant: "destructive",
// 			});
// 			return;
// 		}

// 		const formData = new FormData();
// 		formData.append("amount", amount);
// 		formData.append("interestRate", interestRate);
// 		formData.append("tenureMonths", tenureMonths);
// 		formData.append("purpose", purpose);
// 		formData.append("coSigner1", coSigner1);
// 		formData.append("coSigner2", coSigner2);
// 		formData.append("agreement", file);

// 		try {
// 			const response = await fetch("/api/loans/apply", {
// 				method: "POST",
// 				body: formData,
// 			});

// 			if (response.ok) {
// 				toast({ title: "Loan application submitted successfully" });
// 				router.push("/member/loans");
// 			} else {
// 				throw new Error("Failed to submit loan application");
// 			}
// 		} catch (error) {
// 			console.error("Error submitting loan application:", error);
// 			toast({
// 				title: "Failed to submit loan application",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const handleDownloadAgreement = async () => {
// 		try {
// 			const response = await fetch("/api/loans/agreement-template");
// 			if (response.ok) {
// 				const blob = await response.blob();
// 				const url = window.URL.createObjectURL(blob);
// 				const a = document.createElement("a");
// 				a.style.display = "none";
// 				a.href = url;
// 				a.download = "loan_agreement_template.pdf";
// 				document.body.appendChild(a);
// 				a.click();
// 				window.URL.revokeObjectURL(url);
// 			} else {
// 				throw new Error("Failed to download agreement template");
// 			}
// 		} catch (error) {
// 			console.error("Error downloading agreement template:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to download agreement template. Please try again.",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	return (
// 		<Card className="max-w-2xl mx-auto">
// 			<CardHeader>
// 				<CardTitle>Apply for a Loan</CardTitle>
// 			</CardHeader>
// 			<CardContent>
// 				<div className="mb-6 flex flex-col items-center">
// 					<Button
// 						onClick={handleDownloadAgreement}
// 						variant="outline"
// 						className="w-full h-32 flex flex-col items-center justify-center">
// 						<FileText size={48} className="mb-2" />
// 						<span>Download Loan Agreement Template</span>
// 					</Button>
// 					<p className="mt-2 text-sm text-gray-500">
// 						Please download, review, and sign the loan agreement before
// 						uploading.
// 					</p>
// 				</div>
// 				<form onSubmit={handleSubmit} className="space-y-4">
// 					<div>
// 						<Label htmlFor="amount">Loan Amount (ETB)</Label>
// 						<Input
// 							type="number"
// 							id="amount"
// 							value={amount}
// 							onChange={(e) => setAmount(e.target.value)}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="interestRate">Interest Rate (%)</Label>
// 						<Input
// 							type="number"
// 							id="interestRate"
// 							value={interestRate}
// 							onChange={(e) => setInterestRate(e.target.value)}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="tenureMonths">Loan Tenure (months)</Label>
// 						<Input
// 							type="number"
// 							id="tenureMonths"
// 							value={tenureMonths}
// 							onChange={(e) => setTenureMonths(e.target.value)}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="purpose">Loan Purpose</Label>
// 						<Input
// 							type="text"
// 							id="purpose"
// 							value={purpose}
// 							onChange={(e) => setPurpose(e.target.value)}
// 							required
// 						/>
// 					</div>
// 					<div>
// 						<Label htmlFor="coSigner1">Co-Signer 1</Label>
// 						<Select value={coSigner1} onValueChange={setCoSigner1}>
// 							<SelectTrigger>
// 								<SelectValue placeholder="Select Co-Signer 1" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								{members.map((member) => (
// 									<SelectItem key={member.id} value={member.id.toString()}>
// 										{member.name} (ET: {member.etNumber})
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 					</div>
// 					<div>
// 						<Label htmlFor="coSigner2">Co-Signer 2</Label>
// 						<Select value={coSigner2} onValueChange={setCoSigner2}>
// 							<SelectTrigger>
// 								<SelectValue placeholder="Select Co-Signer 2" />
// 							</SelectTrigger>
// 							<SelectContent>
// 								{members.map((member) => (
// 									<SelectItem key={member.id} value={member.id.toString()}>
// 										{member.name} (ET: {member.etNumber})
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 					</div>
// 					<div>
// 						<Label htmlFor="agreement">Signed Loan Agreement Document</Label>
// 						<Input
// 							type="file"
// 							id="agreement"
// 							onChange={handleFileChange}
// 							accept=".pdf,.doc,.docx"
// 							required
// 						/>
// 					</div>
// 					<Button type="submit" className="w-full">
// 						Submit Loan Application
// 					</Button>
// 				</form>
// 			</CardContent>
// 			<CardFooter className="flex justify-between">
// 				<Button
// 					variant="outline"
// 					onClick={() => router.push("/member/loans/calculator")}>
// 					Go to Loan Calculator
// 				</Button>
// 				<Button variant="outline" onClick={() => router.push("/member/loans")}>
// 					Back to Loans
// 				</Button>
// 			</CardFooter>
// 		</Card>
// 	);
// }
