export type MockInterviewTrack = 'technicals' | 'behaviorals' | 'both';
export type MockInterviewDifficulty = 'core' | 'common' | 'advanced';
export const ALL_DIFFICULTIES: MockInterviewDifficulty[] = ['core', 'common', 'advanced'];

export const TECHNICAL_CATEGORIES = [
  'Accounting & Financial Statements',
  'Valuation Fundamentals',
  'Equity Value vs Enterprise Value',
  'DCF',
  'M&A',
  'LBO',
] as const;

export const BEHAVIORAL_CATEGORIES = [
  'Story & Motivation',
  'Leadership & Initiative',
  'Teamwork & Conflict',
  'Failure & Self-Awareness',
  'Work Ethic & Pressure',
  'Communication & Presence',
  'Brain Teasers & Problem Solving',
] as const;

export type TechnicalCategory = typeof TECHNICAL_CATEGORIES[number];
export type BehavioralCategory = typeof BEHAVIORAL_CATEGORIES[number];

export interface MockInterviewSession {
  id: string;
  user_id: string;
  track: MockInterviewTrack;
  category: string;
  difficulty: MockInterviewDifficulty;
  session_length_minutes: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface MockInterviewQuestion {
  id: string;
  session_id: string;
  question_text: string;
  order_index: number;
  created_at: string;
}

export interface MockInterviewAnswer {
  id: string;
  session_id: string;
  question_id: string;
  recording_url: string | null;
  transcript: string | null;
  score_overall: number | null;
  score_breakdown_json: Record<string, unknown> | null;
  feedback: string | null;
  suggested_answer: string | null;
  created_at: string;
}

export interface ScoreBreakdown {
  structure: number;
  clarity: number;
  specificity: number;
  confidence: number;
  conciseness: number;
}

export type AnswerState = 'idle' | 'recording' | 'processing' | 'scored';

// Fallback questions for each category
export const FALLBACK_QUESTIONS: Record<string, string[]> = {
  'Accounting & Financial Statements': [
    'Walk me through the three financial statements.',
    'How do the three financial statements link together?',
    'What happens to each financial statement if depreciation increases by $10?',
    'What is working capital and why does it matter?',
    'Explain the difference between cash and accrual accounting.',
    'What is EBITDA and why is it important?',
    'How does an inventory write-down affect the financial statements?',
    'What is deferred revenue and how is it accounted for?',
    'Explain goodwill and how it arises.',
    'What happens when a company issues $100 in stock to acquire another company?',
  ],
  'Valuation Fundamentals': [
    'What are the main valuation methodologies?',
    'When would you use a DCF vs. comparable companies analysis?',
    'What are trading multiples and transaction multiples?',
    'How do you select comparable companies?',
    'What is a football field valuation chart?',
    'How do you handle negative earnings in valuation?',
    'What is a sum-of-the-parts valuation?',
    'Why might one valuation methodology give a higher value than another?',
    'How do you value a pre-revenue startup?',
    'What is a Leveraged Buyout (LBO) and how does it differ from a DCF?',
  ],
  'Equity Value vs Enterprise Value': [
    'What is the difference between equity value and enterprise value?',
    'How do you calculate enterprise value?',
    'Why do we add debt when calculating enterprise value?',
    'Why do we subtract cash when calculating enterprise value?',
    'What are some common enterprise value multiples?',
    'When would you use equity value vs. enterprise value?',
    'How do preferred stock and minority interest affect enterprise value?',
    'What is the enterprise value formula?',
    'Can enterprise value be negative? Explain.',
    'How do operating leases affect enterprise value?',
  ],
  'DCF': [
    'Walk me through a DCF.',
    'What is the discount rate in a DCF?',
    'How do you calculate WACC?',
    'What is terminal value and how do you calculate it?',
    'What are the pros and cons of a DCF?',
    'How do you project free cash flows?',
    'What is unlevered free cash flow?',
    'What growth rate would you use for terminal value?',
    'How do you handle a negative terminal value?',
    'What is a sensitivity analysis in a DCF context?',
  ],
  'M&A': [
    'Why would a company acquire another company?',
    'What are synergies and how do you value them?',
    'What is accretion/dilution analysis?',
    'Walk me through a merger model.',
    'What is goodwill in an M&A context?',
    'What are the different types of M&A transactions?',
    'How do you determine the purchase price in an acquisition?',
    'What is a stock deal vs. a cash deal?',
    'What due diligence would you conduct before an acquisition?',
    'What is a hostile takeover?',
  ],
  'LBO': [
    'Walk me through an LBO.',
    'What makes a good LBO candidate?',
    'How do private equity firms create value?',
    'What is a dividend recapitalization?',
    'How do you calculate returns in an LBO (IRR, MOIC)?',
    'What are the sources and uses of funds in an LBO?',
    'What is the typical debt structure in an LBO?',
    'How does leverage increase returns in an LBO?',
    'What exit strategies do PE firms use?',
    'What are management incentives in an LBO?',
  ],
  'Story & Motivation': [
    'Tell me about yourself.',
    'Why investment banking?',
    'Why this firm specifically?',
    'What do you know about our recent deals?',
    'Where do you see yourself in five years?',
    'Why should we hire you over other candidates?',
    'What are your greatest strengths?',
    'What motivates you to work long hours?',
    'Describe your ideal work environment.',
    'How did you become interested in finance?',
  ],
  'Leadership & Initiative': [
    'Tell me about a time you demonstrated leadership.',
    'Describe a situation where you took initiative.',
    'Tell me about a time you went above and beyond.',
    'How have you influenced others without formal authority?',
    'Describe a time you had to make a difficult decision.',
    'Tell me about a project you led from start to finish.',
    'How do you motivate others in a team setting?',
    'Describe a situation where you identified a problem and solved it proactively.',
    'Tell me about a time you stepped up when no one else would.',
    'How do you handle being put in charge of people older or more experienced than you?',
  ],
  'Teamwork & Conflict': [
    'Tell me about a time you worked on a team.',
    'Describe a conflict you had with a teammate and how you resolved it.',
    'How do you handle disagreements with colleagues?',
    'Tell me about a time you had to work with a difficult person.',
    'How do you contribute to a team\'s success?',
    'Describe a time you received critical feedback from a teammate.',
    'Tell me about a time you had to compromise.',
    'How do you handle situations where team members aren\'t pulling their weight?',
    'Describe your experience working in diverse teams.',
    'Tell me about a time you helped a struggling teammate.',
  ],
  'Failure & Self-Awareness': [
    'Tell me about a time you failed.',
    'What is your greatest weakness?',
    'Describe a mistake you made and what you learned from it.',
    'Tell me about a time you received negative feedback.',
    'How do you handle rejection?',
    'What would you change about yourself?',
    'Tell me about a goal you didn\'t achieve.',
    'Describe a time you had to admit you were wrong.',
    'What\'s the biggest professional risk you\'ve taken?',
    'How do you handle stress and pressure?',
  ],
  'Work Ethic & Pressure': [
    'Tell me about a time you worked under a tight deadline.',
    'How do you prioritize multiple competing tasks?',
    'Describe a time you had to work long hours to complete a project.',
    'Tell me about a time you exceeded expectations.',
    'How do you stay organized when managing multiple projects?',
    'Describe your most challenging work experience.',
    'How do you handle last-minute changes to a project?',
    'Tell me about a time you had to sacrifice personal time for work.',
    'How do you maintain quality when working under pressure?',
    'Describe a situation where you had to learn something quickly.',
  ],
  'Communication & Presence': [
    'Tell me about a time you had to present to senior executives.',
    'How do you explain complex concepts to non-experts?',
    'Describe a time you had to deliver bad news.',
    'Tell me about a time you persuaded someone to see your point of view.',
    'How do you build rapport with clients?',
    'Describe your communication style.',
    'Tell me about a time you had to adapt your communication for different audiences.',
    'How do you handle public speaking?',
    'Describe a time you had to give difficult feedback.',
    'Tell me about a presentation or pitch you\'re proud of.',
  ],
  'Brain Teasers & Problem Solving': [
    'How many golf balls fit in a school bus?',
    'How would you value a hot dog stand?',
    'If you were a brand, what would you be and why?',
    'How many gas stations are there in the United States?',
    'Estimate the market size for baby diapers in the US.',
    'How would you price a new product entering the market?',
    'If you had to cut 10% of a company\'s costs, where would you start?',
    'How would you turn around a struggling retail chain?',
    'What would you do with $1 million to invest?',
    'How do you approach a problem you\'ve never seen before?',
  ],
};
