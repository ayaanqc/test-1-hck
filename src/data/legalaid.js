// Free legal aid (sample data) and a directory of made-up lawyers.
// General information, not legal advice.

// Section 12, Legal Services Authorities Act, 1987. Text for each criterion lives in i18n.
export const ELIGIBILITY = [
  { id: 'woman' },
  { id: 'child' },
  { id: 'scst' },
  { id: 'disabled' },
  { id: 'custody' },
  { id: 'industrial_worker' },
  { id: 'trafficking' },
  { id: 'disaster' },
  { id: 'income' },
  { id: 'other' },
]

export const FREE_OPTIONS = [
  {
    id: 'dlsa',
    name: { en: 'District Legal Services Authority (DLSA)', hi: 'जिला विधिक सेवा प्राधिकरण (डीएलएसए)' },
    where: { en: 'At your district court. Ask for the DLSA front office.', hi: 'आपके जिला न्यायालय में। डीएलएसए फ्रंट ऑफ़िस पूछें।' },
    phone: '15100',
    cost: 'gov_aid',
  },
  {
    id: 'nalsa_helpline',
    name: { en: 'NALSA legal aid helpline 15100', hi: 'नालसा विधिक सहायता हेल्पलाइन 15100' },
    where: { en: 'Free phone line, Monday to Saturday, working hours.', hi: 'निःशुल्क फ़ोन लाइन, सोमवार से शनिवार, कार्य समय में।' },
    phone: '15100',
    cost: 'gov_aid',
  },
  {
    id: 'telelaw',
    name: { en: 'Tele-Law at a Common Service Centre', hi: 'सामान्य सेवा केंद्र पर टेली-लॉ' },
    where: { en: 'Video advice from a lawyer, free for eligible users, at your nearest CSC.', hi: 'निकटतम सीएससी पर वकील से वीडियो सलाह, पात्र लोगों के लिए निःशुल्क।' },
    phone: '15100',
    cost: 'gov_aid',
  },
  {
    id: 'nyaya_bandhu',
    name: { en: 'Nyaya Bandhu (pro bono lawyers)', hi: 'न्याय बंधु (निःशुल्क वकील)' },
    where: { en: 'Register in the app or call 15100 to be matched with a volunteer lawyer.', hi: 'ऐप में पंजीकरण करें या 15100 पर कॉल करके स्वयंसेवी वकील से जुड़ें।' },
    phone: '15100',
    cost: 'gov_aid',
  },
  {
    id: 'clinic',
    name: { en: 'Law school legal aid clinic', hi: 'विधि महाविद्यालय विधिक सहायता क्लिनिक' },
    where: { en: 'Students and teachers give free advice under supervision, near most law colleges.', hi: 'अधिकांश विधि महाविद्यालयों के पास छात्र और शिक्षक पर्यवेक्षण में निःशुल्क सलाह देते हैं।' },
    phone: null,
    cost: 'gov_aid',
  },
]

