import { Contact } from '../types';

/**
 * Parses Spintax like {Hi|Hello|Hey} and picks a random value.
 */
export const parseSpintax = (text: string): string => {
  return text.replace(/\{([^{}]+|[^{}]*)\}/g, (match, p1) => {
    if (p1.includes('|')) {
      const parts = p1.split('|');
      return parts[Math.floor(Math.random() * parts.length)];
    }
    return match;
  });
};

/**
 * Simple conditional parser: {if field == 'value'}...{else}...{endif}
 */
export const parseConditionals = (text: string, contact: Contact): string => {
  const regex = /\{if\s+(\w+)\s*(==|!=)\s*['"]([^'"]+)['"]\}([\s\S]*?)(?:\{else\}([\s\S]*?))?\{endif\}/g;
  
  return text.replace(regex, (match, field, op, value, ifPart, elsePart = '') => {
    const contactValue = String(contact[field] || '').toLowerCase();
    const compareValue = String(value).toLowerCase();
    
    const condition = op === '==' ? contactValue === compareValue : contactValue !== compareValue;
    return condition ? ifPart : elsePart;
  });
};

/**
 * Formats phone number to international format.
 */
export const formatPhone = (phone: string, defaultCountryCode: string = ''): string => {
  let cleaned = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code and we have a default, prepend it
  if (defaultCountryCode && !cleaned.startsWith(defaultCountryCode) && cleaned.length <= 10) {
    cleaned = defaultCountryCode + cleaned;
  }
  
  return cleaned;
};

/**
 * Merges class names.
 */
export const cn = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};
