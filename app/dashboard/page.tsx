"use client";

import { useState, useEffect, useRef } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	AreaChart,
	BarChart,
	LineChart,
	PieChart,
} from "@/components/ui/chart";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	Users,
	CreditCard,
	DollarSign,
	TrendingUp,
	AlertTriangle,
	UserPlus,
	Clock,
	CheckCircle2,
	AlertCircle,
	RefreshCw,
	Printer,
	ChevronRight,
	ArrowUpRight,
	ArrowDownRight,
	Filter,
	Download,
	Calendar,
	BarChart3,
	PieChartIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
	// Basic metrics
	totalMembers: number;
	activeLoanCount: number;
	totalSavings: number;
	pendingApprovals: number;

	// Financial metrics from transactions
	membershipFees: number;
	willingDeposits: number;
	loanRepayments: number;

	// Loan portfolio metrics
	loanPortfolio: number;
	outstandingLoans: number;
	portfolioAtRisk: number;

	// Distributions
	loanStatusDistribution: { name: string; value: number; amount: number }[];
	departmentDistribution: { name: string; value: number }[];
	transactionDistribution: { name: string; value: number; count: number }[];
	loanSizeDistribution: { name: string; value: number }[];

	// Trends
	loanTrends: { name: string; Applications: number; Disbursements: number }[];
	savingsTrends: { name: string; amount: number }[];
	repaymentTrends: { name: string; Expected: number; Actual: number }[];

	// Lists
	recentLoans: {
		id: number;
		memberName: string;
		amount: number;
		status: string;
		createdAt: string;
	}[];
	topSavers: {
		memberId: number;
		memberName: string;
		totalSavings: number;
		etNumber: any;
	}[];
}

// Animation variants for staggered animations
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			type: "spring",
			stiffness: 260,
			damping: 20,
		},
	},
};

// Skeleton loader for KPI cards
const KPICardSkeleton = () => (
	<Card className="overflow-hidden">
		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<Skeleton className="h-5 w-24" />
			<Skeleton className="h-4 w-4 rounded-full" />
		</CardHeader>
		<CardContent>
			<Skeleton className="h-8 w-20 mb-2" />
			<Skeleton className="h-4 w-full" />
		</CardContent>
	</Card>
);

// Skeleton loader for charts
const ChartSkeleton = () => (
	<Card>
		<CardHeader>
			<Skeleton className="h-6 w-40 mb-2" />
			<Skeleton className="h-4 w-60" />
		</CardHeader>
		<CardContent>
			<Skeleton className="h-[300px] w-full rounded-md" />
		</CardContent>
	</Card>
);

