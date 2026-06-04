import { Award, Users, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const VALUES = [
  {
    icon: Award,
    title: "Quality First",
    desc: "Every product undergoes rigorous quality checks before leaving our warehouse. We only carry furniture that meets commercial-grade standards.",
  },
  {
    icon: Users,
    title: "Built for Salon Owners",
    desc: "We understand the nail salon business. Our team has worked closely with hundreds of salon owners to design furniture that improves workflow and client experience.",
  },
  {
    icon: MapPin,
    title: "Nationwide Reach",
    desc: "From Houston to Los Angeles, New York to Miami — we ship to all 50 states with reliable freight carriers and white-glove delivery options.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    desc: "Most in-stock items ship within 2 weeks. Custom orders typically ship in 4–8 weeks. We keep you updated at every step.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero */}
      <section className="bg-charcoal-900 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-4">
            Our Story
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">
            About Kashant C-Silan
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
            We are a Houston-based nail salon equipment supplier dedicated to
            helping salon owners across the US create spaces that inspire
            confidence, luxury, and lasting client relationships.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-4">
              Our Mission
            </p>
            <h2 className="font-serif text-4xl font-bold text-charcoal-900 mb-6">
              Furniture That Works as Hard as You Do
            </h2>
            <p className="text-charcoal-800/60 leading-relaxed mb-4">
              Kashant C-Silan LLC was founded with one purpose: to give nail
              salon owners access to the same quality of furniture that luxury
              spas enjoy — without the luxury price tag or the hassle of
              overseas sourcing.
            </p>
            <p className="text-charcoal-800/60 leading-relaxed mb-8">
              We source, inspect, and ship every piece directly to your salon
              door. Our bilingual team speaks English and Vietnamese, making
              it easy to communicate your exact needs.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full"
            >
              Get in Touch <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "500+", label: "Salons Served" },
              { value: "50",   label: "States Covered" },
              { value: "8",    label: "Product Lines" },
              { value: "5★",   label: "Customer Rating" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-cream-50 rounded-2xl p-8 text-center border border-cream-100"
              >
                <p className="font-serif text-4xl font-bold text-charcoal-900 mb-2">
                  {value}
                </p>
                <p className="text-xs uppercase tracking-widest text-charcoal-800/40">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <p className="text-gold-400 text-xs tracking-widest2 uppercase text-center mb-3">
            What We Stand For
          </p>
          <h2 className="font-serif text-4xl font-bold text-center text-charcoal-900 mb-16">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-8 border border-cream-100"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gold-400/10 rounded-xl mb-4">
                  <Icon size={22} className="text-gold-400" />
                </div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-3">
                  {title}
                </h3>
                <p className="text-charcoal-800/60 leading-relaxed text-sm">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
