// All officials in this prototype are made up. There is no way to add a real official.

export const OFFICIALS = [
  { id: 'off-1', name: 'Rakesh Vyas', post: { en: 'Licence clerk', hi: 'लाइसेंस क्लर्क' }, officeId: 'muni-market', sample: true },
  { id: 'off-2', name: 'Neelam Choudhary', post: { en: 'Ward officer', hi: 'वार्ड अधिकारी' }, officeId: 'muni-ward-12', sample: true },
  { id: 'off-3', name: 'Devendra Singh', post: { en: 'Zonal officer', hi: 'क्षेत्रीय अधिकारी' }, officeId: 'muni-zonal-3', sample: true },
  { id: 'off-4', name: 'Sunil Bhati', post: { en: 'Sanitation inspector', hi: 'सफ़ाई निरीक्षक' }, officeId: 'muni-ward-7', sample: true },
  { id: 'off-5', name: 'Vikram Rathore', post: { en: 'Station House Officer', hi: 'थाना प्रभारी' }, officeId: 'police-station-mansarovar', sample: true },
  { id: 'off-6', name: 'Anjali Meena', post: { en: 'Sub-inspector', hi: 'उप-निरीक्षक' }, officeId: 'police-station-vaishali', sample: true },
  { id: 'off-7', name: 'Mahesh Jangid', post: { en: 'Traffic constable', hi: 'यातायात सिपाही' }, officeId: 'police-traffic', sample: true },
  { id: 'off-8', name: 'Dr. Kavita Sharma', post: { en: 'Medical Superintendent', hi: 'चिकित्सा अधीक्षक' }, officeId: 'hospital-sms', sample: true },
  { id: 'off-9', name: 'Ramkishore Bairwa', post: { en: 'Registration clerk', hi: 'पंजीकरण क्लर्क' }, officeId: 'hospital-phc-amber', sample: true },
  { id: 'off-10', name: 'Sarita Yadav', post: { en: 'Principal', hi: 'प्रधानाचार्य' }, officeId: 'school-govt-girls', sample: true },
  { id: 'off-11', name: 'Gopal Saini', post: { en: 'Head teacher', hi: 'प्रधान शिक्षक' }, officeId: 'school-govt-boys', sample: true },
  { id: 'off-12', name: 'Farhan Qureshi', post: { en: 'Revenue clerk', hi: 'राजस्व क्लर्क' }, officeId: 'muni-ward-12', sample: true },
]

export function officialsForOffice(officeId) {
  return OFFICIALS.filter((o) => o.officeId === officeId)
}

// The name an office official sees for themselves (demo only).
export const DEMO_OFFICIAL_BY_OFFICE = {
  'muni-ward-12': 'Neelam Choudhary',
  'muni-market': 'Rakesh Vyas',
  'muni-zonal-3': 'Devendra Singh',
  'police-station-mansarovar': 'Vikram Rathore',
  'hospital-sms': 'Dr. Kavita Sharma',
  'school-govt-girls': 'Sarita Yadav',
}

export const DEMO_OFFICIAL = {
  name: 'Neelam Choudhary',
  role: { en: 'Office official', hi: 'कार्यालय अधिकारी' },
}

export const REVIEWER = {
  name: { en: 'Oversight reviewer (demo)', hi: 'निरीक्षण समीक्षक (डेमो)' },
}