export default function DashboardPage() {
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState("overview");
	const [timeRange, setTimeRange] = useState("month");
	const router = useRouter();
	const chartContainerRef = useRef<HTMLDivElement>(null);

	// Update the fetchDashboardData function to bypass cache
	const fetchDashboardData = async () => {
		setIsLoading(true);
		try {
			// Add timestamp and cache control to ensure fresh data
			const response = await fetch(`/api/dashboard?t=${new Date().getTime()}`, {
				cache: "no-store",
				headers: {
					"Cache-Control": "no-cache, no-store, must-revalidate",
					"Pragma": "no-cache",
					"Expires": "0",
				},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch dashboard data");
			}
			const data = await response.json();
			setDashboardData(data);
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Update the refreshData function to use the same cache-busting approach
	const refreshData = async () => {
		if (isRefreshing) return;

		setIsRefreshing(true);
		try {
			// Add timestamp and cache control to ensure fresh data
			const response = await fetch(`/api/dashboard?t=${new Date().getTime()}`, {
				cache: "no-store",
				headers: {
					"Cache-Control": "no-cache, no-store, must-revalidate",
					"Pragma": "no-cache",
					"Expires": "0",
				},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch dashboard data");
			}
			const data = await response.json();
			setDashboardData(data);
		} catch (error) {
			console.error("Error refreshing dashboard data:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	useEffect(() => {
		// Initial data fetch
		fetchDashboardData();

		// Set up polling interval (every 5 minutes)
		const intervalId = setInterval(() => {
			fetchDashboardData();
		}, 5 * 60 * 1000);

		// Clean up interval on component unmount
		return () => clearInterval(intervalId);
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("et-ET", {
			style: "currency",
			currency: "ETB",
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const formatPercentage = (value: number) => {
		return `${value.toFixed(2)}%`;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PENDING":
				return "bg-yellow-100 text-yellow-800 border-yellow-300";
			case "VERIFIED":
				return "bg-blue-100 text-blue-800 border-blue-300";
			case "APPROVED":
				return "bg-green-100 text-green-800 border-green-300";
			case "DISBURSED":
				return "bg-purple-100 text-purple-800 border-purple-300";
			case "REPAID":
				return "bg-gray-100 text-gray-800 border-gray-300";
			case "REJECTED":
				return "bg-red-100 text-red-800 border-red-300";
			default:
				return "bg-gray-100 text-gray-800 border-gray-300";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "PENDING":
				return <Clock className="h-3 w-3" />;
			case "VERIFIED":
				return <CheckCircle2 className="h-3 w-3" />;
			case "APPROVED":
				return <CheckCircle2 className="h-3 w-3" />;
			case "DISBURSED":
				return <DollarSign className="h-3 w-3" />;
			case "REPAID":
				return <CheckCircle2 className="h-3 w-3" />;
			case "REJECTED":
				return <AlertCircle className="h-3 w-3" />;
			default:
				return null;
		}
	};

	const getTrendIcon = (current: number, previous: number) => {
		if (current > previous) {
			return <ArrowUpRight className="h-3 w-3 text-green-500" />;
		} else if (current < previous) {
			return <ArrowDownRight className="h-3 w-3 text-red-500" />;
		}
		return null;
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-5 animate-in fade-in-50 duration-500">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold tracking-tight">
						Microfinance Dashboard
					</h1>
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-28 rounded-md" />
						<Skeleton className="h-9 w-28 rounded-md" />
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<KPICardSkeleton />
					<KPICardSkeleton />
					<KPICardSkeleton />
					<KPICardSkeleton />
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<KPICardSkeleton />
					<KPICardSkeleton />
					<KPICardSkeleton />
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<KPICardSkeleton />
					<KPICardSkeleton />
					<KPICardSkeleton />
				</div>

				<div className="space-y-4">
					<Skeleton className="h-10 w-96 rounded-md" />
					<div className="grid gap-4 md:grid-cols-2">
						<ChartSkeleton />
						<ChartSkeleton />
					</div>
				</div>
			</div>
		);
	}

	if (!dashboardData) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex items-center justify-center h-[80vh]">
				<div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-lg border border-red-100">
					<AlertCircle className="h-16 w-16 text-red-500" />
					<h2 className="text-2xl font-bold text-gray-800">
						Failed to load dashboard data
					</h2>
					<p className="text-gray-600 text-center max-w-md">
						We couldn't load your dashboard data. This might be due to a network
						issue or server problem.
					</p>
					<Button
						onClick={() => window.location.reload()}
						className="mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
						<RefreshCw className="mr-2 h-4 w-4" />
						Retry
					</Button>
				</div>
			</motion.div>
		);
	}

	// Calculate loan-to-savings ratio
	const loanToSavingsRatio =
		dashboardData.totalSavings > 0
			? (dashboardData.loanPortfolio / dashboardData.totalSavings) * 100
			: 0;

	// Calculate repayment rate
	const totalExpected = dashboardData.repaymentTrends.reduce(
		(sum, item) => sum + item.Expected,
		0
	);
	const totalActual = dashboardData.repaymentTrends.reduce(
		(sum, item) => sum + item.Actual,
		0
	);
	const repaymentRate =
		totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0;

	return (
		<motion.div
			className="flex flex-col gap-5"
			initial="hidden"
			animate="visible"
			variants={containerVariants}>
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
				<div>
					<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
						Microfinance Dashboard
					</h1>
					<p className="text-gray-500 mt-1">
						Financial overview and performance metrics
					</p>
				</div>
				<div className="flex items-center gap-2 self-end md:self-auto">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={refreshData}
									disabled={isRefreshing}
									className="relative overflow-hidden transition-all duration-200 hover:border-blue-500 hover:text-blue-600">
									{isRefreshing ? (
										<RefreshCw className="h-4 w-4 animate-spin" />
									) : (
										<RefreshCw className="h-4 w-4" />
									)}
									<span className="ml-2">Refresh</span>
									{isRefreshing && (
										<span className="absolute bottom-0 left-0 h-0.5 bg-blue-500 animate-progress"></span>
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Refresh dashboard data</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={() => window.print()}
									className="transition-all duration-200 hover:border-blue-500 hover:text-blue-600">
									<Printer className="h-4 w-4" />
									<span className="ml-2">Export</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Export dashboard as PDF</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Time range filter */}
			<div className="flex items-center justify-end gap-2 -mt-2">
				<span className="text-sm text-gray-500">Time range:</span>
				<div className="flex items-center border rounded-md overflow-hidden">
					{["week", "month", "quarter", "year"].map((range) => (
						<button
							key={range}
							className={`px-3 py-1 text-xs font-medium ${
								timeRange === range
									? "bg-blue-100 text-blue-700"
									: "bg-white text-gray-600 hover:bg-gray-50"
							}`}
							onClick={() => setTimeRange(range)}>
							{range.charAt(0).toUpperCase() + range.slice(1)}
						</button>
					))}
				</div>
			</div>

			{/* Key Performance Indicators */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<motion.div variants={itemVariants}>
					<Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-l-blue-500">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Members
							</CardTitle>
							<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
								<Users className="h-4 w-4 text-blue-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardData.totalMembers.toLocaleString()}
							</div>
							<div className="flex items-center pt-1">
								<span className="text-xs text-muted-foreground">
									Active membership base
								</span>
								<Button
									variant="link"
									className="h-auto p-0 pl-2"
									onClick={() => router.push("/dashboard/members")}>
									<span className="text-xs flex items-center">
										View all <ChevronRight className="h-3 w-3" />
									</span>
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-l-purple-500">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Loans
							</CardTitle>
							<div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
								<CreditCard className="h-4 w-4 text-purple-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardData.activeLoanCount.toLocaleString()}
							</div>
							<div className="flex items-center pt-1">
								<span className="text-xs text-muted-foreground">
									{formatCurrency(dashboardData.loanPortfolio)} total portfolio
								</span>
								<Button
									variant="link"
									className="h-auto p-0 pl-2"
									onClick={() => router.push("/dashboard/loans/disburse")}>
									<span className="text-xs flex items-center">
										View all <ChevronRight className="h-3 w-3" />
									</span>
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-l-green-500">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Savings
							</CardTitle>
							<div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
								<DollarSign className="h-4 w-4 text-green-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(dashboardData.totalSavings)}
							</div>
							<div className="flex items-center pt-1">
								<span className="text-xs text-muted-foreground">
									Loan-to-Savings Ratio: {formatPercentage(loanToSavingsRatio)}
								</span>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card
						className={`overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${
							dashboardData.portfolioAtRisk > 5
								? "border-l-red-500"
								: "border-l-amber-500"
						}`}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Portfolio at Risk
							</CardTitle>
							<div
								className={`h-8 w-8 rounded-full flex items-center justify-center ${
									dashboardData.portfolioAtRisk > 5
										? "bg-red-100"
										: "bg-amber-100"
								}`}>
								<AlertTriangle
									className={`h-4 w-4 ${
										dashboardData.portfolioAtRisk > 5
											? "text-red-600"
											: "text-amber-600"
									}`}
								/>
							</div>
						</CardHeader>
						<CardContent>
							<div
								className={`text-2xl font-bold ${
									dashboardData.portfolioAtRisk > 5 ? "text-red-500" : ""
								}`}>
								{formatPercentage(dashboardData.portfolioAtRisk)}
							</div>
							<div className="pt-1">
								<Progress
									value={dashboardData.portfolioAtRisk}
									max={20}
									className={`h-2 ${
										dashboardData.portfolioAtRisk > 5
											? "bg-red-100"
											: "bg-amber-100"
									}`}
								/>
								<span className="text-xs text-muted-foreground pt-1 block">
									{formatCurrency(dashboardData.outstandingLoans)} outstanding
								</span>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Transaction-based Financial Metrics */}
			<div className="grid gap-4 md:grid-cols-3">
				<motion.div variants={itemVariants}>
					<Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-gradient-to-br from-white to-blue-50">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Membership Fees
							</CardTitle>
							<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
								<Users className="h-4 w-4 text-blue-600" />
							</div>
						</CardHeader>
						<CardContent className="pb-2">
							<div className="text-2xl font-bold">
								{formatCurrency(dashboardData.membershipFees)}
							</div>
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">
									Total collected membership fees
								</span>
								{getTrendIcon(
									dashboardData.membershipFees,
									dashboardData.membershipFees * 0.9
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-gradient-to-br from-white to-green-50">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Willing Deposits
							</CardTitle>
							<div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
								<DollarSign className="h-4 w-4 text-green-600" />
							</div>
						</CardHeader>
						<CardContent className="pb-2">
							<div className="text-2xl font-bold">
								{formatCurrency(dashboardData.willingDeposits)}
							</div>
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">
									Total willing deposits
								</span>
								{getTrendIcon(
									dashboardData.willingDeposits,
									dashboardData.willingDeposits * 0.95
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-gradient-to-br from-white to-purple-50">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Loan Repayments
							</CardTitle>
							<div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
								<TrendingUp className="h-4 w-4 text-purple-600" />
							</div>
						</CardHeader>
						<CardContent className="pb-2">
							<div className="text-2xl font-bold">
								{formatCurrency(dashboardData.loanRepayments)}
							</div>
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">
									Total loan repayments received
								</span>
								{getTrendIcon(
									dashboardData.loanRepayments,
									dashboardData.loanRepayments * 0.92
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Secondary KPIs */}
			<div className="grid gap-4 md:grid-cols-3">
				<motion.div variants={itemVariants}>
					<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Pending Approvals
							</CardTitle>
							<div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
								<Clock className="h-4 w-4 text-amber-600" />
							</div>
						</CardHeader>
						<CardContent className="pb-2">
							<div className="text-2xl font-bold">
								{dashboardData.pendingApprovals}
							</div>
							<span className="text-xs text-muted-foreground">
								Loans awaiting approval
							</span>
						</CardContent>
						<CardFooter className="pt-0">
							<Button
								size="sm"
								className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
								onClick={() => router.push("/dashboard/loans/pending")}>
								Review Pending Loans
							</Button>
						</CardFooter>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Repayment Rate
							</CardTitle>
							<div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							</div>
						</CardHeader>
						<CardContent className="pb-2">
							<div className="text-2xl font-bold">
								{formatPercentage(repaymentRate)}
							</div>
							<span className="text-xs text-muted-foreground">
								{formatCurrency(totalActual)} collected of{" "}
								{formatCurrency(totalExpected)} expected
							</span>
						</CardContent>
						<CardFooter className="pt-0">
							<div className="w-full">
								<Progress value={repaymentRate} className="h-2 bg-gray-100" />
								<div className="flex justify-between mt-1 text-xs text-gray-500">
									<span>0%</span>
									<span>50%</span>
									<span>100%</span>
								</div>
							</div>
						</CardFooter>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">New Members</CardTitle>
							<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
								<UserPlus className="h-4 w-4 text-blue-600" />
							</div>
						</CardHeader>
						<CardContent className="pb-2">
							<div className="text-2xl font-bold">
								{Math.floor(dashboardData.totalMembers * 0.05)}
							</div>
							<span className="text-xs text-muted-foreground">
								New members this month
							</span>
						</CardContent>
						<CardFooter className="pt-0">
							<Button
								size="sm"
								className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
								onClick={() => router.push("/dashboard/membership-requests")}>
								View Membership Requests
							</Button>
						</CardFooter>
					</Card>
				</motion.div>
			</div>

			<motion.div variants={itemVariants} className="mt-4">
				<Tabs
					defaultValue="overview"
					className="space-y-4"
					value={activeTab}
					onValueChange={setActiveTab}>
					<div className="flex justify-between items-center">
						<TabsList className="bg-muted/60 p-1">
							<TabsTrigger
								value="overview"
								className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
								Overview
							</TabsTrigger>
							<TabsTrigger
								value="loans"
								className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
								Loan Portfolio
							</TabsTrigger>
							<TabsTrigger
								value="savings"
								className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
								Savings & Transactions
							</TabsTrigger>
							<TabsTrigger
								value="members"
								className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
								Member Analysis
							</TabsTrigger>
							<TabsTrigger
								value="performance"
								className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
								Performance
							</TabsTrigger>
						</TabsList>

						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" className="hidden md:flex">
								<Filter className="h-4 w-4 mr-2" />
								Filter
							</Button>
							<Button variant="outline" size="sm" className="hidden md:flex">
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
							<Button variant="outline" size="sm" className="hidden md:flex">
								<Calendar className="h-4 w-4 mr-2" />
								Date Range
							</Button>
						</div>
					</div>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2" ref={chartContainerRef}>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}>
								<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>Loan Activity</CardTitle>
												<CardDescription>
													Loan applications and disbursements over time
												</CardDescription>
											</div>
											<BarChart3 className="h-5 w-5 text-muted-foreground" />
										</div>
									</CardHeader>
									<CardContent className="px-2">
										<LineChart
											data={dashboardData.loanTrends}
											index="name"
											categories={["Applications", "Disbursements"]}
											colors={["#2563eb", "#16a34a"]}
											valueFormatter={(value: number) => `${value}`}
											className="h-[300px]"
										/>
									</CardContent>
								</Card>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}>
								<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>Loan Status Distribution</CardTitle>
												<CardDescription>
													Current status of all loans
												</CardDescription>
											</div>
											<PieChartIcon className="h-5 w-5 text-muted-foreground" />
										</div>
									</CardHeader>
									<CardContent>
										<PieChart
											data={dashboardData.loanStatusDistribution}
											index="name"
											categories={["value"]}
											colors={[
												"#2563eb",
												"#16a34a",
												"#eab308",
												"#ef4444",
												"#8b5cf6",
												"#6b7280",
											]}
											valueFormatter={(value: number) => `${value} loans`}
											className="h-[300px]"
										/>
									</CardContent>
								</Card>
							</motion.div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}>
								<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>Recent Loans</CardTitle>
												<CardDescription>
													Latest loan applications
												</CardDescription>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => router.push("/dashboard/loans")}>
												View All
											</Button>
										</div>
									</CardHeader>
									<CardContent>
										<div className="rounded-md border overflow-hidden">
											<Table>
												<TableHeader className="bg-muted/50">
													<TableRow>
														<TableHead className="font-medium">ID</TableHead>
														<TableHead className="font-medium">
															Member
														</TableHead>
														<TableHead className="font-medium">
															Amount
														</TableHead>
														<TableHead className="font-medium">
															Status
														</TableHead>
														<TableHead className="font-medium">Date</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{dashboardData.recentLoans.map((loan) => (
														<TableRow
															key={loan.id}
															className="hover:bg-muted/30 cursor-pointer transition-colors"
															onClick={() =>
																router.push(
																	`/dashboard/loans/details/${loan.id}`
																)
															}>
															<TableCell className="font-medium">
																{loan.id}
															</TableCell>
															<TableCell>{loan.memberName}</TableCell>
															<TableCell>
																{formatCurrency(Number(loan.amount))}
															</TableCell>
															<TableCell>
																<Badge
																	className={`${getStatusColor(
																		loan.status
																	)} flex w-fit items-center gap-1 px-2 py-0.5`}>
																	{getStatusIcon(loan.status)}
																	{loan.status}
																</Badge>
															</TableCell>
															<TableCell>
																{new Date(loan.createdAt).toLocaleDateString()}
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									</CardContent>
								</Card>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}>
								<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
									<CardHeader>
										<div className="flex justify-between items-center">
											<div>
												<CardTitle>Top Savers</CardTitle>
												<CardDescription>
													Members with highest savings
												</CardDescription>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => router.push("/dashboard/members")}>
												View All
											</Button>
										</div>
									</CardHeader>
									<CardContent>
										<div className="rounded-md border overflow-hidden">
											<Table>
												<TableHeader className="bg-muted/50">
													<TableRow>
														<TableHead className="font-medium">
															Member
														</TableHead>
														<TableHead className="font-medium">
															Total Savings
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{dashboardData.topSavers.map((saver) => (
														<TableRow
															key={saver.memberId}
															className="hover:bg-muted/30 cursor-pointer transition-colors"
															onClick={() =>
																router.push(
																	`/dashboard/members/${saver.etNumber}`
																)
															}>
															<TableCell className="font-medium">
																{saver.memberName}
															</TableCell>
															<TableCell>
																{formatCurrency(Number(saver.totalSavings))}
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						</div>
					</TabsContent>

					{/* Loan Portfolio Tab */}
					<TabsContent value="loans" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
								<CardHeader>
									<div className="flex justify-between items-center">
										<div>
											<CardTitle>Loan Size Distribution</CardTitle>
											<CardDescription>
												Number of loans by amount range
											</CardDescription>
										</div>
										<BarChart3 className="h-5 w-5 text-muted-foreground" />
									</div>
								</CardHeader>
								<CardContent>
									<BarChart
										data={dashboardData.loanSizeDistribution}
										index="name"
										categories={["value"]}
										colors={["#2563eb"]}
										valueFormatter={(value: number) => `${value} loans`}
										className="h-[300px]"
									/>
								</CardContent>
							</Card>

							<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
								<CardHeader>
									<div className="flex justify-between items-center">
										<div>
											<CardTitle>Loan Status by Amount</CardTitle>
											<CardDescription>
												Total loan amount by status
											</CardDescription>
										</div>
										<BarChart3 className="h-5 w-5 text-muted-foreground" />
									</div>
								</CardHeader>
								<CardContent>
									<BarChart
										data={dashboardData.loanStatusDistribution}
										index="name"
										categories={["amount"]}
										colors={["#8b5cf6"]}
										valueFormatter={(value: number) => formatCurrency(value)}
										className="h-[300px]"
									/>
								</CardContent>
							</Card>
						</div>

						<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
							<CardHeader>
								<div className="flex justify-between items-center">
									<div>
										<CardTitle>Repayment Performance</CardTitle>
										<CardDescription>
											Expected vs actual repayments
										</CardDescription>
									</div>
									<Button variant="outline" size="sm">
										<Filter className="h-4 w-4 mr-2" />
										Filter
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<LineChart
									data={dashboardData.repaymentTrends}
									index="name"
									categories={["Expected", "Actual"]}
									colors={["#2563eb", "#16a34a"]}
									valueFormatter={(value: number) => formatCurrency(value)}
									className="h-[300px]"
								/>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Savings & Transactions Tab */}
					<TabsContent value="savings" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
								<CardHeader>
									<div className="flex justify-between items-center">
										<div>
											<CardTitle>Savings Growth</CardTitle>
											<CardDescription>
												Monthly savings deposits
											</CardDescription>
										</div>
										<Button variant="outline" size="sm">
											<Calendar className="h-4 w-4 mr-2" />
											Date Range
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									<AreaChart
										data={dashboardData.savingsTrends}
										index="name"
										categories={["amount"]}
										colors={["#16a34a"]}
										valueFormatter={(value: number) => formatCurrency(value)}
										className="h-[300px]"
									/>
								</CardContent>
							</Card>

							<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
								<CardHeader>
									<div className="flex justify-between items-center">
										<div>
											<CardTitle>Transaction Distribution</CardTitle>
											<CardDescription>
												Total amount by transaction type
											</CardDescription>
										</div>
										<PieChartIcon className="h-5 w-5 text-muted-foreground" />
									</div>
								</CardHeader>
								<CardContent>
									<PieChart
										data={dashboardData.transactionDistribution}
										index="name"
										categories={["value"]}
										colors={[
											"#2563eb",
											"#16a34a",
											"#eab308",
											"#ef4444",
											"#8b5cf6",
											"#6b7280",
										]}
										valueFormatter={(value: number) => formatCurrency(value)}
										className="h-[300px]"
									/>
								</CardContent>
							</Card>
						</div>

						<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
							<CardHeader>
								<div className="flex justify-between items-center">
									<div>
										<CardTitle>Transaction Volume Analysis</CardTitle>
										<CardDescription>
											Number of transactions by type
										</CardDescription>
									</div>
									<Button variant="outline" size="sm">
										<Download className="h-4 w-4 mr-2" />
										Export Data
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<BarChart
									data={dashboardData.transactionDistribution}
									index="name"
									categories={["count"]}
									colors={["#8b5cf6"]}
									valueFormatter={(value: number) => `${value} transactions`}
									className="h-[300px]"
								/>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Member Analysis Tab */}
					<TabsContent value="members" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
								<CardHeader>
									<div className="flex justify-between items-center">
										<div>
											<CardTitle>Member Distribution by Department</CardTitle>
											<CardDescription>
												Number of members in each department
											</CardDescription>
										</div>
										<BarChart3 className="h-5 w-5 text-muted-foreground" />
									</div>
								</CardHeader>
								<CardContent>
									<BarChart
										data={dashboardData.departmentDistribution}
										index="name"
										categories={["value"]}
										colors={["#2563eb"]}
										valueFormatter={(value: number) => `${value} members`}
										className="h-[300px]"
									/>
								</CardContent>
							</Card>

							<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
								<CardHeader>
									<div className="flex justify-between items-center">
										<div>
											<CardTitle>Member Growth</CardTitle>
											<CardDescription>New members over time</CardDescription>
										</div>
										<Button variant="outline" size="sm">
											<Calendar className="h-4 w-4 mr-2" />
											Date Range
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									{/* Placeholder for member growth chart */}
									<div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-md">
										<div className="text-center">
											<p className="text-muted-foreground mb-2">
												Member growth data will be available soon
											</p>
											<Button variant="outline" size="sm">
												Request Data
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
							<CardHeader>
								<CardTitle>Member Engagement</CardTitle>
								<CardDescription>
									Activity levels across membership
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-md border border-blue-200">
										<p className="text-3xl font-bold text-blue-700">
											{Math.round(dashboardData.totalMembers * 0.75)}
										</p>
										<p className="text-sm text-blue-600 mt-1">Active Savers</p>
									</div>
									<div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-md border border-green-200">
										<p className="text-3xl font-bold text-green-700">
											{Math.round(dashboardData.totalMembers * 0.45)}
										</p>
										<p className="text-sm text-green-600 mt-1">
											Active Borrowers
										</p>
									</div>
									<div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-md border border-gray-200">
										<p className="text-3xl font-bold text-gray-700">
											{Math.round(dashboardData.totalMembers * 0.15)}
										</p>
										<p className="text-sm text-gray-600 mt-1">
											Inactive Members
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Performance Tab */}
					<TabsContent value="performance" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
								<CardHeader>
									<CardTitle>Financial Performance</CardTitle>
									<CardDescription>Key financial indicators</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										<div>
											<div className="flex justify-between items-center mb-1">
												<span className="text-sm font-medium">
													Loan-to-Savings Ratio
												</span>
												<span className="text-sm font-medium">
													{formatPercentage(loanToSavingsRatio)}
												</span>
											</div>
											<div className="relative pt-1">
												<div className="flex mb-2 items-center justify-between">
													<div>
														<span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
															{loanToSavingsRatio > 100
																? "High Risk"
																: loanToSavingsRatio > 80
																? "Moderate"
																: "Low Risk"}
														</span>
													</div>
												</div>
												<div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-blue-100">
													<div
														style={{
															width: `${Math.min(loanToSavingsRatio, 150)}%`,
														}}
														className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
												</div>
												<div className="flex text-xs justify-between">
													<span>0%</span>
													<span>75%</span>
													<span>150%</span>
												</div>
											</div>
										</div>

										<div>
											<div className="flex justify-between items-center mb-1">
												<span className="text-sm font-medium">
													Portfolio at Risk
												</span>
												<span
													className={`text-sm font-medium ${
														dashboardData.portfolioAtRisk > 5
															? "text-red-500"
															: ""
													}`}>
													{formatPercentage(dashboardData.portfolioAtRisk)}
												</span>
											</div>
											<div className="relative pt-1">
												<div className="flex mb-2 items-center justify-between">
													<div>
														<span
															className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
																dashboardData.portfolioAtRisk > 10
																	? "text-red-600 bg-red-200"
																	: dashboardData.portfolioAtRisk > 5
																	? "text-amber-600 bg-amber-200"
																	: "text-green-600 bg-green-200"
															}`}>
															{dashboardData.portfolioAtRisk > 10
																? "High Risk"
																: dashboardData.portfolioAtRisk > 5
																? "Caution"
																: "Healthy"}
														</span>
													</div>
												</div>
												<div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-100">
													<div
														style={{
															width: `${Math.min(
																dashboardData.portfolioAtRisk * 5,
																100
															)}%`,
														}}
														className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
															dashboardData.portfolioAtRisk > 10
																? "bg-red-500"
																: dashboardData.portfolioAtRisk > 5
																? "bg-amber-500"
																: "bg-green-500"
														}`}></div>
												</div>
												<div className="flex text-xs justify-between">
													<span>0%</span>
													<span>10%</span>
													<span>20%</span>
												</div>
											</div>
										</div>

										<div>
											<div className="flex justify-between items-center mb-1">
												<span className="text-sm font-medium">
													Repayment Rate
												</span>
												<span className="text-sm font-medium">
													{formatPercentage(repaymentRate)}
												</span>
											</div>
											<div className="relative pt-1">
												<div className="flex mb-2 items-center justify-between">
													<div>
														<span
															className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
																repaymentRate > 90
																	? "text-green-600 bg-green-200"
																	: repaymentRate > 75
																	? "text-amber-600 bg-amber-200"
																	: "text-red-600 bg-red-200"
															}`}>
															{repaymentRate > 90
																? "Excellent"
																: repaymentRate > 75
																? "Good"
																: "Needs Improvement"}
														</span>
													</div>
												</div>
												<div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-100">
													<div
														style={{
															width: `${Math.min(repaymentRate, 100)}%`,
														}}
														className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
															repaymentRate > 90
																? "bg-green-500"
																: repaymentRate > 75
																? "bg-amber-500"
																: "bg-red-500"
														}`}></div>
												</div>
												<div className="flex text-xs justify-between">
													<span>0%</span>
													<span>50%</span>
													<span>100%</span>
												</div>
											</div>
										</div>

										<div>
											<div className="flex justify-between items-center mb-1">
												<span className="text-sm font-medium">
													Operational Self-Sufficiency
												</span>
												<span className="text-sm font-medium">105%</span>
											</div>
											<div className="relative pt-1">
												<div className="flex mb-2 items-center justify-between">
													<div>
														<span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
															Sustainable
														</span>
													</div>
												</div>
												<div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-100">
													<div
														style={{ width: `${Math.min(105, 150) / 1.5}%` }}
														className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
												</div>
												<div className="flex text-xs justify-between">
													<span>0%</span>
													<span>100%</span>
													<span>150%</span>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
								<CardHeader>
									<CardTitle>Risk Analysis</CardTitle>
									<CardDescription>Portfolio risk indicators</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="flex flex-col p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-md border border-amber-200">
												<span className="text-sm text-amber-700 font-medium">
													PAR &gt; 30 days
												</span>
												<span className="text-2xl font-bold text-amber-800 mt-1">
													{formatPercentage(
														dashboardData.portfolioAtRisk * 0.7
													)}
												</span>
												<span className="text-xs text-amber-600 mt-1">
													Medium-term risk
												</span>
											</div>
											<div className="flex flex-col p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-md border border-red-200">
												<span className="text-sm text-red-700 font-medium">
													PAR &gt; 90 days
												</span>
												<span className="text-2xl font-bold text-red-800 mt-1">
													{formatPercentage(
														dashboardData.portfolioAtRisk * 0.4
													)}
												</span>
												<span className="text-xs text-red-600 mt-1">
													Long-term risk
												</span>
											</div>
											<div className="flex flex-col p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-md border border-gray-200">
												<span className="text-sm text-gray-700 font-medium">
													Write-off Ratio
												</span>
												<span className="text-2xl font-bold text-gray-800 mt-1">
													1.2%
												</span>
												<span className="text-xs text-gray-600 mt-1">
													Unrecoverable loans
												</span>
											</div>
											<div className="flex flex-col p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-md border border-blue-200">
												<span className="text-sm text-blue-700 font-medium">
													Restructured Loans
												</span>
												<span className="text-2xl font-bold text-blue-800 mt-1">
													2.5%
												</span>
												<span className="text-xs text-blue-600 mt-1">
													Modified terms
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
							<CardHeader>
								<CardTitle>Operational Efficiency</CardTitle>
								<CardDescription>Key operational metrics</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<div className="flex flex-col p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-md border border-purple-200">
										<span className="text-sm text-purple-700 font-medium">
											Cost per Loan
										</span>
										<span className="text-2xl font-bold text-purple-800 mt-1">
											{formatCurrency(250)}
										</span>
										<span className="text-xs text-purple-600 mt-1">
											Processing expenses
										</span>
									</div>
									<div className="flex flex-col p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-md border border-blue-200">
										<span className="text-sm text-blue-700 font-medium">
											Loans per Officer
										</span>
										<span className="text-2xl font-bold text-blue-800 mt-1">
											{Math.round(dashboardData.activeLoanCount / 3)}
										</span>
										<span className="text-xs text-blue-600 mt-1">
											Staff productivity
										</span>
									</div>
									<div className="flex flex-col p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-md border border-green-200">
										<span className="text-sm text-green-700 font-medium">
											Processing Time
										</span>
										<span className="text-2xl font-bold text-green-800 mt-1">
											3.2 days
										</span>
										<span className="text-xs text-green-600 mt-1">
											Application to approval
										</span>
									</div>
									<div className="flex flex-col p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-md border border-amber-200">
										<span className="text-sm text-amber-700 font-medium">
											Member Retention
										</span>
										<span className="text-2xl font-bold text-amber-800 mt-1">
											92%
										</span>
										<span className="text-xs text-amber-600 mt-1">
											Annual retention rate
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</motion.div>

			{/* Add custom CSS for animations */}
			<style jsx global>{`
				@keyframes progress {
					0% {
						width: 0;
					}
					100% {
						width: 100%;
					}
				}

				.animate-progress {
					animation: progress 2s linear;
				}

				.card-hover-effect {
					transition: all 0.3s ease;
				}

				.card-hover-effect:hover {
					transform: translateY(-5px);
					box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
						0 10px 10px -5px rgba(0, 0, 0, 0.04);
				}
			`}</style>
		</motion.div>
	);
}
