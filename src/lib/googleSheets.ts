

import { RegistrationData, SubmissionResponse, DuplicateCheckResponse } from '@/types/registration';

// This URL should be replaced with your actual Google Apps Script Web App URL
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxXQtYz3b9sOkszLKunbwMquY_Cw2Ojqt0iVtJMMB-LMMaWvZ7dNNqER0xsch9lo8IS/exec';

export const checkForDuplicate = async (phone: string): Promise<DuplicateCheckResponse> => {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=checkDuplicate&phone=${encodeURIComponent(phone)}`);

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            // If check fails, allow registration to proceed
            return { isDuplicate: false };
        }
    } catch (error) {
        console.error('Error checking for duplicates:', error);
        // If check fails, allow registration to proceed
        return { isDuplicate: false };
    }
};

export const submitToGoogleSheets = async (data: RegistrationData): Promise<SubmissionResponse> => {
    try {
        const formData = new FormData();
        formData.append('action', 'submit');
        formData.append('fullName', data.fullName);
        formData.append('email', data.email || '');
        formData.append('phone', data.phone);
        formData.append('homeAddress', data.homeAddress);
        formData.append('gender', data.gender);
        formData.append('dateOfBirth', data.dateOfBirth);
        formData.append('maritalStatus', data.maritalStatus);
        formData.append('society', data.society);
        formData.append('timestamp', new Date().toISOString());
        console.log("Submitting data:", formData);
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            return {
                success: true,
                message: 'Registration submitted successfully!'
            };
        } else {
            throw new Error('Failed to submit registration');
        }
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        return {
            success: false,
            message: 'Failed to submit registration. Please try again.'
        };
    }
};

export const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    // Remove all spaces and non-digit characters except +
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    // Check for 11-digit number (e.g., 08012345678)
    if (/^\d{11}$/.test(cleanPhone)) {
        return true;
    }

    // Check for 13-digit number starting with +234 (e.g., +2348012345678)
    if (/^\+234\d{10}$/.test(cleanPhone)) {
        return true;
    }

    return false;
};

