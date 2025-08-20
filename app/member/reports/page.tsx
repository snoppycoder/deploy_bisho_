// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/components/ui/use-toast";
// import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

// const ticketSchema = z.object({
// 	subject: z.string().min(5, "Subject must be at least 5 characters long"),
// 	category: z.enum(["savings", "loans", "transactions", "other"]),
// 	description: z
// 		.string()
// 		.min(20, "Description must be at least 20 characters long"),
// 	priority: z.enum(["low", "medium", "high"]),
// });

// type TicketFormData = z.infer<typeof ticketSchema>;

// export default function MemberReportsPage() {
// 	const [isSubmitting, setIsSubmitting] = useState(false);
// 	const [isSuccess, setIsSuccess] = useState(false);
// 	const { toast } = useToast();
// 	const {
// 		register,
// 		handleSubmit,
// 		formState: { errors },
// 		reset,
// 	} = useForm<TicketFormData>({
// 		resolver: zodResolver(ticketSchema),
// 	});

// 	const onSubmit = async (data: TicketFormData) => {
// 		setIsSubmitting(true);
// 		// Simulating API call
// 		await new Promise((resolve) => setTimeout(resolve, 2000));
// 		setIsSubmitting(false);
// 		setIsSuccess(true);
// 		toast({
// 			title: "Ticket Submitted",
// 			description:
// 				"Your issue has been reported successfully. We'll get back to you soon.",
// 			duration: 5000,
// 		});
// 		reset();
// 		// Reset success state after 5 seconds
// 		setTimeout(() => setIsSuccess(false), 5000);
// 	};

// 	return (
// 		<div className="container mx-auto py-10">
// 			<h1 className="text-3xl font-bold mb-6">Report an Issue</h1>
// 			<Card className="w-full max-w-2xl mx-auto">
// 				<CardHeader>
// 					<CardTitle>Submit a Ticket</CardTitle>
// 					<CardDescription>
// 						If you're experiencing any issues with your savings, loans, or
// 						transactions, please fill out this form to report the problem.
// 					</CardDescription>
// 				</CardHeader>
// 				<CardContent>
// 					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
// 						<div className="space-y-2">
// 							<Label htmlFor="subject">Subject</Label>
// 							<Input
// 								id="subject"
// 								{...register("subject")}
// 								placeholder="Brief description of the issue"
// 							/>
// 							{errors.subject && (
// 								<p className="text-sm text-red-500">{errors.subject.message}</p>
// 							)}
// 						</div>
// 						<div className="space-y-2">
// 							<Label htmlFor="category">Category</Label>
// 							<Select
// 								onValueChange={(value) =>
// 									register("category").onChange({ target: { value } })
// 								}>
// 								<SelectTrigger>
// 									<SelectValue placeholder="Select a category" />
// 								</SelectTrigger>
// 								<SelectContent>
// 									<SelectItem value="savings">Savings</SelectItem>
// 									<SelectItem value="loans">Loans</SelectItem>
// 									<SelectItem value="transactions">Transactions</SelectItem>
// 									<SelectItem value="other">Other</SelectItem>
// 								</SelectContent>
// 							</Select>
// 							{errors.category && (
// 								<p className="text-sm text-red-500">
// 									{errors.category.message}
// 								</p>
// 							)}
// 						</div>
// 						<div className="space-y-2">
// 							<Label htmlFor="description">Description</Label>
// 							<Textarea
// 								id="description"
// 								{...register("description")}
// 								placeholder="Please provide details about the issue"
// 								rows={5}
// 							/>
// 							{errors.description && (
// 								<p className="text-sm text-red-500">
// 									{errors.description.message}
// 								</p>
// 							)}
// 						</div>
// 						<div className="space-y-2">
// 							<Label htmlFor="priority">Priority</Label>
// 							<Select
// 								onValueChange={(value) =>
// 									register("priority").onChange({ target: { value } })
// 								}>
// 								<SelectTrigger>
// 									<SelectValue placeholder="Select priority" />
// 								</SelectTrigger>
// 								<SelectContent>
// 									<SelectItem value="low">Low</SelectItem>
// 									<SelectItem value="medium">Medium</SelectItem>
// 									<SelectItem value="high">High</SelectItem>
// 								</SelectContent>
// 							</Select>
// 							{errors.priority && (
// 								<p className="text-sm text-red-500">
// 									{errors.priority.message}
// 								</p>
// 							)}
// 						</div>
// 					</form>
// 				</CardContent>
// 				<CardFooter>
// 					<Button
// 						type="submit"
// 						onClick={handleSubmit(onSubmit)}
// 						disabled={isSubmitting || isSuccess}
// 						className="w-full">
// 						{isSubmitting ? (
// 							<>
// 								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 								Submitting...
// 							</>
// 						) : isSuccess ? (
// 							<>
// 								<CheckCircle className="mr-2 h-4 w-4" />
// 								Submitted Successfully
// 							</>
// 						) : (
// 							<>
// 								<AlertCircle className="mr-2 h-4 w-4" />
// 								Submit Ticket
// 							</>
// 						)}
// 					</Button>
// 				</CardFooter>
// 			</Card>
// 		</div>
// 	);
// }
