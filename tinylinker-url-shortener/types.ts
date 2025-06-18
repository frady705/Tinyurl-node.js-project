export interface User {
  _id: string;
  name: string;
  email: string;
  links: string[]; // Array of link IDs
  token?: string; // JWT token, mainly stored in localStorage but can be here for context
}

export interface Click {
  _id: string;
  insertedAt: string; // ISO Date string
  ipAddress: string; // Should be handled carefully regarding privacy
  targetParamValue?: string;
}

export interface TargetValue {
  _id: string;
  name: string;
  value: string;
}

export interface Link {
  _id: string;
  originalUrl: string;
  userId?: string; // ID of the user who owns the link, now optional
  clicks: Click[];
  targetParamName?: string;
  targetValues?: TargetValue[];
  createdAt: string; // ISO Date string
}

// For API responses or forms, you might want partial types or specific DTOs
export type CreateLinkDto = Pick<Link, 'originalUrl'>;
export type UpdateLinkTargetsDto = Pick<Link, 'targetParamName' | 'targetValues'>;