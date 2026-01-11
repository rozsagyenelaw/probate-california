// Step definitions for intake questionnaire
export const INTAKE_STEPS = [
  {
    id: 'decedent',
    number: 1,
    title: 'Decedent Information',
    shortTitle: 'Decedent',
    description: 'Information about the person who passed away'
  },
  {
    id: 'petitioner',
    number: 2,
    title: 'Petitioner Information',
    shortTitle: 'Petitioner',
    description: 'Your information as the personal representative'
  },
  {
    id: 'will',
    number: 3,
    title: 'Will Information',
    shortTitle: 'Will',
    description: 'Details about the will and named executor'
  },
  {
    id: 'heirs',
    number: 4,
    title: 'Heirs & Beneficiaries',
    shortTitle: 'Heirs',
    description: 'All persons entitled to inherit'
  },
  {
    id: 'realProperty',
    number: 5,
    title: 'Real Property',
    shortTitle: 'Real Estate',
    description: 'Houses, land, and other real estate'
  },
  {
    id: 'financial',
    number: 6,
    title: 'Financial Accounts',
    shortTitle: 'Finances',
    description: 'Bank accounts, investments, retirement'
  },
  {
    id: 'vehiclesPersonal',
    number: 7,
    title: 'Vehicles & Personal Property',
    shortTitle: 'Personal',
    description: 'Cars, jewelry, furniture, collections'
  },
  {
    id: 'liabilities',
    number: 8,
    title: 'Liabilities',
    shortTitle: 'Debts',
    description: 'Debts and obligations of the estate'
  },
  {
    id: 'documents',
    number: 9,
    title: 'Document Uploads',
    shortTitle: 'Documents',
    description: 'Upload required documents'
  },
  {
    id: 'review',
    number: 10,
    title: 'Review Information',
    shortTitle: 'Review',
    description: 'Review all information before payment'
  },
  {
    id: 'payment',
    number: 11,
    title: 'Payment & Submit',
    shortTitle: 'Payment',
    description: 'Complete payment to submit your case'
  }
];

// Initial form state
export const INITIAL_FORM_STATE = {
  // Decedent Information
  decedent: {
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfDeath: '',
    dateOfBirth: '',
    lastAddress: {
      street: '',
      city: '',
      state: 'CA',
      zip: '',
      county: ''
    },
    ssnLast4: '',
    placeOfDeath: '',
    maritalStatus: '',
    citizenship: 'US'
  },

  // Petitioner Information
  petitioner: {
    firstName: '',
    lastName: '',
    relationship: '',
    address: {
      street: '',
      city: '',
      state: 'CA',
      zip: ''
    },
    phone: '',
    email: '',
    isCAResident: true
  },

  // Will Information
  willExists: null,
  willDate: '',
  codicilExists: false,
  codicilDates: [],
  namedExecutor: '',
  bondWaivedInWill: null,

  // Family Survivor Information
  survivedBySpouse: null,
  survivedByChildren: null,
  survivedByGrandchildren: null,

  // Heirs & Beneficiaries
  heirs: [],

  // Assets
  assets: {
    realProperty: [],
    bankAccounts: [],
    investments: [],
    vehicles: [],
    personalProperty: [],
    otherAssets: []
  },

  // Liabilities
  liabilities: [],

  // Court Information
  court: {
    county: '',
    courthouse: '',
    address: ''
  },

  // Uploads (will store file references)
  uploads: {
    deathCertificate: null,
    will: null,
    codicils: [],
    propertyDeeds: [],
    bankStatements: [],
    vehicleTitles: [],
    petitionerID: null
  }
};

// California counties for dropdown
export const CA_COUNTIES = [
  'Alameda', 'Alpine', 'Amador', 'Butte', 'Calaveras', 'Colusa', 'Contra Costa',
  'Del Norte', 'El Dorado', 'Fresno', 'Glenn', 'Humboldt', 'Imperial', 'Inyo',
  'Kern', 'Kings', 'Lake', 'Lassen', 'Los Angeles', 'Madera', 'Marin', 'Mariposa',
  'Mendocino', 'Merced', 'Modoc', 'Mono', 'Monterey', 'Napa', 'Nevada', 'Orange',
  'Placer', 'Plumas', 'Riverside', 'Sacramento', 'San Benito', 'San Bernardino',
  'San Diego', 'San Francisco', 'San Joaquin', 'San Luis Obispo', 'San Mateo',
  'Santa Barbara', 'Santa Clara', 'Santa Cruz', 'Shasta', 'Sierra', 'Siskiyou',
  'Solano', 'Sonoma', 'Stanislaus', 'Sutter', 'Tehama', 'Trinity', 'Tulare',
  'Tuolumne', 'Ventura', 'Yolo', 'Yuba'
];

// Relationship options
export const RELATIONSHIPS = [
  'Spouse',
  'Child',
  'Son',
  'Daughter',
  'Parent',
  'Sibling',
  'Brother',
  'Sister',
  'Grandchild',
  'Grandparent',
  'Niece',
  'Nephew',
  'Aunt',
  'Uncle',
  'Cousin',
  'Friend',
  'Other'
];

// Marital status options
export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single / Never Married' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'domestic_partner', label: 'Domestic Partner' }
];
