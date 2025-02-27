import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, LineChart } from "@/components/ui/chart"
import { CreditCard, DollarSign, PiggyBank, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MemberDashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Member Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,000.00</div>
            <p className="text-xs text-muted-foreground">+$500.00 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Same as last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$500.00</div>
            <p className="text-xs text-muted-foreground">+$100.00 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$450.00</div>
            <p className="text-xs text-muted-foreground">Due on 15th July 2023</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Savings Growth</CardTitle>
            <CardDescription>Your savings over time</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <AreaChart
              data={[
                { name: "Jan", amount: 0 },
                { name: "Feb", amount: 200 },
                { name: "Mar", amount: 400 },
                { name: "Apr", amount: 600 },
                { name: "May", amount: 800 },
                { name: "Jun", amount: 1000 },
              ]}
              index="name"
              categories={["amount"]}
              colors={["green"]}
              valueFormatter={(value) => `$${value}`}
              className="h-[300px]"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Loan Repayment Schedule</CardTitle>
            <CardDescription>Your loan repayment progress</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <LineChart
              data={[
                { name: "Jan", remaining: 5000, paid: 0 },
                { name: "Feb", remaining: 4550, paid: 450 },
                { name: "Mar", remaining: 4100, paid: 900 },
                { name: "Apr", remaining: 3650, paid: 1350 },
                { name: "May", remaining: 3200, paid: 1800 },
                { name: "Jun", remaining: 2750, paid: 2250 },
              ]}
              index="name"
              categories={["remaining", "paid"]}
              colors={["red", "green"]}
              valueFormatter={(value) => `$${value}`}
              className="h-[300px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Link href="/member/loans/apply">
                <Button className="w-full">Apply for a Loan</Button>
              </Link>
              <Link href="/member/loans/calculator">
                <Button variant="outline" className="w-full">
                  Calculate Loan Repayment
                </Button>
              </Link>
              <Link href="/member/profile">
                <Button variant="outline" className="w-full">
                  Update Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your most recent financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Loan Repayment</p>
                  <p className="text-xs text-muted-foreground">June 1, 2023</p>
                </div>
                <div className="text-sm font-medium text-red-500">-$450.00</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Monthly Savings</p>
                  <p className="text-xs text-muted-foreground">May 15, 2023</p>
                </div>
                <div className="text-sm font-medium text-green-500">+$200.00</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Loan Repayment</p>
                  <p className="text-xs text-muted-foreground">May 1, 2023</p>
                </div>
                <div className="text-sm font-medium text-red-500">-$450.00</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Monthly Savings</p>
                  <p className="text-xs text-muted-foreground">April 15, 2023</p>
                </div>
                <div className="text-sm font-medium text-green-500">+$200.00</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

