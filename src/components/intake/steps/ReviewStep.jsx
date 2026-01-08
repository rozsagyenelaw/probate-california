import React from 'react';
import {
  CheckCircle,
  User,
  Users,
  FileText,
  Home,
  Landmark,
  Car,
  CreditCard,
  AlertCircle,
  Edit2
} from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const Section = ({ icon: Icon, title, stepIndex, onEditStep, children }) => (
  <div className="border rounded-lg overflow-hidden">
    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <Icon className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      {onEditStep && (
        <button
          onClick={() => onEditStep(stepIndex)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </button>
      )}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const DataRow = ({ label, value, highlight }) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-600">{label}</span>
    <span className={`font-medium ${highlight ? 'text-blue-900' : 'text-gray-900'}`}>
      {value || 'Not provided'}
    </span>
  </div>
);

const ReviewStep = ({ formData, onEditStep }) => {
  const {
    decedent,
    petitioner,
    willExists,
    willDate,
    namedExecutor,
    bondWaivedInWill,
    heirs,
    assets,
    liabilities
  } = formData;

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not provided';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate totals
  const totalRealProperty = (assets?.realProperty || []).reduce(
    (sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0
  );
  const totalFinancial = (assets?.financialAccounts || []).reduce(
    (sum, a) => sum + (parseFloat(a.estimatedValue) || 0), 0
  );
  const totalVehicles = (assets?.vehicles || []).reduce(
    (sum, v) => sum + (parseFloat(v.estimatedValue) || 0), 0
  );
  const totalPersonalProperty = (assets?.personalProperty || []).reduce(
    (sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0
  );
  const totalAssets = totalRealProperty + totalFinancial + totalVehicles + totalPersonalProperty;
  const totalLiabilities = (liabilities || []).reduce(
    (sum, l) => sum + (parseFloat(l.amountOwed) || 0), 0
  );
  const netEstate = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Review Your Information</p>
            <p className="text-sm text-green-700">
              Please review all information below before submitting. Click "Edit" on any
              section to make changes.
            </p>
          </div>
        </div>
      </div>

      {/* Estate Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3">Estate Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Total Assets</p>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(totalAssets)}</p>
          </div>
          <div>
            <p className="text-blue-700">Total Liabilities</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex justify-between items-center">
            <p className="text-blue-700 font-medium">Estimated Net Estate Value</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(netEstate)}</p>
          </div>
        </div>
      </div>

      {/* Decedent Information */}
      <Section icon={User} title="Decedent Information" stepIndex={0} onEditStep={onEditStep}>
        <div className="space-y-1 text-sm">
          <DataRow
            label="Full Name"
            value={`${decedent?.firstName || ''} ${decedent?.middleName || ''} ${decedent?.lastName || ''}`.trim()}
            highlight
          />
          <DataRow label="Date of Death" value={formatDate(decedent?.dateOfDeath)} />
          <DataRow label="Date of Birth" value={formatDate(decedent?.dateOfBirth)} />
          <DataRow label="Place of Death" value={decedent?.placeOfDeath} />
          <DataRow
            label="Last Address"
            value={decedent?.lastAddress?.street ?
              `${decedent.lastAddress.street}, ${decedent.lastAddress.city}, ${decedent.lastAddress.state} ${decedent.lastAddress.zip}` :
              null
            }
          />
          <DataRow label="County" value={decedent?.lastAddress?.county} />
          <DataRow label="Marital Status" value={decedent?.maritalStatus} />
        </div>
      </Section>

      {/* Petitioner Information */}
      <Section icon={User} title="Petitioner Information" stepIndex={1} onEditStep={onEditStep}>
        <div className="space-y-1 text-sm">
          <DataRow
            label="Full Name"
            value={`${petitioner?.firstName || ''} ${petitioner?.lastName || ''}`.trim()}
            highlight
          />
          <DataRow label="Relationship" value={petitioner?.relationship} />
          <DataRow label="Phone" value={petitioner?.phone} />
          <DataRow label="Email" value={petitioner?.email} />
          <DataRow
            label="Address"
            value={petitioner?.address?.street ?
              `${petitioner.address.street}, ${petitioner.address.city}, ${petitioner.address.state} ${petitioner.address.zip}` :
              null
            }
          />
          <DataRow
            label="California Resident"
            value={petitioner?.isCAResident ? 'Yes' : 'No'}
          />
        </div>
      </Section>

      {/* Will Information */}
      <Section icon={FileText} title="Will Information" stepIndex={2} onEditStep={onEditStep}>
        <div className="space-y-1 text-sm">
          <DataRow
            label="Will Exists"
            value={willExists === true ? 'Yes' : willExists === false ? 'No (Intestate)' : 'Not specified'}
            highlight
          />
          {willExists && (
            <>
              <DataRow label="Date of Will" value={formatDate(willDate)} />
              <DataRow label="Named Executor" value={namedExecutor} />
              <DataRow
                label="Bond Waived in Will"
                value={bondWaivedInWill === true ? 'Yes' : bondWaivedInWill === false ? 'No' : 'Not specified'}
              />
            </>
          )}
        </div>
      </Section>

      {/* Heirs */}
      <Section icon={Users} title={`Heirs & Beneficiaries (${heirs?.length || 0})`} stepIndex={3} onEditStep={onEditStep}>
        {heirs && heirs.length > 0 ? (
          <div className="space-y-3">
            {heirs.map((heir, index) => (
              <div key={heir.id || index} className="bg-gray-50 rounded p-3 text-sm">
                <p className="font-medium text-gray-900">
                  {heir.firstName} {heir.lastName}
                  {heir.isDeceased && <span className="text-gray-500 ml-2">(Deceased)</span>}
                </p>
                <p className="text-gray-600">
                  {heir.relationship} • {heir.age}
                  {heir.sharePercentage && ` • ${heir.sharePercentage}%`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-yellow-600 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            No heirs added. At least one heir is required.
          </p>
        )}
      </Section>

      {/* Real Property */}
      <Section icon={Home} title={`Real Property (${assets?.realProperty?.length || 0})`} stepIndex={4} onEditStep={onEditStep}>
        {assets?.realProperty && assets.realProperty.length > 0 ? (
          <div className="space-y-3">
            {assets.realProperty.map((property, index) => (
              <div key={property.id || index} className="bg-gray-50 rounded p-3 text-sm">
                <p className="font-medium text-gray-900">{property.address}</p>
                <div className="flex justify-between text-gray-600">
                  <span>Value: {formatCurrency(property.estimatedValue)}</span>
                  {property.mortgageBalance && (
                    <span className="text-red-600">
                      Mortgage: {formatCurrency(property.mortgageBalance)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div className="text-right font-medium text-gray-900">
              Total: {formatCurrency(totalRealProperty)}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No real property listed</p>
        )}
      </Section>

      {/* Financial Accounts */}
      <Section icon={Landmark} title={`Financial Accounts (${assets?.financialAccounts?.length || 0})`} stepIndex={5} onEditStep={onEditStep}>
        {assets?.financialAccounts && assets.financialAccounts.length > 0 ? (
          <div className="space-y-3">
            {assets.financialAccounts.map((account, index) => (
              <div key={account.id || index} className="bg-gray-50 rounded p-3 text-sm">
                <p className="font-medium text-gray-900">{account.institutionName}</p>
                <div className="flex justify-between text-gray-600">
                  <span>{account.accountType}</span>
                  <span>{formatCurrency(account.estimatedValue)}</span>
                </div>
              </div>
            ))}
            <div className="text-right font-medium text-gray-900">
              Total: {formatCurrency(totalFinancial)}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No financial accounts listed</p>
        )}
      </Section>

      {/* Vehicles & Personal Property */}
      <Section icon={Car} title="Vehicles & Personal Property" stepIndex={6} onEditStep={onEditStep}>
        <div className="space-y-4">
          {/* Vehicles */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Vehicles ({assets?.vehicles?.length || 0})
            </h4>
            {assets?.vehicles && assets.vehicles.length > 0 ? (
              <div className="space-y-2">
                {assets.vehicles.map((vehicle, index) => (
                  <div key={vehicle.id || index} className="bg-gray-50 rounded p-2 text-sm flex justify-between">
                    <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                    <span>{formatCurrency(vehicle.estimatedValue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No vehicles listed</p>
            )}
          </div>

          {/* Personal Property */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Personal Property ({assets?.personalProperty?.length || 0})
            </h4>
            {assets?.personalProperty && assets.personalProperty.length > 0 ? (
              <div className="space-y-2">
                {assets.personalProperty.map((item, index) => (
                  <div key={item.id || index} className="bg-gray-50 rounded p-2 text-sm flex justify-between">
                    <span className="truncate mr-4">{item.description}</span>
                    <span className="whitespace-nowrap">{formatCurrency(item.estimatedValue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No personal property listed</p>
            )}
          </div>

          <div className="text-right font-medium text-gray-900 pt-2 border-t">
            Combined Total: {formatCurrency(totalVehicles + totalPersonalProperty)}
          </div>
        </div>
      </Section>

      {/* Liabilities */}
      <Section icon={CreditCard} title={`Liabilities (${liabilities?.length || 0})`} stepIndex={7} onEditStep={onEditStep}>
        {liabilities && liabilities.length > 0 ? (
          <div className="space-y-3">
            {liabilities.map((debt, index) => (
              <div key={debt.id || index} className="bg-gray-50 rounded p-3 text-sm">
                <p className="font-medium text-gray-900">{debt.creditorName}</p>
                <div className="flex justify-between text-gray-600">
                  <span>{debt.debtType}</span>
                  <span className="text-red-600">{formatCurrency(debt.amountOwed)}</span>
                </div>
              </div>
            ))}
            <div className="text-right font-medium text-red-600">
              Total: {formatCurrency(totalLiabilities)}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No liabilities listed</p>
        )}
      </Section>

      {/* Confirmation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Before You Submit</p>
            <p className="text-sm text-yellow-700 mt-1">
              By submitting this form, you certify that all information provided is accurate
              to the best of your knowledge. Providing false information may delay your
              probate case or result in legal consequences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
