import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
	try {
		const { name, email, phone, password, role } = await req.json();

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 400 }
			);
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the new admin user
		const newUser = await prisma.user.create({
			data: {
				name,
				email,
				phone,
				password: hashedPassword,
				role,
			},
		});

		// Remove the password from the response
		const { password: _, ...userWithoutPassword } = newUser;

		return NextResponse.json(userWithoutPassword, { status: 201 });
	} catch (error) {
		console.error("Error creating admin user:", error);
		return NextResponse.json(
			{ error: "Failed to create admin user" },
			{ status: 500 }
		);
	}
}
