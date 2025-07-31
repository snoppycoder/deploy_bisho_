import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditionsPage() {
	return (
		<div className="container mx-auto py-10 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<Link href="/membership">
						<Button variant="outline" className="mb-4 bg-transparent">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Membership Form
						</Button>
					</Link>
				</div>

				<Card className="shadow-lg">
					<CardHeader className="text-center border-b">
						<CardTitle className="text-3xl font-bold text-primary">
							Terms and Conditions
						</CardTitle>
						<p className="text-muted-foreground mt-2">
							ET Credit Association Membership Agreement
						</p>
					</CardHeader>
					<CardContent className="prose prose-gray max-w-none p-8">
						<div className="space-y-8">
							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									1. Membership Registration
								</h2>
								<p className="text-gray-700 leading-relaxed">
									By submitting your membership application to ET Credit
									Association, you agree to abide by all terms and conditions
									outlined in this agreement. Your membership is subject to
									approval by our administrative team.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									2. Financial Obligations - Initial Registration
								</h2>
								<div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
									<h3 className="text-lg font-semibold text-blue-800 mb-3">
										For Initial Registration:
									</h3>
									<ul className="space-y-2 text-gray-700">
										<li className="flex items-start">
											<span className="text-blue-600 mr-2">•</span>
											<span>
												<strong>Sharing Cost:</strong> The client pays 5% of
												their contribution as sharing cost, which continues for
												6 consecutive months from the date of registration.
											</span>
										</li>
										<li className="flex items-start">
											<span className="text-blue-600 mr-2">•</span>
											<span>
												<strong>Savings:</strong> The client contributes 14% of
												their monthly income as savings, which continues until
												the client terminates their membership.
											</span>
										</li>
									</ul>
								</div>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									3. Re-registration Terms
								</h2>
								<div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg">
									<h3 className="text-lg font-semibold text-orange-800 mb-3">
										For Clients Returning After Termination:
									</h3>
									<p className="text-gray-700">
										If a client terminates their membership and later decides to
										return, they must account for 10% of their previous savings
										balance as a penalty fee. This amount will be deducted from
										their new savings balance upon re-registration.
									</p>
								</div>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									4. Membership Benefits
								</h2>
								<ul className="space-y-2 text-gray-700">
									<li className="flex items-start">
										<span className="text-green-600 mr-2">✓</span>
										<span>
											Access to microfinance services and credit facilities
										</span>
									</li>
									<li className="flex items-start">
										<span className="text-green-600 mr-2">✓</span>
										<span>
											Participation in savings and investment programs
										</span>
									</li>
									<li className="flex items-start">
										<span className="text-green-600 mr-2">✓</span>
										<span>Financial literacy training and workshops</span>
									</li>
									<li className="flex items-start">
										<span className="text-green-600 mr-2">✓</span>
										<span>Community support and networking opportunities</span>
									</li>
								</ul>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									5. Termination Policy
								</h2>
								<p className="text-gray-700 leading-relaxed">
									Members may terminate their membership at any time by
									providing written notice to the association. Upon termination,
									all outstanding obligations must be settled, and the member's
									savings balance will be processed according to the
									association's withdrawal procedures.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									6. Privacy and Data Protection
								</h2>
								<p className="text-gray-700 leading-relaxed">
									ET Credit Association is committed to protecting your personal
									information. All data provided during registration will be
									used solely for membership management and service delivery
									purposes. We will not share your information with third
									parties without your explicit consent.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									7. Amendments
								</h2>
								<p className="text-gray-700 leading-relaxed">
									ET Credit Association reserves the right to modify these terms
									and conditions at any time. Members will be notified of any
									changes through official communication channels. Continued
									membership after notification constitutes acceptance of the
									modified terms.
								</p>
							</section>

							<section>
								<h2 className="text-2xl font-semibold text-primary mb-4">
									8. Contact Information
								</h2>
								<p className="text-gray-700 leading-relaxed">
									For questions regarding these terms and conditions or your
									membership, please contact ET Credit Association through our
									official channels or visit our office during business hours.
								</p>
							</section>

							<div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mt-8">
								<p className="text-sm text-gray-600 text-center">
									<strong>Last Updated:</strong>{" "}
									{new Date().toLocaleDateString()}
								</p>
								<p className="text-sm text-gray-600 text-center mt-2">
									By proceeding with your membership application, you
									acknowledge that you have read, understood, and agree to be
									bound by these terms and conditions.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
