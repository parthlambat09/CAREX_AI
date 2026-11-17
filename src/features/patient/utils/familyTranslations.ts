export type FamilyLanguage = 'en' | 'hi' | 'mr';

export interface FamilyTranslationKeys {
  familyPortal: string;
  viewing: string;
  signOut: string;
  dailyRecoverySummary: string;
  location: string;
  attendingPhysician: string;
  primaryNurse: string;
  overallRecoveryIndex: string;
  steady: string;
  recoveryIndexDescription: string;
  vitalsStability: string;
  normalRange: string;
  vitalsStabilityDescription: string;
  mobilityRehab: string;
  complicationRisk: string;
  targetRange: string;
  complicationRiskDescription: string;
  recommendedHospitalTransfer: string;
  highRiskAlert: string;
  transferRationale: string;
  icuBedsOpen: string;
  matchingSpecialtyUnits: string;
  educationalDisclaimer: string;
  recoveryTrajectoryTitle: string;
  recoveryTrajectorySubtitle: string;
  recordedProgress: string;
  forecastedPathway: string;
  vitalsStabilityTitle: string;
  vitalsStabilitySubtitle: string;
  complicationRiskTitle: string;
  complicationRiskSubtitle: string;
  dailyProgressLogTitle: string;
  forecastedClinicalGoal: string;
  milestonesHighlighted: string;
  hourlyDoctorFeedTitle: string;
  generateTestUpdate: string;
  nextStepsVisitingTitle: string;
  nextAnticipatedStep: string;
  icuVisitingHours: string;
  careLiaisonPhone: string;
  liaisonInstruction: string;
  plainLanguageDisclaimer: string;
  askAssistant: string;
  askingAbout: string;
  chatPlaceholder: string;
  thinking: string;
  chatDisclaimer: string;
  languageLabel: string;
}

