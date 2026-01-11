import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  FileText
} from 'lucide-react';

const FormGenerator = ({ caseData, onClose }) => {
  const [copied, setCopied] = useState(false);
  const formRef = useRef(null);

  if (!caseData) return null;

  const decedent = caseData.decedent || {};
  const petitioner = caseData.petitioner || {};
  const heirs = caseData.heirs || [];
  const assets = caseData.assets || {};
  const liabilities = caseData.liabilities || [];

  // Calculate totals
  const realPropertyTotal = (assets.realProperty || []).reduce((sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0);
  const financialTotal = (assets.financialAccounts || []).reduce((sum, a) => sum + (parseFloat(a.estimatedValue) || 0), 0);
  const vehicleTotal = (assets.vehicles || []).reduce((sum, v) => sum + (parseFloat(v.estimatedValue) || 0), 0);
  const personalTotal = (assets.personalProperty || []).reduce((sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0);
  const totalAssets = realPropertyTotal + financialTotal + vehicleTotal + personalTotal;
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (parseFloat(l.amountOwed) || 0), 0);

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyAll = () => {
    const text = formRef.current?.innerText || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Form field component
  const FormField = ({ label, value, wide }) => (
    <div className={`${wide ? 'col-span-2' : ''}`}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm min-h-[38px]">
        {value || <span className="text-gray-400">-</span>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-auto py-8">
      <div className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 rounded-t-xl flex items-center justify-between print:hidden">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-bold">Auto-Generated Form Data</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div ref={formRef} className="p-6 space-y-6 print:p-4">
          {/* Case Header */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-center text-blue-900 mb-2">
              PETITION FOR PROBATE
            </h3>
            <p className="text-center text-gray-600">
              Superior Court of California, County of {caseData.filingCounty || decedent.lastAddress?.county || '____________'}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField label="Estate of" value={caseData.estateName} />
              <FormField label="Case Number" value={caseData.caseNumber || 'To be assigned'} />
            </div>
          </div>

          {/* Decedent Information */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">1. DECEDENT INFORMATION</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" value={decedent.firstName} />
              <FormField label="Middle Name" value={decedent.middleName} />
              <FormField label="Last Name" value={decedent.lastName} />
              <FormField label="Also Known As (AKA)" value={decedent.aka} />
              <FormField label="Date of Birth" value={decedent.dateOfBirth} />
              <FormField label="Date of Death" value={decedent.dateOfDeath} />
              <FormField label="Place of Death (City)" value={decedent.placeOfDeath} />
              <FormField label="SSN (Last 4 digits)" value={decedent.ssnLast4 ? `XXX-XX-${decedent.ssnLast4}` : ''} />
              <FormField label="Street Address" value={decedent.lastAddress?.street} wide />
              <FormField label="City" value={decedent.lastAddress?.city} />
              <FormField label="State" value={decedent.lastAddress?.state || 'CA'} />
              <FormField label="ZIP Code" value={decedent.lastAddress?.zip} />
              <FormField label="County" value={decedent.lastAddress?.county} />
              <FormField label="Marital Status at Death" value={decedent.maritalStatus} />
              <FormField label="Citizenship" value={decedent.citizenship || 'USA'} />
            </div>
          </div>

          {/* Petitioner Information */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">2. PETITIONER INFORMATION</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" value={petitioner.firstName} />
              <FormField label="Last Name" value={petitioner.lastName} />
              <FormField label="Relationship to Decedent" value={petitioner.relationship} />
              <FormField label="California Resident" value={petitioner.isCAResident ? 'Yes' : 'No'} />
              <FormField label="Street Address" value={petitioner.address?.street} wide />
              <FormField label="City" value={petitioner.address?.city} />
              <FormField label="State" value={petitioner.address?.state || 'CA'} />
              <FormField label="ZIP Code" value={petitioner.address?.zip} />
              <FormField label="Phone" value={petitioner.phone} />
              <FormField label="Email" value={petitioner.email} />
            </div>
          </div>

          {/* Will Information */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">3. WILL INFORMATION</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Will Exists" value={caseData.willExists === true ? 'Yes - Testate' : caseData.willExists === false ? 'No - Intestate' : ''} />
              <FormField label="Date of Will" value={caseData.willDate} />
              <FormField label="Named Executor in Will" value={caseData.namedExecutor} />
              <FormField label="Bond Waived in Will" value={caseData.bondWaivedInWill === true ? 'Yes' : caseData.bondWaivedInWill === false ? 'No' : ''} />
              <FormField label="Codicil Exists" value={caseData.codicilExists ? 'Yes' : 'No'} />
              <FormField label="Codicil Date(s)" value={caseData.codicilDates?.join(', ')} />
            </div>
          </div>

          {/* Heirs & Beneficiaries */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">4. HEIRS & BENEFICIARIES ({heirs.length})</h4>
            {heirs.length === 0 ? (
              <p className="text-gray-500 italic">No heirs listed</p>
            ) : (
              <div className="space-y-4">
                {heirs.map((heir, index) => (
                  <div key={heir.id || index} className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-medium text-sm text-gray-500 mb-2">Heir #{index + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Full Name" value={`${heir.firstName || ''} ${heir.lastName || ''}`} />
                      <FormField label="Relationship" value={heir.relationship} />
                      <FormField label="Age / Adult or Minor" value={heir.age || (heir.isMinor ? 'Minor' : 'Adult')} />
                      <FormField label="Share %" value={heir.sharePercentage ? `${heir.sharePercentage}%` : ''} />
                      <FormField label="Address" value={heir.address?.street ? `${heir.address.street}, ${heir.address.city}, ${heir.address.state} ${heir.address.zip}` : ''} wide />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real Property */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">
              5. REAL PROPERTY ({(assets.realProperty || []).length}) - Total: {formatCurrency(realPropertyTotal)}
            </h4>
            {(assets.realProperty || []).length === 0 ? (
              <p className="text-gray-500 italic">No real property listed</p>
            ) : (
              <div className="space-y-4">
                {(assets.realProperty || []).map((prop, index) => (
                  <div key={prop.id || index} className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-medium text-sm text-gray-500 mb-2">Property #{index + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Property Address" value={prop.address} wide />
                      <FormField label="APN (Assessor's Parcel Number)" value={prop.apn} />
                      <FormField label="Estimated Value" value={formatCurrency(prop.estimatedValue)} />
                      <FormField label="How Title Held" value={prop.titleHolding} />
                      <FormField label="Mortgage Balance" value={formatCurrency(prop.mortgageBalance)} />
                      <FormField label="Lender Name" value={prop.lender} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Accounts */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">
              6. FINANCIAL ACCOUNTS ({(assets.financialAccounts || []).length}) - Total: {formatCurrency(financialTotal)}
            </h4>
            {(assets.financialAccounts || []).length === 0 ? (
              <p className="text-gray-500 italic">No financial accounts listed</p>
            ) : (
              <div className="space-y-4">
                {(assets.financialAccounts || []).map((acct, index) => (
                  <div key={acct.id || index} className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-medium text-sm text-gray-500 mb-2">Account #{index + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Institution Name" value={acct.institutionName} />
                      <FormField label="Account Type" value={acct.accountType} />
                      <FormField label="Account Number (Last 4)" value={acct.accountLast4 ? `XXXX${acct.accountLast4}` : ''} />
                      <FormField label="Estimated Value" value={formatCurrency(acct.estimatedValue)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicles */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">
              7. VEHICLES ({(assets.vehicles || []).length}) - Total: {formatCurrency(vehicleTotal)}
            </h4>
            {(assets.vehicles || []).length === 0 ? (
              <p className="text-gray-500 italic">No vehicles listed</p>
            ) : (
              <div className="space-y-4">
                {(assets.vehicles || []).map((veh, index) => (
                  <div key={veh.id || index} className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-medium text-sm text-gray-500 mb-2">Vehicle #{index + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Year" value={veh.year} />
                      <FormField label="Make" value={veh.make} />
                      <FormField label="Model" value={veh.model} />
                      <FormField label="VIN" value={veh.vin} />
                      <FormField label="License Plate" value={veh.licensePlate} />
                      <FormField label="Estimated Value" value={formatCurrency(veh.estimatedValue)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personal Property */}
          {(assets.personalProperty || []).length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">
                8. PERSONAL PROPERTY ({(assets.personalProperty || []).length}) - Total: {formatCurrency(personalTotal)}
              </h4>
              <div className="space-y-4">
                {(assets.personalProperty || []).map((item, index) => (
                  <div key={item.id || index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Description" value={item.description} />
                      <FormField label="Estimated Value" value={formatCurrency(item.estimatedValue)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liabilities */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">
              9. LIABILITIES ({liabilities.length}) - Total: {formatCurrency(totalLiabilities)}
            </h4>
            {liabilities.length === 0 ? (
              <p className="text-gray-500 italic">No liabilities listed</p>
            ) : (
              <div className="space-y-4">
                {liabilities.map((debt, index) => (
                  <div key={debt.id || index} className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-medium text-sm text-gray-500 mb-2">Debt #{index + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Creditor Name" value={debt.creditorName} />
                      <FormField label="Debt Type" value={debt.debtType} />
                      <FormField label="Account Number" value={debt.accountNumber} />
                      <FormField label="Amount Owed" value={formatCurrency(debt.amountOwed)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estate Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h4 className="font-bold text-gray-900 border-b border-blue-200 pb-2 mb-4">ESTATE SUMMARY</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-500">Total Assets</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalAssets)}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-500">Total Liabilities</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-500">Net Estate</p>
                <p className={`text-xl font-bold ${(totalAssets - totalLiabilities) >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
                  {formatCurrency(totalAssets - totalLiabilities)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>Generated by California Probate App</p>
            <p>Law Offices of Rozsa Gyene - CA Bar #208356</p>
            <p className="mt-2">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormGenerator;
