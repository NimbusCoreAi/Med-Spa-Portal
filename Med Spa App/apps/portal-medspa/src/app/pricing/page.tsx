import Link from 'next/link';

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const tiers = [
  {
    name: 'Pilot',
    price: 'Free',
    period: '6 months',
    description: 'All features, free for pilot clinics',
    features: [
      'Digital intake forms (HIPAA-compliant)',
      'Appointment scheduling with reminders',
      'Stripe payment tracking',
      'Automated SMS + email notifications',
      'Audit logs + role-based access',
      'Biweekly feedback calls',
    ],
    cta: 'Start Free Pilot',
    href: '/auth/signup?plan=pilot',
    highlighted: false,
  },
  {
    name: 'Connect',
    price: '$49',
    period: '/month',
    description: 'All features + Connect API access',
    features: [
      'Everything in Pilot',
      'Connect API access (SMS, billing, reporting)',
      'Priority support',
      'No feedback calls required',
      'Cancel anytime',
    ],
    cta: 'Get Connect',
    href: '/auth/signup?plan=connect',
    highlighted: true,
  },
  {
    name: 'Intelligence',
    price: '+$99',
    period: '/month',
    description: 'Add ML predictions and risk scoring',
    features: [
      'Churn prediction model',
      'Risk scoring (no-show, revenue drop)',
      'Demand forecasting',
      'Anomaly detection',
      'ML-powered insights dashboard',
    ],
    cta: 'Add Intelligence',
    href: '/dashboard/settings/billing',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Start free with a pilot. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 ${
                tier.highlighted
                  ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-600'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Recommended
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                <span className="text-sm text-gray-500">{tier.period}</span>
              </div>
              <Link
                href={tier.href}
                className={`mt-6 block rounded-md px-4 py-2.5 text-center text-sm font-semibold ${
                  tier.highlighted
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {tier.cta}
              </Link>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckIcon />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Questions?{' '}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Get in touch
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
