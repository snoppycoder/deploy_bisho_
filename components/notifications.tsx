"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { notificationAPI } from "@/lib/api";

interface Notification {
	id: number;
	title: string;
	message: string;
	type: string;
	createdAt: string;
	read: boolean;
}

export function Notifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const { toast } = useToast();

	useEffect(() => {
		fetchNotifications();
	}, []);

	const fetchNotifications = async () => {
		try {
			const response = await notificationAPI.getNotifications();
			if (!response) {
				throw new Error("Failed to fetch notifications");
			}
			// const data = await response.json();
			setNotifications(response);
			setUnreadCount(response.filter((n: Notification) => !n.read).length);
		} catch (error) {
			console.error("Error fetching notifications:", error);
			toast({
				title: "Error",
				description: "Failed to load notifications. Please try again.",
				variant: "destructive",
			});
		}
	};

	const markAsRead = async (id: number) => {
		try {
			const response = await fetch(`/api/notifications/${id}/read`, {
				method: "POST",
			});
			if (!response.ok) {
				throw new Error("Failed to mark notification as read");
			}
			setNotifications(
				notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
			);
			setUnreadCount((prev) => prev - 1);
		} catch (error) {
			console.error("Error marking notification as read:", error);
			toast({
				title: "Error",
				description: "Failed to mark notification as read. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="icon" className="relative">
					<Bell className="h-4 w-4" />
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
							{unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<Card>
					<CardHeader>
						<CardTitle>Notifications</CardTitle>
						<CardDescription>Your recent notifications</CardDescription>
					</CardHeader>
					<CardContent className="max-h-96 overflow-auto">
						{notifications.length === 0 ? (
							<p>No notifications</p>
						) : (
							notifications.map((notification) => (
								<div
									key={notification.id}
									className={`mb-4 p-2 rounded ${
										notification.read ? "bg-gray-100" : "bg-blue-100"
									}`}>
									<h3 className="font-semibold">{notification.title}</h3>
									<p className="text-sm">{notification.message}</p>
									<div className="flex justify-between items-center mt-2">
										<span className="text-xs text-gray-500">
											{new Date(notification.createdAt).toLocaleString()}
										</span>
										{!notification.read && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => markAsRead(notification.id)}>
												Mark as read
											</Button>
										)}
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</PopoverContent>
		</Popover>
	);
}
