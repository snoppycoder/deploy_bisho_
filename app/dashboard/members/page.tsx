"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { format, startOfMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { DatePicker } from "@/components/ui/date_picker";

interface Member {
	id: number;
	memberNumber: number;
	etNumber: number;
	name: string;
	division: string | null;
	department: string | null;
	section: string | null;
	group: string | null;
	effectiveDate: string | null;
	balance: {
		totalSavings: number;
		totalContributions: number;
		membershipFee: number;
		willingDeposit: number;
		loanRepayments: number;
	};
}

export default function MembersListPage() {
	const [members, setMembers] = useState<Member[]>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [effectiveDate, setEffectiveDate] = useState<Date | null>(null);
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		fetchMembers();
	}, [effectiveDate]);

	const fetchMembers = async () => {
		try {
			const url = new URL("/api/members", window.location.origin);
			if (effectiveDate) {
				const monthStart = startOfMonth(effectiveDate);
				url.searchParams.append("effectiveDate", monthStart.toISOString());
			}
			const response = await fetch(url.toString());
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
		}
	};

	const columns: ColumnDef<Member>[] = useMemo(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={table.getIsAllPageRowsSelected()}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="Select all"
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				),
				enableSorting: false,
				enableHiding: false,
			},
			{
				accessorKey: "memberNumber",
				header: "Member Number",
				cell: ({ row }) => <div>{row.getValue("memberNumber")}</div>,
			},
			{
				accessorKey: "etNumber",
				header: "ET Number",
				cell: ({ row }) => <div>{row.getValue("etNumber")}</div>,
			},
			{
				accessorKey: "name",
				header: ({ column }) => {
					return (
						<Button
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}>
							Name
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},
				cell: ({ row }) => <div>{row.getValue("name")}</div>,
			},
			{
				accessorKey: "division",
				header: "Division",
				cell: ({ row }) => <div>{row.getValue("division")}</div>,
			},
			{
				accessorKey: "department",
				header: "Department",
				cell: ({ row }) => <div>{row.getValue("department")}</div>,
			},
			{
				accessorKey: "section",
				header: "Section",
				cell: ({ row }) => <div>{row.getValue("section")}</div>,
			},
			{
				accessorKey: "effectiveDate",
				header: "Effective Date",
				cell: ({ row }) => {
					const date = row.getValue("effectiveDate");
					return date ? format(new Date(date as string), "MMMM yyyy") : "N/A";
				},
			},
			{
				accessorKey: "balance.totalSavings",
				header: "Total Savings",
				cell: ({ row }) => {
					const amount = row.original.balance.totalSavings;
					const formatted = new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "ETB",
					}).format(amount);
					return <div>{formatted}</div>;
				},
			},
			{
				accessorKey: "balance.totalContributions",
				header: "Total Contributions",
				cell: ({ row }) => {
					const amount = row.original.balance.totalContributions;
					const formatted = new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "ETB",
					}).format(amount);
					return <div>{formatted}</div>;
				},
			},
			{
				accessorKey: "balance.loanRepayments",
				header: "Loan Repayments",
				cell: ({ row }) => {
					const amount = row.original.balance.loanRepayments;
					const formatted = new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "ETB",
					}).format(amount);
					return <div>{formatted}</div>;
				},
			},
			{
				accessorKey: "balance.membershipFee",
				header: "Membership Fee",
				cell: ({ row }) => {
					const amount = row.original.balance.membershipFee;
					const formatted = new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "ETB",
					}).format(amount);
					return <div>{formatted}</div>;
				},
			},
			{
				accessorKey: "balance.willingDeposit",
				header: "Willing Deposit",
				cell: ({ row }) => {
					const amount = row.original.balance.willingDeposit;
					const formatted = new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "ETB",
					}).format(amount);
					return <div>{formatted}</div>;
				},
			},
			{
				id: "actions",
				enableHiding: false,
				cell: ({ row }) => {
					const member = row.original;

					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() =>
										router.push(`/dashboard/members/${member.etNumber}`)
									}>
									View Details
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										router.push(`/dashboard/members/edit/${member.etNumber}`)
									}>
									Edit Member
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>Delete Member</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[router]
	);

	const table = useReactTable({
		data: members,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Members List</h1>
				<div className="flex items-center space-x-2">
					<DatePicker
						selected={effectiveDate}
						onSelect={(date: any) => setEffectiveDate(date)}
						placeholderText="Select Effective Month"
						dateFormat="MMMM yyyy"
						showMonthYearPicker
					/>
					<Input
						placeholder="Filter members..."
						value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
						onChange={(event) =>
							table.getColumn("name")?.setFilterValue(event.target.value)
						}
						className="max-w-sm"
					/>
					<Button onClick={() => router.push("/dashboard/members/add")}>
						Add Member
					</Button>
					<Button onClick={() => router.push("/dashboard/members/import")}>
						Import Members
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto">
								Columns <ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
