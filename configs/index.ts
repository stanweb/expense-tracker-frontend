export const NEXT_PUBLIC_SERVICES_API_BASE_URL = process.env.NEXT_PUBLIC_SERVICES_API_BASE_URL || 'https://backend.stanspace.uk/api'
export const NEXT_PUBLIC_AI_API_BASE_URL= process.env.NEXT_PUBLIC_AI_API_BASE_URL || 'http://localhost:3000/api'
export const NEXT_PUBLIC_BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'https://backend.stanspace.uk/api'

// Server-only (non-NEXT_PUBLIC_) — read at runtime on the Node.js side.
// Use these for calls that originate from API routes / server components so
// Docker deployments can route through the internal network (e.g. http://backend:8080/api)
// without rebuilding the client bundle.
export const INTERNAL_SERVICES_API_BASE_URL = process.env.INTERNAL_SERVICES_API_BASE_URL || process.env.NEXT_PUBLIC_SERVICES_API_BASE_URL || 'https://backend.stanspace.uk/api'
export const INTERNAL_AI_API_BASE_URL = process.env.INTERNAL_AI_API_BASE_URL || process.env.NEXT_PUBLIC_AI_API_BASE_URL || 'http://localhost:3000/api'
export const INTERNAL_BACKEND_API_BASE_URL = process.env.INTERNAL_BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'https://backend.stanspace.uk/api'

export const PDF_STATEMENT_PROMPT_GIST_URL = 'https://gist.githubusercontent.com/stanweb/8c471be21d2cd6c86ecc8014a832a8c5/raw/pdfExtractPrompt.txt'
export const SMS_STATEMENT_PROMPT_GIST_URL = 'https://gist.githubusercontent.com/stanweb/bc9fc9e83d675b95ac77fe032be405e2/raw/smsExtractPrompt.txt'
export const ICON_PROMPT_GIST_URL = 'https://gist.githubusercontent.com/stanweb/4554fb546cdc69e17360bb10e3b3cfff/raw/iconPrompt.txt'
export const CATEGORY_PROMPT_GIST_URL = 'https://gist.githubusercontent.com/stanweb/6a618d9f599e5f81cfc772918a5fa654/raw/categoryPrompt.txt'
export const BUDGET_PROMPT_GIST_URL = 'https://gist.githubusercontent.com/stanweb/0dc2dfb01a207130156e8d2ea6dcc378/raw/budgetPrompt.txt'
export const MOBILE_RAW_TEXT_PROMPT_GIST_URL = 'https://gist.githubusercontent.com/stanweb/4ebfe2d8b323c803769f4569d00f73a1/raw/mobileSMSPrompt.txt'

export const INVESTMENT_TRANSACTION_EXTRACTION_PROMPT_GIST_URL = 'https://gist.githubusercontent.com/stanweb/5c32be2328dc9c5653fd42bdfbbddced/raw/investment-extraction.txt'

export const APPROVED_SMS_SENDERS_GIST_URL = 'https://gist.githubusercontent.com/stanweb/650f5a05f0abd6fa0c0981bb8193ae8f/raw/approved-senders.json'

export const theme = {
  colors: {
    primary: {
      light: '#6366F1', // Indigo 500
      dark: '#818CF8', // Indigo 400
      gradient: ['#6366F1', '#A855F7'], // Indigo to Violet
    },
    background: {
      light: '#F9FAFB', // Gray 50
      dark: '#0F172A', // Slate 900
      cardLight: '#FFFFFF',
      cardDark: '#1E293B', // Slate 800
    },
    text: {
      primaryLight: '#111827', // Gray 900
      primaryDark: '#FFFFFF',
      secondaryLight: '#6B7280', // Gray 500
      secondaryDark: '#94A3B8', // Slate 400
    },
    status: {
      success: '#10B981', // Emerald 500
      error: '#EF4444', // Red 500
      warning: '#F59E0B', // Amber 500
      info: '#6366F1',
    },
    border: {
      light: '#F3F4F6', // Gray 100
      dark: '#334155', // Slate 700
    },
  },
  spacing: {
    xs: 2,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    fontFamily: 'Inter-Regular', // Placeholder for custom font
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
  },
};

export type Theme = typeof theme;
