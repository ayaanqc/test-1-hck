// Departments, offices and the chain above each office.
// Simplified sample; real chains differ by state.
// Every office and post here is made up for the prototype.

export const DEPARTMENTS = [
  {
    id: 'municipal',
    name: { en: 'Municipal / urban body', hi: 'नगरपालिका / शहरी निकाय' },
    chainId: 'municipal',
    categories: ['bribe', 'refused_service', 'rude', 'not_duty', 'other'],
  },
  {
    id: 'police',
    name: { en: 'Police', hi: 'पुलिस' },
    chainId: 'police',
    categories: ['bribe', 'refused_service', 'rude', 'not_duty', 'other'],
  },
  {
    id: 'hospital',
    name: { en: 'Government hospital', hi: 'सरकारी अस्पताल' },
    chainId: 'hospital',
    categories: ['bribe', 'refused_service', 'rude', 'not_duty', 'other'],
  },
  {
    id: 'school',
    name: { en: 'Government school', hi: 'सरकारी स्कूल' },
    chainId: 'school',
    categories: ['bribe', 'refused_service', 'rude', 'not_duty', 'other'],
  },
]

// The chain above each level. Label shown in the UI: "simplified sample; real chains differ by state".
export const CHAINS = {
  municipal: [
    { key: 'ward', office: { en: 'Ward Office', hi: 'वार्ड कार्यालय' } },
    { key: 'zonal', office: { en: 'Zonal Officer', hi: 'क्षेत्रीय अधिकारी' } },
    { key: 'commissioner', office: { en: 'Municipal Commissioner', hi: 'नगर आयुक्त' } },
    { key: 'state_urban', office: { en: 'State Urban Development Department', hi: 'राज्य शहरी विकास विभाग' } },
    { key: 'lokayukta', office: { en: 'Lokayukta', hi: 'लोकायुक्त' } },
  ],
  police: [
    { key: 'sho', office: { en: 'Station House Officer', hi: 'थाना प्रभारी' } },
    { key: 'sp', office: { en: 'Superintendent of Police', hi: 'पुलिस अधीक्षक' } },
    { key: 'pca_district', office: { en: 'Police Complaints Authority (district)', hi: 'पुलिस शिकायत प्राधिकरण (जिला)' } },
    { key: 'pca_state', office: { en: 'Police Complaints Authority (state)', hi: 'पुलिस शिकायत प्राधिकरण (राज्य)' } },
    { key: 'shrc', office: { en: 'State Human Rights Commission', hi: 'राज्य मानवाधिकार आयोग' } },
  ],
  hospital: [
    { key: 'ms', office: { en: 'Medical Superintendent', hi: 'चिकित्सा अधीक्षक' } },
    { key: 'cmo', office: { en: 'Chief Medical Officer (district)', hi: 'मुख्य चिकित्सा अधिकारी (जिला)' } },
    { key: 'health_state', office: { en: 'State Health Department', hi: 'राज्य स्वास्थ्य विभाग' } },
  ],
  school: [
    { key: 'principal', office: { en: 'Principal', hi: 'प्रधानाचार्य' } },
    { key: 'beo', office: { en: 'Block Education Officer', hi: 'खंड शिक्षा अधिकारी' } },
    { key: 'deo', office: { en: 'District Education Officer', hi: 'जिला शिक्षा अधिकारी' } },
    { key: 'edu_state', office: { en: 'State Education Department', hi: 'राज्य शिक्षा विभाग' } },
  ],
}

