export interface Contact {
  id: string;
  name: string;
  phone: string;
  tags?: string[];
  [key: string]: any; // Allow custom fields
}

export interface MessageTemplate {
  id: string;
  name: string;
  text: string;
}

export enum SendingStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ'
}

export interface CampaignItem extends Contact {
  status: SendingStatus;
  processedMessage: string;
  waLink: string;
  readAt?: string;
}

export interface CampaignHistory {
  id: string;
  name: string;
  date: string;
  total: number;
  sent: number;
  read?: number;
  templateName: string;
}

export type ViewState = 'CONTACTS' | 'MESSAGE' | 'CAMPAIGN' | 'HISTORY' | 'SETTINGS';
