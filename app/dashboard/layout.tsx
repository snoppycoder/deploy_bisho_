import type React from "react";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import { Notifications } from "@/components/notifications";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DashboardShell>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<Notifications />
			</div>
			{children}
		</DashboardShell>
	);
}
