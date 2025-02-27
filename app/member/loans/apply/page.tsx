"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  tenureMonths: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 60, {
    message: "Tenure must be between 1 and 60 months",
  }),
  purpose: z.string().min(10, {
    message: "Purpose must be at least 10 characters",
  }),
  collateralType: z.string().min(1, {
    message: "Please select a collateral type",
  }),
  collateralDescription: z.string().min(10, {
    message: "Collateral description must be at least 10 characters",
  }),
})

export default function LoanApplicationPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      tenureMonths: "",
      purpose: "",
      collateralType: "",
      collateralDescription: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.memberId) {
      toast({
        title: "Error",
        description: "You must be logged in as a member to apply for a loan",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully and is pending review.",
      })

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Apply for a Loan</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Loan Application Form</CardTitle>
          <CardDescription>Fill out the form below to apply for a loan. All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="5000" {...field} />
                    </FormControl>
                    <FormDescription>Enter the amount you wish to borrow</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenureMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Tenure (Months)</FormLabel>
                    <FormControl>
                      <Input placeholder="12" {...field} />
                    </FormControl>
                    <FormDescription>Enter the number of months for repayment (1-60)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Purpose</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe why you need this loan" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Clearly explain how you plan to use the loan</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collateralType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collateral Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select collateral type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="guarantor">Guarantor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the type of collateral you are offering</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collateralDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collateral Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about your collateral"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Describe your collateral in detail</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
          <p>Note: You will be required to upload supporting documents after submission.</p>
          <p className="mt-2">The loan approval process typically takes 3-5 business days.</p>
        </CardFooter>
      </Card>
    </div>
  )
}

