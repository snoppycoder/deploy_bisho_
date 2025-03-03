import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (!session || !session.id) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const url = req.nextUrl.searchParams.get("url");
	if (!url) {
		return new NextResponse("Missing URL parameter", { status: 400 });
	}

	try {
		let buffer: Buffer;
		let contentType: string;

		if (url.startsWith("http://") || url.startsWith("https://")) {
			// Handle external URLs
			const response = await fetch(url);
			const arrayBuffer = await response.arrayBuffer();
			buffer = Buffer.from(arrayBuffer);
			contentType =
				response.headers.get("Content-Type") || "application/octet-stream";
		} else {
			// Handle local files
			const filePath = path.join(process.cwd(), "public", url);
			buffer = await fs.readFile(filePath);
			contentType = getContentType(filePath);
		}

		const headers = new Headers();
		headers.set("Content-Type", contentType);
		headers.set("Content-Disposition", "inline");

		return new NextResponse(buffer, { headers });
	} catch (error) {
		console.error("Error fetching document:", error);
		return new NextResponse("Failed to fetch document", { status: 500 });
	}
}

function getContentType(filePath: string): string {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case ".pdf":
			return "application/pdf";
		case ".doc":
		case ".docx":
			return "application/msword";
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		case ".png":
			return "image/png";
		default:
			return "application/octet-stream";
	}
}
