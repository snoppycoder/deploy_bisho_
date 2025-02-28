// import type React from "react";
// import {
// 	AreaChart,
// 	Area,
// 	BarChart,
// 	Bar,
// 	LineChart,
// 	Line,
// 	XAxis,
// 	YAxis,
// 	CartesianGrid,
// 	Tooltip,
// 	ResponsiveContainer,
// } from "recharts";

// interface ChartProps {
// 	data: { name: string; [key: string]: number | string }[];
// 	index: string;
// 	categories: string[];
// 	colors: string[];
// 	valueFormatter: (value: number) => string;
// 	className?: string;
// 	chartType: "Area" | "Bar" | "Line";
// }

// const RechartsWrapper: React.FC<ChartProps> = ({
// 	data,
// 	index,
// 	categories,
// 	colors,
// 	valueFormatter,
// 	className,
// 	chartType,
// }) => {
// 	const ChartComponent =
// 		chartType === "Area"
// 			? AreaChart
// 			: chartType === "Bar"
// 			? BarChart
// 			: LineChart;
// 	const DataComponent =
// 		chartType === "Area" ? Area : chartType === "Bar" ? Bar : Line;

// 	return (
// 		<div className={className}>
// 			<ResponsiveContainer width="100%" height="100%">
// 				<ChartComponent data={data}>
// 					<CartesianGrid strokeDasharray="3 3" />
// 					<XAxis dataKey={index} />
// 					<YAxis tickFormatter={valueFormatter} />
// 					<Tooltip formatter={valueFormatter} />
// 					{categories.map((category, i) => (
// 						<DataComponent
// 							key={category}
// 							type="monotone"
// 							dataKey={category}
// 							stroke={colors[i]}
// 							fill={chartType === "Area" ? colors[i] : undefined}
// 						/>
// 					))}
// 				</ChartComponent>
// 			</ResponsiveContainer>
// 		</div>
// 	);
// };

// export default RechartsWrapper;
