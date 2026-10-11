// House sale add-on (decisions section 30), per property: $995 by Notice of Proposed Action (DE-165, independent
// administration) or $1,495 when the court must confirm the sale (DE-260). Outside the Probate Code 10810 limit.
import React from 'react';

export const HOUSE_SALE_PRICES = { npa: 995, confirmation: 1495 };

export default function HouseSaleAddon({ value, count, onChange }) {
  const opt = (key, title, price, text) => (
    <label key={key} className={`block border-2 rounded-lg p-4 cursor-pointer ${value === key ? 'border-blue-900 bg-blue-50' : 'border-gray-200'}`}>
      <input type="radio" name="house-sale" className="mr-2" checked={value === key} onChange={() => onChange(key, count)} />
      <span className="font-semibold text-gray-900">{title}</span>
      {price != null && <span className="ml-2 font-bold text-blue-900">+${price.toLocaleString()} per property</span>}
      {text && <span className="block text-sm text-gray-600 mt-1 ml-6">{text}</span>}
    </label>
  );
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white" data-testid="house-sale-addon">
      <h3 className="text-lg font-semibold text-gray-900">Optional: selling a house in the estate</h3>
      <p className="text-sm text-gray-600 mt-1 mb-4">We prepare the sale papers and clear any court notes on them. You sign, give notice and file them. Any newspaper notice of the sale is paid to the newspaper. A court hearing appearance is a separate option.</p>
      <div className="space-y-3">
        {opt(null, 'No house sale now', null, 'You can add this later.')}
        {opt('npa', 'Sale by Notice of Proposed Action', HOUSE_SALE_PRICES.npa, 'When the estate can sell without asking the court first. Form DE-165.')}
        {opt('confirmation', 'Sale the court must confirm', HOUSE_SALE_PRICES.confirmation, 'Report of sale and petition to confirm it, with its notice and order. Form DE-260.')}
      </div>
      {value && (
        <label className="block mt-4 text-sm text-gray-700">Number of properties
          <input type="number" min="1" max="10" value={count} onChange={(e) => onChange(value, Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className="ml-3 w-20 px-2 py-1 border border-gray-300 rounded" />
        </label>
      )}
    </div>
  );
}
