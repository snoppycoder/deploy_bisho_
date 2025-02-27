import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        memberId: session.memberId,
      },
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

