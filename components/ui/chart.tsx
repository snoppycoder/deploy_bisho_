import type React from "react"

interface ChartProps {
  data: { name: string; [key: string]: number }[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter: (value: number) => string
  className?: string
}

export const AreaChart: React.FC<ChartProps> = ({ data, index, categories, colors, valueFormatter, className }) => {
  return (
    <div className={className}>
      {/* Placeholder for AreaChart */}
      <div>AreaChart - {index}</div>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  )
}

export const BarChart: React.FC<ChartProps> = ({ data, index, categories, colors, valueFormatter, className }) => {
  return (
    <div className={className}>
      {/* Placeholder for BarChart */}
      <div>BarChart - {index}</div>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  )
}

export const LineChart: React.FC<ChartProps> = ({ data, index, categories, colors, valueFormatter, className }) => {
  return (
    <div className={className}>
      {/* Placeholder for LineChart */}
      <div>LineChart - {index}</div>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  )
}

