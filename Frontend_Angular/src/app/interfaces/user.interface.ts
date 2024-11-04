export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  name?: string;
  birthDate?: Date;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
} 