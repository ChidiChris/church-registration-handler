export interface RegistrationData {
  fullName: string;
  email?: string;
  phone: string;
  homeAddress: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  maritalStatus: 'Single' | 'Married' | 'Other';
  society: string;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  homeAddress?: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  society?: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
}

export interface DuplicateCheckResponse {
  isDuplicate: boolean;
  existingMember?: {
    name: string;
    email: string;
    registrationDate: string;
  };
}