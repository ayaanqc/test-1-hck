// Every deadline and threshold in the prototype lives here.
// All numbers are SAMPLE values for the demo, not legal advice.

export const CONFIG = {
  // Deadline at every level of every chain (sample).
  ackDays: 3, // acknowledge within 3 days
  respondDays: 15, // respond within 15 days
  resolveDays: 30, // resolve within 30 days

  // Investigation in progress pauses escalation only while updates keep arriving.
  updateIntervalDays: 15,

  // How long a request for more information pauses escalation.
  infoResponseDays: 7,

  // Accountability indicator needs this many closed complaints before it shows.
  minClosedComplaintsForIndicator: 10,

  // Weights used by the accountability indicator (see /accountability/how).
  indicatorWeights: { acknowledged: 0.4, responded: 0.3, deadlines: 0.2, findings: 0.1 },

  // AI flags (a flag is "worth a closer look", never proof).
  duplicateSimilarity: 0.8,
  coordinationWindowHours: 1,
  coordinationMinComplaints: 3,
  newAccountDays: 7,

  // Legal aid sample income limit. "Check with your DLSA" — states set their own.
  sampleIncomeLimitAnnual: 300000,

  // Demo OTP, shown on screen because this is a prototype.
  demoOtp: '123456',

  // Uploads
  maxEvidenceMB: 25,

  // How many days "Demo date" jumps per click.
  demoDateStepDays: 5,
}

export const STATUS = {
  submitted: { en: 'Submitted', hi: 'दर्ज किया गया' },
  acknowledged: { en: 'Acknowledged', hi: 'पावती मिली' },
  investigation: { en: 'Investigation in progress', hi: 'जाँच जारी' },
  information_requested: { en: 'Information requested', hi: 'जानकारी माँगी गई' },
  response: { en: 'Response received', hi: 'जवाब मिला' },
  transferred: { en: 'Transferred', hi: 'स्थानांतरित' },
  escalated: { en: 'Moved up a level', hi: 'अगले स्तर पर भेजा गया' },
  finding_recorded: { en: 'Finding recorded through review', hi: 'समीक्षा में निष्कर्ष दर्ज' },
  closed: { en: 'Closed with reason', hi: 'कारण के साथ बंद' },
  rejected: { en: 'Rejected — appeal possible', hi: 'अस्वीकार — अपील संभव' },
  appealed: { en: 'Appeal filed', hi: 'अपील दर्ज' },
  reopened: { en: 'Reopened on appeal', hi: 'अपील पर फिर खोला गया' },
  withdrawn: { en: 'Withdrawn by complainant', hi: 'शिकायतकर्ता ने वापस ली' },
  restricted: { en: 'Restricted from public view', hi: 'सार्वजनिक दृश्य से प्रतिबंधित' },
  top_of_chain: { en: 'At the top of the chain — no resolution', hi: 'श्रृंखला के शीर्ष पर — समाधान नहीं' },
}
