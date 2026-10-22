// Legal routes. General information, not legal advice.
// Explanatory text (title, what it is, steps, documents) lives in src/i18n/en.js and hi.js
// under legal.routes.<id>.

export const LEGAL_ROUTES = [
  {
    id: 'rti',
    appliesTo: ['*'],
    source: { label: { en: 'RTI Online (Government of India)', hi: 'आरटीआई ऑनलाइन (भारत सरकार)' }, url: 'https://rtionline.gov.in' },
    law: { en: 'Right to Information Act, 2005', hi: 'सूचना का अधिकार अधिनियम, 2005' },
  },
  {
    id: 'cpgrams',
    appliesTo: ['*'],
    source: { label: { en: 'CPGRAMS grievance portal', hi: 'सीपीजीआरएएमएस शिकायत पोर्टल' }, url: 'https://pgportal.gov.in' },
    law: { en: 'Centralised Public Grievance Redress and Monitoring System', hi: 'केंद्रीकृत लोक शिकायत निवारण और निगरानी प्रणाली' },
  },
  {
    id: 'right_to_services',
    appliesTo: ['refused_service', 'not_duty', 'other'],
    source: { label: { en: 'State Right to Services portal (example)', hi: 'राज्य सेवा का अधिकार पोर्टल (उदाहरण)' }, url: 'https://rtionline.gov.in' },
    law: { en: 'Your state’s Right to Services law, where one exists', hi: 'आपके राज्य का सेवा का अधिकार कानून, जहाँ लागू हो' },
  },
  {
    id: 'bribe',
    appliesTo: ['bribe'],
    source: { label: { en: 'Central Vigilance Commission', hi: 'केंद्रीय सतर्कता आयोग' }, url: 'https://cvc.gov.in' },
    law: { en: 'Prevention of Corruption Act, 1988', hi: 'भ्रष्टाचार निवारण अधिनियम, 1988' },
  },
  {
    id: 'police_fir',
    appliesTo: ['refused_service', 'not_duty', 'bribe'],
    department: 'police',
    source: { label: { en: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (India Code)', hi: 'भारतीय नागरिक सुरक्षा संहिता, 2023 (इंडिया कोड)' }, url: 'https://www.indiacode.nic.in' },
    law: { en: 'Sections 173(4) and 175(3), BNSS', hi: 'धारा 173(4) और 175(3), बीएनएसएस' },
  },
  {
    id: 'police_misconduct',
    appliesTo: ['rude', 'not_duty', 'other'],
    department: 'police',
    source: { label: { en: 'Police Complaints Authority (state, where one exists)', hi: 'पुलिस शिकायत प्राधिकरण (राज्य, जहाँ हो)' }, url: 'https://www.indiacode.nic.in' },
    law: { en: 'Police Act, 1861 and state police complaints rules', hi: 'पुलिस अधिनियम, 1861 और राज्य पुलिस शिकायत नियम' },
  },
  {
    id: 'human_rights',
    appliesTo: ['rude', 'not_duty', 'other'],
    source: { label: { en: 'National Human Rights Commission', hi: 'राष्ट्रीय मानवाधिकार आयोग' }, url: 'https://nhrc.nic.in' },
    law: { en: 'Protection of Human Rights Act, 1993', hi: 'मानवाधिकार संरक्षण अधिनियम, 1993' },
  },
  {
    id: 'writ',
    appliesTo: ['*'],
    source: { label: { en: 'Constitution of India, Article 226 (India Code)', hi: 'भारत का संविधान, अनुच्छेद 226 (इंडिया कोड)' }, url: 'https://www.indiacode.nic.in' },
    law: { en: 'Article 226, Constitution of India', hi: 'अनुच्छेद 226, भारत का संविधान' },
  },
]

export function routesForCategory(category, departmentId) {
  return LEGAL_ROUTES.filter((r) => {
    if (r.department && r.department !== departmentId) return false
    return r.appliesTo.includes('*') || r.appliesTo.includes(category)
  })
}
