import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ShieldCheck, HelpCircle, Phone, ArrowRight } from "lucide-react";
import FareCalculator from "@/components/calculator/FareCalculator";

export const metadata: Metadata = {
  title: "Trip Fare & Distance Calculator",
  description:
    "Calculate exact road distance, travel duration, and transparent per-kilometer vehicle rental fares for your trip with Sukruth Holidays.",
};

export default function FareCalculatorPage() {
  return (
    <div className="py-12">
      {/* Hero Header */}
      <div className="container-x">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon-light px-3.5 py-1 text-xs font-bold text-lagoon-dark">
            <Calculator size={14} /> Instant Travel Estimator
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Trip Fare & Road Distance Calculator
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink/75 sm:text-lg">
            Plan your route with our road map, check the exact driving distance, compare vehicle options, and see transparent per-kilometer pricing before you book.
          </p>
        </div>

        {/* The Interactive Calculator */}
        <div className="mt-10">
          <FareCalculator />
        </div>

        {/* Pricing Guide & FAQ */}
        <section className="mt-20 border-t border-ink/10 pt-16" aria-labelledby="faq-title">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="faq-title" className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="mt-2 text-ink/70">Everything you need to know about our per-kilometer cab and bus rental fares.</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                q: "How is the road distance calculated?",
                a: "We compute the exact road driving distance via national and state highways using OpenStreetMap and OSRM, rather than a straight-line estimation. This ensures your estimate is accurate to the actual road distance driven.",
              },
              {
                q: "What is included in the estimated fare?",
                a: "The fare includes the vehicle hire, fuel expenses, and standard driver allowances. You get a clean, sanitized, air-conditioned vehicle with a professional driver.",
              },
              {
                q: "What about toll gates, parking and permits?",
                a: "Toll charges, parking fees, and interstate border entry permits (if travelling outside the home state) are not included in the base rate and are payable as per actual receipts during the journey.",
              },
              {
                q: "Can I book a multi-day or custom route trip?",
                a: "Yes! Use the Round Trip toggle for return journeys, or call/WhatsApp us directly for custom multi-city sightseeing packages tailored to your schedule.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-3xl bg-white p-7 shadow-card">
                <h3 className="flex items-start gap-2.5 font-display text-lg font-bold text-ink">
                  <HelpCircle size={20} className="mt-0.5 shrink-0 text-lagoon" />
                  <span>{q}</span>
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink/70 pl-7">{a}</p>
              </div>
            ))}
          </div>

          {/* Need help banner */}
          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl bg-mist p-8 sm:flex-row sm:p-10">
            <div>
              <h3 className="text-xl font-bold">Need a custom itinerary or special group rates?</h3>
              <p className="mt-1 text-sm text-ink/70">Our travel desk is available daily from 9 am to 9 pm.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-dark !py-2.5">
                Talk to us <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

