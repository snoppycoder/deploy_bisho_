import type React from "react";
import {
	AreaChart as RechartsAreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { BarChart as RechartsBarChart, Bar } from "recharts";
import { LineChart as RechartsLineChart, Line } from "recharts";

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
