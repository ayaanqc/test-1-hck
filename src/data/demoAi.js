// Prepared AI results used when no API key is configured.
// Labelled "demo result" everywhere in the interface.
// The fields are the prepared result for the sample evidence: a voice note about
// a licence renewal at the market counter.

export const DEMO_TRANSCRIPT = {
  en: 'I sell vegetables in the market. Two days ago I went to the licence counter to renew my vending licence. The clerk said the file will move faster if I give two thousand rupees. I said I do not have that much. He said come back when you have it. I did not pay. I have the receipt from last year.',
  hi: 'मैं बाज़ार में सब्ज़ी बेचती हूँ। दो दिन पहले मैं लाइसेंस काउंटर पर अपना विक्रय लाइसेंस नवीकरण कराने गई थी। क्लर्क ने कहा कि दो हज़ार रुपये देने पर फ़ाइल जल्दी आगे बढ़ेगी। मैंने कहा कि मेरे पास इतने नहीं हैं। उसने कहा कि जब हों तब आ जाओ। मैंने पैसे नहीं दिए। मेरे पास पिछले साल की रसीद है।',
  segments: [
    { t: '00:00', en: 'I sell vegetables in the market.', hi: 'मैं बाज़ार में सब्ज़ी बेचती हूँ।' },
    { t: '00:06', en: 'Two days ago I went to the licence counter to renew my vending licence.', hi: 'दो दिन पहले मैं लाइसेंस काउंटर पर अपना विक्रय लाइसेंस नवीकरण कराने गई थी।' },
    { t: '00:14', en: 'The clerk said the file will move faster if I give two thousand rupees.', hi: 'क्लर्क ने कहा कि दो हज़ार रुपये देने पर फ़ाइल जल्दी आगे बढ़ेगी।' },
    { t: '00:23', en: 'I said I do not have that much. He said come back when you have it.', hi: 'मैंने कहा कि मेरे पास इतने नहीं हैं। उसने कहा कि जब हों तब आ जाओ।' },
    { t: '00:32', en: 'I did not pay.', hi: 'मैंने पैसे नहीं दिए।' },
    { t: '00:35', en: 'I have the receipt from last year.', hi: 'मेरे पास पिछले साल की रसीद है।' },
  ],
}

export const DEMO_DRAFT = {
  demo: true,
  fields: {
    what_happened: {
      en: 'The complainant says the licence clerk asked for 2,000 rupees to make her vending licence renewal move faster. She says she did not pay.',
      hi: 'शिकायतकर्ता के अनुसार लाइसेंस क्लर्क ने विक्रय लाइसेंस नवीकरण जल्दी कराने के लिए 2,000 रुपये मांगे। उनका कहना है कि उन्होंने पैसे नहीं दिए।',
      source: { kind: 'quote', t: '00:14', en: '"The clerk said the file will move faster if I give two thousand rupees."', hi: '"क्लर्क ने कहा कि दो हज़ार रुपये देने पर फ़ाइल जल्दी आगे बढ़ेगी।"' },
    },
    when: {
      en: 'Two days before the recording. The exact time is not stated.',
      hi: 'रिकॉर्डिंग से दो दिन पहले। सही समय नहीं बताया गया।',
      source: { kind: 'quote', t: '00:06', en: '"Two days ago I went to the licence counter..."', hi: '"दो दिन पहले मैं लाइसेंस काउंटर पर गई थी..."' },
    },
    where: {
      en: 'The licence counter at the market where she sells vegetables. The building name is not stated.',
      hi: 'बाज़ार का लाइसेंस काउंटर जहाँ वे सब्ज़ी बेचती हैं। भवन का नाम नहीं बताया गया।',
      source: { kind: 'quote', t: '00:06', en: '"...I went to the licence counter..."', hi: '"...मैं लाइसेंस काउंटर पर गई थी..."' },
      needs: 'office',
    },
    who: {
      en: 'A clerk at the licence counter. No name was given in the recording.',
      hi: 'लाइसेंस काउंटर का एक क्लर्क। रिकॉर्डिंग में नाम नहीं बताया गया।',
      source: { kind: 'quote', t: '00:14', en: '"The clerk said..."', hi: '"क्लर्क ने कहा..."' },
    },
    what_was_asked: {
      en: '2,000 rupees, according to the recording. In exchange, the file would move faster.',
      hi: 'रिकॉर्डिंग के अनुसार 2,000 रुपये। बदले में फ़ाइल जल्दी आगे बढ़ेगी।',
      source: { kind: 'quote', t: '00:14', en: '"...if I give two thousand rupees."', hi: '"...दो हज़ार रुपये देने पर..."' },
    },
    evidence: {
      en: 'One receipt from last year, mentioned in the recording. No other evidence is stated.',
      hi: 'पिछले साल की एक रसीद, जिसका रिकॉर्डिंग में ज़िक्र है। और कोई सबूत नहीं बताया गया।',
      source: { kind: 'quote', t: '00:35', en: '"I have the receipt from last year."', hi: '"मेरे पास पिछले साल की रसीद है।"' },
    },
    timeline: {
      en: 'Two days ago: visited the licence counter and was asked for 2,000 rupees. Then: no payment made. Today: this recording.',
      hi: 'दो दिन पहले: लाइसेंस काउंटर पर गए और 2,000 रुपये मांगे गए। फिर: कोई भुगतान नहीं किया। आज: यह रिकॉर्डिंग।',
      source: { kind: 'quote', t: '00:06', en: '"Two days ago I went to the licence counter..."', hi: '"दो दिन पहले मैं लाइसेंस काउंटर पर गई थी..."' },
    },
  },
  notes: {
    en: 'Demo result. Prepared for the sample recording because no AI key is set. The recording was not actually transcribed.',
    hi: 'डेमो परिणाम। कोई एआई कुंजी सेट नहीं है, इसलिए नमूना रिकॉर्डिंग के लिए तैयार परिणाम। रिकॉर्डिंग वास्तव में ट्रांसक्राइब नहीं की गई।',
  },
}