// All lawyers below are fictional. Names, phone numbers and addresses are made up.
export const LAWYERS = [
  { id: 'law-1', name: 'Adv. Meera Rathore (sample)', city: 'Jaipur', district: 'Jaipur', langs: ['hi', 'en'], specs: ['municipal', 'corruption'], formats: ['in_person', 'remote'], cost: 'free_consult', note: { en: 'First 20-minute consultation is free.', hi: 'पहली 20 मिनट की सलाह निःशुल्क है।' } },
  { id: 'law-2', name: 'Adv. Iqbal Ahmed (sample)', city: 'Jaipur', district: 'Jaipur', langs: ['hi', 'ur'], specs: ['police', 'criminal'], formats: ['in_person'], cost: 'paid', note: { en: 'Paid. Fees discussed in the first meeting.', hi: 'सशुल्क। फीस पहली बैठक में तय होती है।' } },
  { id: 'law-3', name: 'Adv. Priya Solanki (sample)', city: 'Jaipur', district: 'Jaipur', langs: ['hi', 'en'], specs: ['women', 'legal_aid'], formats: ['in_person', 'remote'], cost: 'gov_aid', note: { en: 'On the DLSA panel. Free if you qualify under Section 12.', hi: 'डीएलएसए पैनल पर। धारा 12 के तहत पात्र होने पर निःशुल्क।' } },
  { id: 'law-4', name: 'Adv. Deepak Menon (sample)', city: 'Jodhpur', district: 'Jodhpur', langs: ['hi', 'en'], specs: ['rti', 'service'], formats: ['remote'], cost: 'free_consult', note: { en: 'Free first call for RTI and service-delay cases.', hi: 'आरटीआई और सेवा विलंब मामलों में पहली कॉल निःशुल्क।' } },
  { id: 'law-5', name: 'Adv. Nirmala Bishnoi (sample)', city: 'Jaipur', district: 'Jaipur', langs: ['hi'], specs: ['health', 'women'], formats: ['in_person'], cost: 'free_consult', note: { en: 'Free consultation on Mondays.', hi: 'सोमवार को निःशुल्क सलाह।' } },
  { id: 'law-6', name: 'Adv. Karan Chouhan (sample)', city: 'Kota', district: 'Kota', langs: ['hi', 'en'], specs: ['education', 'service'], formats: ['in_person', 'remote'], cost: 'paid', note: { en: 'Paid. Fixed fee for a written representation.', hi: 'सशुल्क। लिखित अभ्यावेदन के लिए तय शुल्क।' } },
  { id: 'law-7', name: 'Adv. Shabana Khan (sample)', city: 'Ajmer', district: 'Ajmer', langs: ['hi', 'ur', 'en'], specs: ['corruption', 'criminal'], formats: ['in_person', 'remote'], cost: 'gov_aid', note: { en: 'Legal aid panel lawyer for the district court.', hi: 'जिला न्यायालय के लिए विधिक सहायता पैनल वकील।' } },
  { id: 'law-8', name: 'Adv. Ramesh Gurjar (sample)', city: 'Jaipur', district: 'Jaipur', langs: ['hi'], specs: ['municipal', 'labour'], formats: ['in_person'], cost: 'free_consult', note: { en: 'Free help writing an RTI application.', hi: 'आरटीआई आवेदन लिखने में निःशुल्क सहायता।' } },
  { id: 'law-9', name: 'Adv. Tanya Fernandes (sample)', city: 'Udaipur', district: 'Udaipur', langs: ['en', 'hi'], specs: ['human_rights', 'women'], formats: ['remote'], cost: 'free_consult', note: { en: 'Free remote advice for human rights complaints.', hi: 'मानवाधिकार शिकायतों पर निःशुल्क दूरस्थ सलाह।' } },
  { id: 'law-10', name: 'Adv. Bhupendra Nath (sample)', city: 'Jaipur', district: 'Jaipur', langs: ['hi', 'en'], specs: ['rti', 'education', 'health'], formats: ['in_person', 'remote'], cost: 'paid', note: { en: 'Paid. Charges per hearing.', hi: 'सशुल्क। प्रति सुनवाई शुल्क।' } },
]

export const SPECS = [
  { id: 'municipal', label: { en: 'Municipal services', hi: 'नगरपालिका सेवाएँ' } },
  { id: 'corruption', label: { en: 'Bribery cases', hi: 'रिश्वत के मामले' } },
  { id: 'police', label: { en: 'Police', hi: 'पुलिस' } },
  { id: 'criminal', label: { en: 'Criminal law', hi: 'आपराधिक कानून' } },
  { id: 'women', label: { en: 'Women’s rights', hi: 'महिला अधिकार' } },
  { id: 'legal_aid', label: { en: 'Free legal aid', hi: 'निःशुल्क विधिक सहायता' } },
  { id: 'rti', label: { en: 'Right to Information', hi: 'सूचना का अधिकार' } },
  { id: 'service', label: { en: 'Service delivery', hi: 'सेवा वितरण' } },
  { id: 'health', label: { en: 'Health', hi: 'स्वास्थ्य' } },
  { id: 'education', label: { en: 'Education', hi: 'शिक्षा' } },
  { id: 'human_rights', label: { en: 'Human rights', hi: 'मानवाधिकार' } },
  { id: 'labour', label: { en: 'Labour', hi: 'श्रम' } },
]

export const LANGUAGES = [
  { id: 'hi', label: { en: 'Hindi', hi: 'हिंदी' } },
  { id: 'en', label: { en: 'English', hi: 'अंग्रेज़ी' } },
  { id: 'ur', label: { en: 'Urdu', hi: 'उर्दू' } },
]

export const FORMATS = [
  { id: 'in_person', label: { en: 'In person', hi: 'व्यक्तिगत रूप से' } },
  { id: 'remote', label: { en: 'Remote (phone or video)', hi: 'दूरस्थ (फ़ोन या वीडियो)' } },
]

export const COST_LABELS = {
  gov_aid: { en: 'Government legal aid', hi: 'सरकारी विधिक सहायता' },
  free_consult: { en: 'Free consultation', hi: 'निःशुल्क परामर्श' },
  paid: { en: 'Paid', hi: 'सशुल्क' },
}
