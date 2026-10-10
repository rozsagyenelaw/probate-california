// One progress bar for the whole start-and-pay flow (client experience rule, 2026-10-10):
// always shows where the client is and what comes next.
import React from 'react';
import { Check } from 'lucide-react';

export function checkoutSteps(feeAgreementEnabled) {
  return ['Your details', 'Your service', ...(feeAgreementEnabled ? ['Fee agreement'] : []), 'Payment', 'About the estate'];
}

export default function CheckoutProgress({ steps, current }) {
  const next = steps[current + 1];
  return (
    <nav aria-label="Your progress" className="mb-6" data-testid="checkout-progress">
      <ol className="flex items-center gap-1 sm:gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex-1 min-w-0" aria-current={i === current ? 'step' : undefined}>
            <div className={`h-2 rounded-full ${i < current ? 'bg-green-500' : i === current ? 'bg-blue-900' : 'bg-gray-200'}`} />
            <p className={`mt-1 text-[11px] sm:text-xs truncate ${i === current ? 'text-blue-900 font-semibold' : 'text-gray-500'}`}>
              {i < current && <Check className="inline h-3 w-3 mr-0.5 text-green-600" aria-hidden="true" />}{s}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm text-gray-600">Step {current + 1} of {steps.length}: <strong>{steps[current]}</strong>{next ? `. Next: ${next}.` : '.'}</p>
    </nav>
  );
}
