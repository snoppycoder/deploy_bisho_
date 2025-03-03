import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET() {
	const session = await getSession();
	if (!session || session.role !== "MEMBER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const filePath = path.join(
			process.cwd(),
			"public",
			"loan_agreement_template.pdf"
		);
		const fileBuffer = fs.readFileSync(filePath);

		const response = new NextResponse(fileBuffer);
		response.headers.set("Content-Type", "application/pdf");
		response.headers.set(
			"Content-Disposition",
			"attachment; filename=loan_agreement_template.pdf"
		);

		return response;
	} catch (error) {
		console.error("Error serving loan agreement template:", error);
		return NextResponse.json(
			{ error: "Failed to serve loan agreement template" },
			{ status: 500 }
		);
	}
}
