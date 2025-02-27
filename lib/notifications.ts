import prisma from "@/lib/prisma";

interface NotificationPayload {
	userId: number;
	title: string;
	message: string;
	type: string;
}

export const sendNotification = async (payload: NotificationPayload) => {
	try {
		await prisma.notification.create({
			data: {
				userId: payload.userId,
				title: payload.title,
				message: payload.message,
				type: payload.type,
			},
		});
	} catch (error) {
		console.error("Error sending notification:", error);
	}
};
