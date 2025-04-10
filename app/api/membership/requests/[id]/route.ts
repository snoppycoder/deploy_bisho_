import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Helper function to generate a unique number
async function generateUniqueNumber(
	type: "etNumber" | "memberNumber"
): Promise<number> {
	// Generate a random 5-digit number
	const min = 1000;
	const max = 9999;
	let uniqueNumber = Math.floor(Math.random() * (max - min + 1)) + min;

	// Check if the number already exists
	let exists = true;
	while (exists) {
		const query =
			type === "etNumber"
				? { etNumber: uniqueNumber }
				: { memberNumber: uniqueNumber };

		const existingMember = await prisma.member.findUnique({
			where: query as any,
		});

		if (!existingMember) {
			exists = false;
		} else {
			// Generate a new number if the current one exists
			uniqueNumber = Math.floor(Math.random() * (max - min + 1)) + min;
		}
	}

	return uniqueNumber;
}

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getSession();
	if (!session || !["ADMIN", "FINANCE_ADMIN"].includes(session.role)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { status } = await req.json();
		const id = Number.parseInt(params.id);

		// Update the membership request status
		const updatedRequest = await prisma.membershipRequest.update({
			where: { id },
			data: { status },
		});

		// If the status is APPROVED, create a new Member record
		if (status === "APPROVED") {
			// Get the membership request details
			const membershipRequest = await prisma.membershipRequest.findUnique({
				where: { id },
			});

			if (membershipRequest) {
				// Generate unique etNumber and memberNumber
				const etNumber = await generateUniqueNumber("etNumber");
				const memberNumber = await generateUniqueNumber("memberNumber");

				// Create a new User record
				// const user = await prisma.user.create({
				// 	data: {
				// 		name: membershipRequest.name,
				// 		email: membershipRequest.email,
				// 		phone: membershipRequest.phone,
				// 		password: Math.random().toString(36).slice(-8), // Generate a random password
				// 		role: "MEMBER",
				// 	},
				// });

				// Create a new Member record
				const newMember = await prisma.member.create({
					data: {
						name: membershipRequest.name,
						email: membershipRequest.email,
						phone: membershipRequest.phone,
						etNumber,
						memberNumber,
						department: membershipRequest.department,
						// userId: user.id,
					},
				});

				// Create initial MemberBalance record
				await prisma.memberBalance.create({
					data: {
						memberId: newMember.id,
					},
				});

				await fetch("http://94.130.27.32:3001/send-sms", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						to: membershipRequest.phone,
						message: `ውድ ${
							membershipRequest.name
						} በኢትዮ ክሬዲት አሶሴሽን በተሳካ ሁኔታ ተመዝገበዋል! የአባልነት ልዩ ቁጥር ${etNumber} : እንዲሁም ጊዚያዊ የማለፊያ ቂጥርዎ 'Test@123tr' ይህ ነው በተጨማሪም በ ${"http://94.130.27.32:3008"} መጎብኘት አገልግሎቱን መጠቀም ይችላሉ::`,
						callback: "https://your-callback-url.com/sms-status",
					}),
				});

				// Return both the updated request and the new member
				return NextResponse.json({
					updatedRequest,
					newMember,
				});
			}
		}

		return NextResponse.json(updatedRequest);
	} catch (error) {
		console.error("Error updating membership request:", error);
		return NextResponse.json(
			{
				error: "Failed to update membership request",
				details: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
// export async function PATCH(
// 	req: Request,
// 	{ params }: { params: { id: string } }
// ) {
// 	const session = await getSession();
// 	if (!session || !["ADMIN", "FINANCE_ADMIN"].includes(session.role)) {
// 		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 	}

// 	try {
// 		const { status } = await req.json();
// 		const id = Number.parseInt(params.id);

// 		const updatedRequest = await prisma.membershipRequest.update({
// 			where: { id },
// 			data: { status },
// 		});

// 		return NextResponse.json(updatedRequest);
// 	} catch (error) {
// 		console.error("Error updating membership request:", error);
// 		return NextResponse.json(
// 			{ error: "Failed to update membership request" },
// 			{ status: 500 }
// 		);
// 	}
// }
