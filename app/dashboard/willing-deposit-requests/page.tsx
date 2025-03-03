"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, BarChart, LineChart } from "@/components/ui/chart";
import { useToast } from "@/components/ui/use-toast";

export default function ReportsPage() {
	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Willing Saving</h1>
		</div>
	);
}
