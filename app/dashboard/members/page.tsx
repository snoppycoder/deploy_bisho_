"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface Member {
	id: number;
	memberNumber: number;
	etNumber: number;
	name: string;
	division: string | null;
	department: string | null;
	section: string | null;
	group: string | null;
}

export default function MembersListPage() {
	const [members, setMembers] = useState<Member[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const router = useRouter();
	const { toast } = useToast();

	// Fetch members data
	const fetchMembers = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/members");
			if (!response.ok) {
				throw new Error("Failed to fetch members");
			}
			const data = await response.json();
			setMembers(data);
		} catch (error) {
			console.error("Error fetching members:", error);
			toast({
				title: "Error",
				description: "Failed to load members. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Call fetchMembers when the component mounts
	useEffect(() => {
		fetchMembers();
	}, []);

	const filteredMembers = members.filter(
		(member) =>
			member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.memberNumber.toString().includes(searchTerm) ||
			member.etNumber.toString().includes(searchTerm)
	);

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Members List</h1>
			<div className="flex justify-between items-center">
				<Input
					placeholder="Search members..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="max-w-sm"
				/>
				<Button onClick={() => router.push("/dashboard/members/import")}>
					Import Members
				</Button>
			</div>
			{isLoading ? (
				<p>Loading members...</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Member Number</TableHead>
							<TableHead>ET Number</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Division</TableHead>
							<TableHead>Department</TableHead>
							<TableHead>Section</TableHead>
							<TableHead>Group</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredMembers.map((member) => (
							<TableRow key={member.id}>
								<TableCell>{member.memberNumber}</TableCell>
								<TableCell>{member.etNumber}</TableCell>
								<TableCell>{member.name}</TableCell>
								<TableCell>{member.division}</TableCell>
								<TableCell>{member.department}</TableCell>
								<TableCell>{member.section}</TableCell>
								<TableCell>{member.group}</TableCell>
								<TableCell>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											router.push(`/dashboard/members/${member.id}`)
										}>
										View
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
