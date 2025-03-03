// app/api/willing-deposit/requests/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
	try {
		const {
			userId,
			amount,
			currency,
			paymentMethod,
			walletAddress,
			transactionHash,
			status,
		} = await req.json();

		if (
			!userId ||
			!amount ||
			!currency ||
			!paymentMethod ||
			!walletAddress ||
			!transactionHash ||
			!status
		) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// const newRequest = await prisma.willingDepositRequest.create({
		// 	data: {
		// 		userId,
		// 		amount,
		// 		currency,
		// 		paymentMethod,
		// 		walletAddress,
		// 		transactionHash,
		// 		status,
		// 	},
		// });

		// return NextResponse.json(newRequest, { status: 201 });
	} catch (error) {
		console.error("Error creating willing deposit request:", error);
		return NextResponse.json(
			{ message: "Error creating willing deposit request" },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams;
		const userId = searchParams.get("userId");
		const id = searchParams.get("id");
		const status = searchParams.get("status");
		const page = searchParams.get("page");
		const pageSize = searchParams.get("pageSize");

		let whereClause = {};

		if (userId) {
			whereClause = { ...whereClause, userId: userId };
		}

		if (id) {
			whereClause = { ...whereClause, id: id };
		}

		if (status) {
			whereClause = { ...whereClause, status: status };
		}

		const pageNumber = page ? Number.parseInt(page, 10) : 1;
		const pageSizeNumber = pageSize ? Number.parseInt(pageSize, 10) : 10;
		const skip = (pageNumber - 1) * pageSizeNumber;

		// const [requests, totalCount] = await Promise.all([
		// 	prisma.willingDepositRequest.findMany({
		// 		where: whereClause,
		// 		skip: skip,
		// 		take: pageSizeNumber,
		// 		orderBy: {
		// 			createdAt: "desc", // Or any other field you want to sort by
		// 		},
		// 	}),
		// 	prisma.willingDepositRequest.count({ where: whereClause }),
		// ]);

		// const totalPages = Math.ceil(totalCount / pageSizeNumber);

		// return NextResponse.json({
		// 	requests,
		// 	pagination: {
		// 		totalCount,
		// 		totalPages,
		// 		currentPage: pageNumber,
		// 		pageSize: pageSizeNumber,
		// 	},
		// });
	} catch (error) {
		console.error("Error fetching willing deposit requests:", error);
		return NextResponse.json(
			{ message: "Error fetching willing deposit requests" },
			{ status: 500 }
		);
	}
}
