import type React from "react"
import { MemberShell } from "@/components/ui/member-shell"

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MemberShell>{children}</MemberShell>
}

