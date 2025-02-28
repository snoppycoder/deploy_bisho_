import { type NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signJWT, setAuthCookie } from "@/lib/auth";

const MEMBER_PHONE = "0913228892";

export async function POST(request: NextRequest) {
	try {
		const { identifier, password } = await request.json();

		if (!identifier || !password) {
			return NextResponse.json(
				{ error: "Identifier and password are required" },
				{ status: 400 }
			);
		}

		// Check if the identifier is an email (for admin users)
		if (identifier.includes("@")) {
			const user = await prisma.user.findUnique({
				where: { email: identifier },
			});

			if (!user) {
				return NextResponse.json(
					{ error: "Invalid credentials" },
					{ status: 401 }
				);
			}

			// Verify password
			const passwordMatch = await bcrypt.compare(password, user.password);
			if (!passwordMatch) {
				return NextResponse.json(
					{ error: "Invalid credentials" },
					{ status: 401 }
				);
			}

			// Create JWT payload for admin users
			const payload = {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			};

			// Sign JWT
			const token = await signJWT(payload);

			// Create response
			const response = NextResponse.json({
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
				redirectUrl: "/dashboard",
			});

			// Set auth cookie
			setAuthCookie(token, response);

			return response;
		} else {
			// Handle member login
			const etNumber = Number.parseInt(identifier);
			if (isNaN(etNumber)) {
				return NextResponse.json(
					{ error: "Invalid ET Number" },
					{ status: 400 }
				);
			}

			const member = await prisma.member.findUnique({
				where: { etNumber },
			});

			if (!member || password !== MEMBER_PHONE) {
				return NextResponse.json(
					{ error: "Invalid credentials" },
					{ status: 401 }
				);
			}

			// Create JWT payload for members
			const payload = {
				id: member.id,
				etNumber: member.etNumber,
				role: "MEMBER" as const,
				phone: MEMBER_PHONE,
			};

			// Sign JWT
			const token = await signJWT(payload);

			// Create response
			const response = NextResponse.json({
				user: {
					id: member.id,
					etNumber: member.etNumber,
					role: "MEMBER",
					phone: MEMBER_PHONE,
				},
				redirectUrl: "/member",
			});

			// Set auth cookie
			setAuthCookie(token, response);

			console.log("Login: Member logged in successfully", payload);

			return response;
		}
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// import { type NextRequest, NextResponse } from "next/server"
// import * as bcrypt from "bcryptjs"
// import prisma from "@/lib/prisma"
// import { signJWT, setAuthCookie } from "@/lib/auth"

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json()

//     if (!email || !password) {
//       return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
//     }

//     // Find user by email
//     const user = await prisma.user.findUnique({
//       where: { email },
//       include: {
//         member: {
//           select: {
//             id: true,
//           },
//         },
//       },
//     })

//     if (!user) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // Verify password
//     const passwordMatch = await bcrypt.compare(password, user.password)
//     if (!passwordMatch) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // Create JWT payload
//     const payload = {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       memberId: user.member?.id,
//     }

//     // Sign JWT
//     const token = await signJWT(payload)

//     // Create response
//     const response = NextResponse.json({
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         memberId: user.member?.id,
//       },
//     })

//     // Set auth cookie
//     setAuthCookie(token, response)

//     return response
//   } catch (error) {
//     console.error("Login error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
