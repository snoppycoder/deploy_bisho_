import { type NextRequest, NextResponse } from "next/server";

type LoanParams = {
	loanAmount: number;
	interestRate: number;
	loanTerm: number;
	repaymentFrequency: "monthly" | "quarterly" | "annually";
};

type AmortizationScheduleRow = {
	period: number;
	payment: number;
	principal: number;
	interest: number;
	balance: number;
};

function calculateLoan(params: LoanParams) {
	const { loanAmount, interestRate, loanTerm, repaymentFrequency } = params;

	// Convert annual interest rate to monthly rate
	const monthlyRate = interestRate / 100 / 12;

	// Calculate number of payments based on repayment frequency
	let numberOfPayments: number;
	let ratePerPeriod: number;
	switch (repaymentFrequency) {
		case "monthly":
			numberOfPayments = loanTerm;
			ratePerPeriod = monthlyRate;
			break;
		case "quarterly":
			numberOfPayments = Math.ceil(loanTerm / 3);
			ratePerPeriod = monthlyRate * 3;
			break;
		case "annually":
			numberOfPayments = Math.ceil(loanTerm / 12);
			ratePerPeriod = monthlyRate * 12;
			break;
	}

	// Calculate payment amount
	const payment =
		(loanAmount *
			ratePerPeriod *
			Math.pow(1 + ratePerPeriod, numberOfPayments)) /
		(Math.pow(1 + ratePerPeriod, numberOfPayments) - 1);

	// Calculate amortization schedule
	let balance = loanAmount;
	const amortizationSchedule: AmortizationScheduleRow[] = [];

	for (let period = 1; period <= numberOfPayments; period++) {
		const interest = balance * ratePerPeriod;
		const principal = payment - interest;
		balance -= principal;

		amortizationSchedule.push({
			period,
			payment,
			principal,
			interest,
			balance: balance > 0 ? balance : 0,
		});

		if (balance <= 0) break;
	}

	const totalPayment = payment * numberOfPayments;
	const totalInterest = totalPayment - loanAmount;

	return {
		monthlyPayment: payment,
		totalPayment,
		totalInterest,
		amortizationSchedule,
	};
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const result = calculateLoan(body);
		return NextResponse.json(result);
	} catch (error) {
		console.error("Error calculating loan:", error);
		return NextResponse.json(
			{ error: "Failed to calculate loan" },
			{ status: 500 }
		);
	}
}