export const FAMILY_TRANSLATIONS: Record<FamilyLanguage, FamilyTranslationKeys> = {
  en: {
    familyPortal: 'Family Recovery Portal',
    viewing: 'Viewing',
    signOut: 'Sign Out',
    dailyRecoverySummary: 'Daily Recovery Summary',
    location: 'Location',
    attendingPhysician: 'Attending',
    primaryNurse: 'Primary Nurse',
    overallRecoveryIndex: 'Overall Recovery Index',
    steady: 'Steady (+9% 48h)',
    recoveryIndexDescription: 'Composite score of heart rhythm, oxygen independence, and mobility.',
    vitalsStability: 'Vitals Stability',
    normalRange: 'Normal Range',
    vitalsStabilityDescription: 'Blood pressure and oxygen levels holding steady without intervention.',
    mobilityRehab: 'Mobility & Rehabilitation',
    complicationRisk: 'Complication Risk',
    targetRange: 'Target Range',
    complicationRiskDescription: 'AI complication and sepsis risk has safely declined to low caution bounds.',
    recommendedHospitalTransfer: 'Recommended Hospital Transfer',
    highRiskAlert: 'HIGH RISK ALERT',
    transferRationale: 'Patient deterioration risk index crossed elevated threshold (≥65%). Alternate apex hospitals with matching specialty units and available ICU beds are listed below for referral planning.',
    icuBedsOpen: 'ICU Beds Open',
    matchingSpecialtyUnits: 'Matching Specialty Units',
    educationalDisclaimer: 'Educational simulation decision support — non-binding referral recommendation system.',
    recoveryTrajectoryTitle: 'Recovery Trajectory & Forecasted Projection',
    recoveryTrajectorySubtitle: 'Solid teal line shows recorded clinical progress; dashed blue line illustrates projected recovery pathway.',
    recordedProgress: 'Recorded Progress',
    forecastedPathway: 'Forecasted Pathway',
    vitalsStabilityTitle: 'Vital Signs Stability Index',
    vitalsStabilitySubtitle: 'Steadily climbing score measuring natural blood pressure, respiration, and body temperature stabilization.',
    complicationRiskTitle: 'Complication Risk Trajectory',
    complicationRiskSubtitle: 'Deterioration score trending down from post-op high into safe convalescence target zone (<25%).',
    dailyProgressLogTitle: 'Daily Progress Log & Doctor Updates',
    forecastedClinicalGoal: 'Forecasted Clinical Goal',
    milestonesHighlighted: 'Milestones Highlighted',
    hourlyDoctorFeedTitle: 'Hourly Doctor Progress Feed (60m Delay Queue)',
    generateTestUpdate: 'Generate Test Update (Dev Mode)',
    nextStepsVisitingTitle: 'Next Steps & Visiting Info',
    nextAnticipatedStep: 'Next Anticipated Step',
    icuVisitingHours: 'ICU Visiting Hours',
    careLiaisonPhone: 'Care Station Phone Liaison',
    liaisonInstruction: 'Family members may call the unit coordinator at any time for updates.',
    plainLanguageDisclaimer: 'All graphs and summaries are translated into plain language for loved ones. Educational simulation tool — not a diagnostic device.',
    askAssistant: 'Recovery AI Assistant',
    askingAbout: 'Asking about',
    chatPlaceholder: 'Ask about recovery data...',
    thinking: 'Thinking...',
    chatDisclaimer: 'Educational simulation assistant. Direct clinical queries should be confirmed with attending staff.',
    languageLabel: 'Language',
  },
  hi: {
    familyPortal: 'परिवार रिकवरी पोर्टल',
    viewing: 'देख रहे हैं',
    signOut: 'साइन आउट',
    dailyRecoverySummary: 'दैनिक रिकवरी सारांश',
    location: 'स्थान',
    attendingPhysician: 'मुख्य चिकित्सक',
    primaryNurse: 'प्राथमिक नर्स',
    overallRecoveryIndex: 'कुल रिकवरी इंडेक्स',
    steady: 'स्थिर (+9% 48 घंटे में)',
    recoveryIndexDescription: 'हृदय गति, ऑक्सीजन निर्भरता और गतिशीलता का संयुक्त स्कोर।',
    vitalsStability: 'वाइटल्स स्थिरता',
    normalRange: 'सामान्य सीमा',
    vitalsStabilityDescription: 'रक्तचाप और ऑक्सीजन का स्तर बिना किसी हस्तक्षेप के स्थिर बना हुआ है।',
    mobilityRehab: 'गतिशीलता और पुनर्वास',
    complicationRisk: 'जटिलता का जोखिम',
    targetRange: 'लक्ष्य सीमा',
    complicationRiskDescription: 'एआई जटिलता और सेप्सिस जोखिम सुरक्षित रूप से कम चेतावनी स्तर पर आ गया है।',
    recommendedHospitalTransfer: 'अनुशंसित अस्पताल स्थानांतरण',
    highRiskAlert: 'उच्च जोखिम चेतावनी',
    transferRationale: 'मरीज का जोखिम इंडेक्स उन्नत सीमा (≥65%) पार कर गया है। विशेषज्ञ इकाइयों और उपलब्ध आईसीयू बेड वाले अनुशंसित अस्पताल नीचे सूचीबद्ध हैं।',
    icuBedsOpen: 'आईसीयू बेड उपलब्ध',
    matchingSpecialtyUnits: 'मिलान वाली विशेषज्ञ इकाइयां',
    educationalDisclaimer: 'शैक्षणिक सिमुलेशन निर्णय सहायता — गैर-बाध्यकारी रेफरल अनुशंसा प्रणाली।',
    recoveryTrajectoryTitle: 'रिकवरी पथ और अनुमानित प्रगति',
    recoveryTrajectorySubtitle: 'ठोस हरी रेखा रिकॉर्ड की गई प्रगति दर्शाती है; बिंदीदार नीली रेखा अनुमानित मार्ग दर्शाती है।',
    recordedProgress: 'दर्ज प्रगति',
    forecastedPathway: 'अनुमानित मार्ग',
    vitalsStabilityTitle: 'महत्वपूर्ण लक्षण (वाइटल्स) स्थिरता सूचकांक',
    vitalsStabilitySubtitle: 'रक्तचाप, श्वसन और शरीर के तापमान के स्थिरीकरण को मापने वाला बढ़ता हुआ स्कोर।',
    complicationRiskTitle: 'जटिलता जोखिम वक्र',
    complicationRiskSubtitle: 'ऑपरेशन के बाद के उच्च स्तर से सुरक्षित रिकवरी लक्ष्य क्षेत्र (<25%) में नीचे की ओर घटता जोखिम।',
    dailyProgressLogTitle: 'दैनिक प्रगति लॉग और डॉक्टर अपडेट',
    forecastedClinicalGoal: 'अनुमानित क्लिनिकल लक्ष्य',
    milestonesHighlighted: 'प्रमुख उपलब्धियां (माइलस्टोन)',
    hourlyDoctorFeedTitle: 'प्रति घंटे डॉक्टर प्रगति फ़ीड (60 मिनट कतार)',
    generateTestUpdate: 'परीक्षण अपडेट बनाएं (डेव मोड)',
    nextStepsVisitingTitle: 'अगले कदम और मुलाकात की जानकारी',
    nextAnticipatedStep: 'संभावित अगला कदम',
    icuVisitingHours: 'आईसीयू मुलाकात का समय',
    careLiaisonPhone: 'केयर स्टेशन फोन संपर्क',
    liaisonInstruction: 'परिवार के सदस्य अपडेट के लिए किसी भी समय यूनिट समन्वयक को कॉल कर सकते हैं।',
    plainLanguageDisclaimer: 'सभी ग्राफ और सारांश परिजनों के लिए सरल भाषा में लिखे गए हैं। यह एक शैक्षणिक सिमुलेशन टूल है।',
    askAssistant: 'रिकवरी एआई सहायक',
    askingAbout: 'के बारे में पूछ रहे हैं',
    chatPlaceholder: 'रिकवरी डेटा के बारे में पूछें...',
    thinking: 'सोच रहा है...',
    chatDisclaimer: 'शैक्षणिक सिमुलेशन सहायक। सीधे चिकित्सा प्रश्नों की पुष्टि उपस्थित डॉक्टर से की जानी चाहिए।',
    languageLabel: 'भाषा',
  },
  mr: {
    familyPortal: 'कुटुंब रिकव्हरी पोर्टल',
    viewing: 'पाहत आहात',
    signOut: 'साइन आउट',
    dailyRecoverySummary: 'दैनिक रिकव्हरी सारांश',
    location: 'स्थान',
    attendingPhysician: 'प्रमुख डॉक्टर',
    primaryNurse: 'प्राथमिक परिचारिका (नर्स)',
    overallRecoveryIndex: 'एकूण रिकव्हरी निर्देशांक',
    steady: 'स्थिर (+9% 48 तासांत)',
    recoveryIndexDescription: 'हृदयाची गती, ऑक्सिजन स्वांतत्र्य आणि हालचाल यांचा एकत्रित स्कोअर.',
    vitalsStability: 'वाइटल्स स्थिरता',
    normalRange: 'सामान्य श्रेणी',
    vitalsStabilityDescription: 'रक्तदाब आणि ऑक्सिजन पातळी कोणत्याही हस्तक्षेपाशिवाय स्थिर आहे.',
    mobilityRehab: 'हालचाल आणि पुनर्वसन',
    complicationRisk: 'गुंतागुंतीचा धोका',
    targetRange: 'लक्ष्य श्रेणी',
    complicationRiskDescription: 'एआय गुंतागुंत आणि सेप्सिस धोका सुरक्षितपणे कमी पातळीवर आला आहे.',
    recommendedHospitalTransfer: 'अन्वेषित रुग्णालय हस्तांतरण',
    highRiskAlert: 'उच्च धोक्याची सूचना',
    transferRationale: 'रुग्णाचा धोका निर्देशांक उच्च श्रेणी (≥65%) ओलांडला आहे. जुळणाऱ्या तज्ज्ञ विभागांसह उपलब्ध आयसीयू बेड असलेली रुग्णालये खाली सूचीबद्ध आहेत.',
    icuBedsOpen: 'आयसीयू बेड उपलब्ध',
    matchingSpecialtyUnits: 'जुळणारे तज्ज्ञ विभाग',
    educationalDisclaimer: 'शैक्षणिक सिम्युलेशन निर्णय सहाय्य — गैर-बंधनकारक संदर्भ शिफारस प्रणाली.',
    recoveryTrajectoryTitle: 'रिकव्हरी मार्ग आणि अंदाजित प्रगती',
    recoveryTrajectorySubtitle: 'सलग हिरवी रेषा नोंदवलेली प्रगती दाखवते; तुटक निळी रेषा अंदाजित मार्ग दाखवते.',
    recordedProgress: 'नोंदवलेली प्रगती',
    forecastedPathway: 'अंदाजित मार्ग',
    vitalsStabilityTitle: 'महत्त्वाचे शारीरिक संकेत (वाइटल्स) स्थिरता निर्देशांक',
    vitalsStabilitySubtitle: 'रक्तदाब, श्वसन आणि शरीराचे तापमान यांच्या स्थिरतेचे वाढणारे गुण.',
    complicationRiskTitle: 'गुंतागुंत धोका वक्र',
    complicationRiskSubtitle: 'शस्त्रक्रियेनंतरच्या उच्च स्तरावरून सुरक्षित रिकव्हरी झोन (<25%) कडे जाणारा घटता धोका.',
    dailyProgressLogTitle: 'दैनिक प्रगती नोंद आणि डॉक्टर अपडेट्स',
    forecastedClinicalGoal: 'अंदाजित वैद्यकीय ध्येय',
    milestonesHighlighted: 'महत्त्वाचे टप्पे (माइलस्टोन्स)',
    hourlyDoctorFeedTitle: 'दर तासाचा डॉक्टर प्रगती फीड (60 मिनिटे रांग)',
    generateTestUpdate: 'चाचणी अपडेट तयार करा (डेव्ह मोड)',
    nextStepsVisitingTitle: 'पुढील टप्पे आणि भेटीची माहिती',
    nextAnticipatedStep: 'अपेक्षित पुढील टप्पा',
    icuVisitingHours: 'आयसीयू भेटीची वेळ',
    careLiaisonPhone: 'केयर स्टेशन फोन संपर्क',
    liaisonInstruction: 'कुटुंबातील सदस्य माहितीसाठी कोणत्याही वेळी युनिट समन्वयकाला फोन करू शकतात.',
    plainLanguageDisclaimer: 'सर्व आलेख आणि सारांश नातेवाईकांसाठी सोप्या भाषेत तयार केले आहेत. हे शैक्षणिक सिम्युलेशन साधन आहे.',
    askAssistant: 'रिकव्हरी एआय सहाय्यक',
    askingAbout: 'यांच्याबद्दल विचारत आहात',
    chatPlaceholder: 'रिकव्हरीबद्दल विचारणा करा...',
    thinking: 'विचार करत आहे...',
    chatDisclaimer: 'शैक्षणिक सिम्युलेशन सहाय्यक. थेट वैद्यकीय शंकांसाठी कार्यरत डॉक्टरांशी संपर्क साधावा.',
    languageLabel: 'भाषा',
  },
};
