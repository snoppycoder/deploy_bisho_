import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="mb-8 text-lg text-gray-700">
          You do not have permission to access this page. Please contact your administrator if you believe this is an
          error.
        </p>
        <div className="flex flex-col space-y-4">
          <Link href="/">
            <Button className="w-full">Return to Home</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Login with Different Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

