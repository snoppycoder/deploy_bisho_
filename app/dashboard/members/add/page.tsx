"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
	memberNumber: z
		.string()
		.refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
			message: "Member number must be a positive number",
		}),
	etNumber: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
		message: "ET number must be a positive number",
	}),
	name: z.string().min(2, {
		message: "Name must be at least 2 characters",
	}),
	division: z.string().optional(),
	department: z.string().optional(),
	section: z.string().optional(),
	group: z.string().optional(),
});

export default function AddMemberPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			memberNumber: "",
			etNumber: "",
			name: "",
			division: "",
			department: "",
			section: "",
			group: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/members", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				throw new Error("Failed to create member");
			}

			toast({
				title: "Success",
				description: "Member created successfully",
			});

			router.push("/dashboard/members");
		} catch (error) {
			console.error("Error creating member:", error);
			toast({
				title: "Error",
				description: "Failed to create member. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Add New Member</h1>
			<Card>
				<CardHeader>
					<CardTitle>Member Information</CardTitle>
					<CardDescription>Enter the details of the new member</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="memberNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Member Number</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormDescription>The unique member number</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="etNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>ET Number</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormDescription>The employee's ET number</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormDescription>The member's full name</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="division"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Division</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="department"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Department</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="section"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Section</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="group"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Group</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create Member"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