export const OFFICES = [
  { id: 'muni-ward-12', deptId: 'municipal', chainId: 'municipal', level: 0, district: 'Jaipur',
    name: { en: 'Ward Office 12, Jaipur', hi: 'वार्ड कार्यालय 12, जयपुर' } },
  { id: 'muni-ward-7', deptId: 'municipal', chainId: 'municipal', level: 0, district: 'Jaipur',
    name: { en: 'Ward Office 7, Jaipur', hi: 'वार्ड कार्यालय 7, जयपुर' } },
  { id: 'muni-zonal-3', deptId: 'municipal', chainId: 'municipal', level: 1, district: 'Jaipur',
    name: { en: 'Zonal Office 3, Jaipur', hi: 'क्षेत्रीय कार्यालय 3, जयपुर' } },
  { id: 'muni-market', deptId: 'municipal', chainId: 'municipal', level: 0, district: 'Jaipur',
    name: { en: 'Market Licence Counter, Jaipur', hi: 'बाज़ार लाइसेंस काउंटर, जयपुर' } },

  { id: 'police-station-mansarovar', deptId: 'police', chainId: 'police', level: 0, district: 'Jaipur',
    name: { en: 'Mansarovar Police Station', hi: 'मानसरोवर थाना' } },
  { id: 'police-station-vaishali', deptId: 'police', chainId: 'police', level: 0, district: 'Jaipur',
    name: { en: 'Vaishali Nagar Police Station', hi: 'वैशाली नगर थाना' } },
  { id: 'police-traffic', deptId: 'police', chainId: 'police', level: 0, district: 'Jaipur',
    name: { en: 'Traffic Police Office, Jaipur', hi: 'यातायात पुलिस कार्यालय, जयपुर' } },

  { id: 'hospital-sms', deptId: 'hospital', chainId: 'hospital', level: 0, district: 'Jaipur',
    name: { en: 'Sawai Mansingh Hospital (sample)', hi: 'सवाई मानसिंह अस्पताल (नमूना)' } },
  { id: 'hospital-phc-amber', deptId: 'hospital', chainId: 'hospital', level: 0, district: 'Jaipur',
    name: { en: 'Primary Health Centre, Amber', hi: 'प्राथमिक स्वास्थ्य केंद्र, आमेर' } },

  { id: 'school-govt-girls', deptId: 'school', chainId: 'school', level: 0, district: 'Jaipur',
    name: { en: 'Government Girls School, Ward 12', hi: 'राजकीय कन्या विद्यालय, वार्ड 12' } },
  { id: 'school-govt-boys', deptId: 'school', chainId: 'school', level: 0, district: 'Jaipur',
    name: { en: 'Government Boys School, Amber', hi: 'राजकीय बालक विद्यालय, आमेर' } },
]

export function getOffice(id) {
  return OFFICES.find((o) => o.id === id) || null
}

export function getDept(id) {
  return DEPARTMENTS.find((d) => d.id === id) || null
}

export function officeName(office) {
  return office ? office.name : { en: 'Unknown office', hi: 'अज्ञात कार्यालय' }
}

// The full chain for an office: level 0 is the office itself, higher levels go up.
export function chainFor(officeId, chainIdOverride) {
  const office = getOffice(officeId)
  const chainId = chainIdOverride || (office && office.chainId) || 'municipal'
  const chain = CHAINS[chainId] || CHAINS.municipal
  const startLevel = office ? office.level : 0
  const levels = []
  for (let i = startLevel; i < chain.length; i++) {
    const step = chain[i]
    levels.push({
      key: step.key,
      level: i - startLevel,
      chainLevel: i,
      office: i === startLevel && office ? office.name : step.office,
    })
  }
  return levels
}

// Name of the office a complaint sits at, given its level index in its own chain.
export function officeAtLevel(complaint, level) {
  const levels = chainFor(complaint.officeId, complaint.chainId)
  const l = levels[Math.min(level, levels.length - 1)]
  return l ? l.office : { en: 'Unknown office', hi: 'अज्ञात कार्यालय' }
}

export function chainLength(chainId) {
  return (CHAINS[chainId] || CHAINS.municipal).length
}

export const CATEGORIES = [
  { id: 'bribe', label: { en: 'A bribe was asked for', hi: 'रिश्वत माँगी गई' } },
  { id: 'refused_service', label: { en: 'Service refused', hi: 'सेवा देने से मना किया' } },
  { id: 'rude', label: { en: 'Rude or abusive behaviour', hi: 'अभद्र या अपमानजनक व्यवहार' } },
  { id: 'not_duty', label: { en: 'Not doing their duty', hi: 'अपना काम नहीं किया' } },
  { id: 'other', label: { en: 'Something else', hi: 'कुछ और' } },
]

export function categoryLabel(id) {
  const c = CATEGORIES.find((x) => x.id === id)
  return c ? c.label : { en: 'Other', hi: 'अन्य' }
}

// The chain node a complaint currently sits at (chainLevel is the index inside the chain).
export function currentNode(complaint, derived) {
  const levels = chainFor(complaint.officeId, complaint.chainId)
  return levels[Math.min(derived.level, levels.length - 1)]
}

export function deskLabel(chainId, chainLevel) {
  const chain = CHAINS[chainId]
  return chain && chain[chainLevel] ? chain[chainLevel].office : null
}

export const ALL_DESKS = Object.entries(CHAINS).flatMap(([chainId, chain]) =>
  chain.map((step, i) => ({ chainId, chainLevel: i, office: step.office, key: `${chainId}:${i}` })),
)
