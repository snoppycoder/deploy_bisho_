"use client";

import type React from "react";

import dynamic from "next/dynamic";
import {
	LineChart as RechartsLineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart as RechartsPieChart,
	Pie,
	Cell,
	Legend,
	BarChart as RechartsBarChart,
	Bar,
	AreaChart as RechartsAreaChart,
	Area,
} from "recharts";

const AreaChartComponent = dynamic(
	() => import("recharts").then((recharts) => recharts.AreaChart),
	{ ssr: false }
);

const BarChartComponent = dynamic(
	() => import("recharts").then((recharts) => recharts.BarChart),
	{ ssr: false }
);

const LineChartComponent = dynamic(
	() => import("recharts").then((recharts) => recharts.LineChart),
	{ ssr: false }
);

const PieChartComponent = dynamic(
	() => import("recharts").then((recharts) => recharts.PieChart),
	{ ssr: false }
);

interface ChartProps {
	data: { name: string; [key: string]: number | string }[];
	index: string;
	categories: string[];
	colors: string[];
	valueFormatter: (value: number) => string;
	className?: string;
}

export const AreaChart: React.FC<ChartProps> = ({
	data,
	index,
	categories,
	colors,
	valueFormatter,
	className,
}) => {
	return (
		<div className={className}>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsAreaChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey={index} />
					<YAxis tickFormatter={valueFormatter} />
					<Tooltip formatter={valueFormatter} />
					{categories.map((category, i) => (
						<Area
							key={category}
							type="monotone"
							dataKey={category}
							stroke={colors[i]}
							fill={colors[i]}
						/>
					))}
				</RechartsAreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export const BarChart: React.FC<ChartProps> = ({
	data,
	index,
	categories,
	colors,
	valueFormatter,
	className,
}) => {
	return (
		<div className={className}>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsBarChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey={index} />
					<YAxis tickFormatter={valueFormatter} />
					<Tooltip formatter={valueFormatter} />
					{categories.map((category, i) => (
						<Bar key={category} dataKey={category} fill={colors[i]} />
					))}
				</RechartsBarChart>
			</ResponsiveContainer>
		</div>
	);
};

export const LineChart: React.FC<ChartProps> = ({
	data,
	index,
	categories,
	colors,
	valueFormatter,
	className,
}) => {
	return (
		<div className={className}>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsLineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey={index} />
					<YAxis tickFormatter={valueFormatter} />
					<Tooltip formatter={valueFormatter} />
					{categories.map((category, i) => (
						<Line
							key={category}
							type="monotone"
							dataKey={category}
							stroke={colors[i]}
						/>
					))}
				</RechartsLineChart>
			</ResponsiveContainer>
		</div>
	);
};

interface PieChartProps {
	data: { name: string; value: number }[];
	index: string;
	categories: string[] | any;
	colors?: string[];
	valueFormatter: (value: number) => string;
	className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
	data,
	index,
	categories,
	colors,
	valueFormatter,
	className,
}) => {
	return (
		<div className={className}>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsPieChart>
					<Pie
						data={data}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						outerRadius={80}
						fill="#8884d8"
						label>
						{data.map((entry, i) => (
							<Cell
								key={`cell-${i}`}
								fill={
									colors && colors.length > 0
										? colors[i % colors.length]
										: `#${Math.floor(Math.random() * 16777215).toString(16)}`
								}
							/>
						))}
					</Pie>
					<Tooltip formatter={valueFormatter} />
					<Legend />
				</RechartsPieChart>
			</ResponsiveContainer>
		</div>
	);
};

// "use client";

// import type React from "react";

// import dynamic from "next/dynamic";
// import {
// 	LineChart as RechartsLineChart,
// 	Line,
// 	XAxis,
// 	YAxis,
// 	CartesianGrid,
// 	Tooltip,
// 	ResponsiveContainer,
// 	PieChart as RechartsPieChart,
// 	Pie,
// 	Cell,
// 	Legend,
// 	BarChart as RechartsBarChart,
// 	Bar,
// 	AreaChart as RechartsAreaChart,
// 	Area,
// } from "recharts";

// const AreaChartComponent = dynamic(
// 	() => import("recharts").then((recharts) => recharts.AreaChart),
// 	{ ssr: false }
// );

// const BarChartComponent = dynamic(
// 	() => import("recharts").then((recharts) => recharts.BarChart),
// 	{ ssr: false }
// );

// const LineChartComponent = dynamic(
// 	() => import("recharts").then((recharts) => recharts.LineChart),
// 	{ ssr: false }
// );

// const PieChartComponent = dynamic(
// 	() => import("recharts").then((recharts) => recharts.PieChart),
// 	{ ssr: false }
// );

// interface ChartProps {
// 	data: { name: string; [key: string]: number | string }[];
// 	index: string;
// 	categories: string[];
// 	colors: string[];
// 	valueFormatter: (value: number) => string;
// 	className?: string;
// }

// export const AreaChart: React.FC<ChartProps> = ({
// 	data,
// 	index,
// 	categories,
// 	colors,
// 	valueFormatter,
// 	className,
// }) => {
// 	return (
// 		<div className={className}>
// 			<ResponsiveContainer width="100%" height="100%">
// 				<RechartsAreaChart data={data}>
// 					<CartesianGrid strokeDasharray="3 3" />
// 					<XAxis dataKey={index} />
// 					<YAxis tickFormatter={valueFormatter} />
// 					<Tooltip formatter={valueFormatter} />
// 					{categories.map((category, i) => (
// 						<Area
// 							key={category}
// 							type="monotone"
// 							dataKey={category}
// 							stroke={colors[i]}
// 							fill={colors[i]}
// 						/>
// 					))}
// 				</RechartsAreaChart>
// 			</ResponsiveContainer>
// 		</div>
// 	);
// };

// export const BarChart: React.FC<ChartProps> = ({
// 	data,
// 	index,
// 	categories,
// 	colors,
// 	valueFormatter,
// 	className,
// }) => {
// 	return (
// 		<div className={className}>
// 			<ResponsiveContainer width="100%" height="100%">
// 				<RechartsBarChart data={data}>
// 					<CartesianGrid strokeDasharray="3 3" />
// 					<XAxis dataKey={index} />
// 					<YAxis tickFormatter={valueFormatter} />
// 					<Tooltip formatter={valueFormatter} />
// 					{categories.map((category, i) => (
// 						<Bar key={category} dataKey={category} fill={colors[i]} />
// 					))}
// 				</RechartsBarChart>
// 			</ResponsiveContainer>
// 		</div>
// 	);
// };

// export const LineChart: React.FC<ChartProps> = ({
// 	data,
// 	index,
// 	categories,
// 	colors,
// 	valueFormatter,
// 	className,
// }) => {
// 	return (
// 		<div className={className}>
// 			<ResponsiveContainer width="100%" height="100%">
// 				<RechartsLineChart data={data}>
// 					<CartesianGrid strokeDasharray="3 3" />
// 					<XAxis dataKey={index} />
// 					<YAxis tickFormatter={valueFormatter} />
// 					<Tooltip formatter={valueFormatter} />
// 					{categories.map((category, i) => (
// 						<Line
// 							key={category}
// 							type="monotone"
// 							dataKey={category}
// 							stroke={colors[i]}
// 						/>
// 					))}
// 				</RechartsLineChart>
// 			</ResponsiveContainer>
// 		</div>
// 	);
// };

// interface PieChartProps {
// 	data: { name: string; value: number }[];
// 	index: string;
// 	categories: string[];
// 	colors: string[];
// 	valueFormatter: (value: number) => string;
// 	className?: string;
// }

// export const PieChart: React.FC<PieChartProps | any> = ({
// 	data,
// 	index,
// 	categories,
// 	colors,
// 	valueFormatter,
// 	className,
// }) => {
// 	return (
// 		<div className={className}>
// 			<ResponsiveContainer width="100%" height="100%">
// 				<RechartsPieChart>
// 					<Pie
// 						data={data}
// 						dataKey="value"
// 						nameKey="name"
// 						cx="50%"
// 						cy="50%"
// 						outerRadius={80}
// 						fill="#8884d8"
// 						label>
// 						{data.map((entry, i) => (
// 							<Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
// 						))}
// 					</Pie>
// 					<Tooltip formatter={valueFormatter} />
// 					<Legend />
// 				</RechartsPieChart>
// 			</ResponsiveContainer>
// 		</div>
// 	);
// };
