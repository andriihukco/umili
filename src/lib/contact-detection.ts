// Contact detection patterns and utilities
export interface ContactMatch {
  type: 'email' | 'phone' | 'telegram' | 'instagram' | 'whatsapp' | 'skype' | 'discord' | 'linkedin' | 'website';
  value: string;
  start: number;
  end: number;
}

// Regex patterns for detecting contact information
const CONTACT_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+?[1-9]\d{1,14})|(\(\d{3}\)\s?\d{3}-\d{4})|(\d{3}-\d{3}-\d{4})|(\d{10})/g,
  telegram: /(@[a-zA-Z0-9_]{5,32})|(телеграм|telegram)\s*:?\s*@?[a-zA-Z0-9_]{5,32}/gi,
  instagram: /(@[a-zA-Z0-9_.]{1,30})|(інстаграм|instagram)\s*:?\s*@?[a-zA-Z0-9_.]{1,30}/gi,
  whatsapp: /(whatsapp|wa\.me|вацап)\s*:?\s*(\+?[1-9]\d{1,14})/gi,
  skype: /(skype|скайп)\s*:?\s*[a-zA-Z0-9_.-]+/gi,
  discord: /(discord|дискорд|discord\.gg)\s*:?\s*[a-zA-Z0-9_.-]+/gi,
  linkedin: /(linkedin\.com\/in\/|linkedin\.com\/company\/|лінкедін|linkedin)\s*:?\s*[a-zA-Z0-9_.-]+/gi,
  website: /(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/g,
};

// Contextual patterns for better detection
const CONTEXTUAL_PATTERNS = {
  email: /(пошта|email|електронна|мейл|mail)\s*:?\s*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/gi,
  phone: /(телефон|phone|номер|мобільний|мобильный)\s*:?\s*(\+?[1-9]\d{1,14})/gi,
  telegram: /(телеграм|telegram|тг|tg)\s*:?\s*@?[a-zA-Z0-9_]{5,32}/gi,
  instagram: /(інстаграм|instagram|інста|insta)\s*:?\s*@?[a-zA-Z0-9_.]{1,30}/gi,
  whatsapp: /(вацап|whatsapp|вап|wap)\s*:?\s*(\+?[1-9]\d{1,14})/gi,
  skype: /(скайп|skype)\s*:?\s*[a-zA-Z0-9_.-]+/gi,
  discord: /(дискорд|discord)\s*:?\s*[a-zA-Z0-9_.-]+/gi,
  linkedin: /(лінкедін|linkedin|лінк|link)\s*:?\s*[a-zA-Z0-9_.-]+/gi,
};

// Platform-specific patterns
const PLATFORM_PATTERNS = {
  telegram: /@[a-zA-Z0-9_]{5,32}/g,
  instagram: /@[a-zA-Z0-9_.]{1,30}/g,
  whatsapp: /(whatsapp|wa\.me)\s*:?\s*(\+?[1-9]\d{1,14})/gi,
  skype: /(skype|skype:)\s*:?\s*[a-zA-Z0-9_.-]+/gi,
  discord: /(discord|discord\.gg)\s*:?\s*[a-zA-Z0-9_.-]+/gi,
  linkedin: /(linkedin\.com\/in\/|linkedin\.com\/company\/)[a-zA-Z0-9_.-]+/gi,
};

/**
 * Detects contact information in a text message
 */
export function detectContactDetails(text: string): ContactMatch[] {
  const matches: ContactMatch[] = [];
  
  // Check standard patterns
  Object.entries(CONTACT_PATTERNS).forEach(([type, pattern]) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        type: type as ContactMatch['type'],
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  });
  
  // Check contextual patterns
  Object.entries(CONTEXTUAL_PATTERNS).forEach(([type, pattern]) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        type: type as ContactMatch['type'],
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  });
  
  // Remove duplicates and sort by position
  const uniqueMatches = matches.filter((match, index, self) => 
    index === self.findIndex(m => m.start === match.start && m.end === match.end)
  );
  
  return uniqueMatches.sort((a, b) => a.start - b.start);
}

/**
 * Checks if text contains any contact details
 */
export function hasContactDetails(text: string): boolean {
  return detectContactDetails(text).length > 0;
}

/**
 * Sanitizes text by replacing contact details with blurred placeholders
 */
export function sanitizeContactDetails(text: string): string {
  const matches = detectContactDetails(text);
  let sanitized = text;
  
  // Replace from end to start to maintain positions
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const placeholder = getContactPlaceholder(match.type);
    sanitized = sanitized.substring(0, match.start) + 
                placeholder + 
                sanitized.substring(match.end);
  }
  
  return sanitized;
}

/**
 * Gets appropriate placeholder for contact type
 */
function getContactPlaceholder(type: ContactMatch['type']): string {
  const placeholders = {
    email: '***@***.***',
    phone: '***-***-****',
    telegram: '@*****',
    instagram: '@*****',
    whatsapp: 'WhatsApp: *****',
    skype: 'Skype: *****',
    discord: 'Discord: *****',
    linkedin: 'LinkedIn: *****',
    website: '***.***',
  };
  
  return placeholders[type];
}

/**
 * Gets warning message for detected contact types
 */
export function getContactWarningMessage(contactTypes: ContactMatch['type'][]): string {
  const uniqueTypes = [...new Set(contactTypes)];
  
  if (uniqueTypes.length === 1) {
    const type = uniqueTypes[0];
    switch (type) {
      case 'email':
        return 'Обмін електронною поштою поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
      case 'phone':
        return 'Обмін номером телефону поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
      case 'telegram':
        return 'Обмін Telegram контактами поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
      case 'instagram':
        return 'Обмін Instagram контактами поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
      case 'whatsapp':
        return 'Обмін WhatsApp контактами поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
      case 'skype':
        return 'Обмін Skype контактами поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
      case 'discord':
        return 'Обмін Discord контактами поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
      case 'linkedin':
        return 'Обмін LinkedIn контактами поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
      case 'website':
        return 'Обмін веб-сайтами поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
      default:
        return 'Обмін контактними даними поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
    }
  } else {
    return 'Обмін контактними даними поза платформою може призвести до втрати часу та грошей. Рекомендуємо вести спілкування через нашу платформу.';
  }
}
