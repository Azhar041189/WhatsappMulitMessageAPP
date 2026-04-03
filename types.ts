export interface Contact {
  id: string;
  name: string;
  phone: string;
  [key: string]: string; // Allow custom fields
}

export interface MessageTemplate {
  text: string;
}

export enum SendingStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export interface CampaignItem extends Contact {
  status: SendingStatus;
}

export type ViewState = 'CONTACTS' | 'MESSAGE' | 'CAMPAIGN';
