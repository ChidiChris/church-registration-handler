import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle } from 'lucide-react';
import { RegistrationData, FormErrors } from '@/types/registration';
import { submitToGoogleSheets, validateEmail, validatePhone, checkForDuplicate } from '@/lib/googleSheets';

interface RegistrationFormProps {
  onSuccess: () => void;
}

const societyOptions = [
  'Choir',
  'Ushering',
  'Technical/Sound',
  "Children's Society",
  'Youth Society',
  'Liturgy Committee',
  'Evangelization',
  'Social Services',
  'Finance Committee',
  'Maintenance',
  'Catholic Women Organization (CWO)',
  'Catholic Men Organization (CMO)',
  'Legion of Mary',
  'Sacred Heart Society',
  'Other'
];

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    email: '',
    phone: '',
    homeAddress: '',
    gender: 'Male',
    dateOfBirth: '',
    maritalStatus: 'Single',
    society: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 11-digit phone number or 13-digit number with +234';
    }

    if (!formData.homeAddress.trim()) {
      newErrors.homeAddress = 'Home address is required';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.society) {
      newErrors.society = 'Please select a society interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneBlur = async () => {
    if (formData.phone && validatePhone(formData.phone)) {
      setIsCheckingDuplicate(true);
      setDuplicateWarning('');
      
      try {
        const duplicateCheck = await checkForDuplicate(formData.phone);
        
        if (duplicateCheck.isDuplicate && duplicateCheck.existingMember) {
          setDuplicateWarning(
            `This phone number is already registered for ${duplicateCheck.existingMember.name}. ` +
            'Please contact the church office if you need to update your information.'
          );
        }
      } catch (error) {
        // Silently handle error - don't block registration
        console.log('Duplicate check failed, proceeding with registration');
      } finally {
        setIsCheckingDuplicate(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    // If there's a duplicate warning, require user confirmation
    if (duplicateWarning && !window.confirm(
      'This phone number appears to be already registered. Do you want to proceed anyway? ' +
      'This may create a duplicate record.'
    )) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitToGoogleSheets(formData);
      
      if (result.success) {
        onSuccess();
      } else {
        setSubmitError(result.message);
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear duplicate warning when phone changes
    if (field === 'phone' && duplicateWarning) {
      setDuplicateWarning('');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-blue-800">
          Membership Registration
        </CardTitle>
        <p className="text-gray-600">St. John's Catholic Cathedral Bauchi</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="e.g., 08012345678 or +2348012345678"
                className={errors.phone || duplicateWarning ? 'border-red-500' : ''}
              />
              {isCheckingDuplicate && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            {duplicateWarning && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-700 text-sm">{duplicateWarning}</p>
              </div>
            )}
            <p className="text-xs text-gray-500">Enter 11 digits (e.g., 08012345678) or 13 digits with +234</p>
          </div>

          {/* Home Address */}
          <div className="space-y-2">
            <Label htmlFor="homeAddress">Home Address *</Label>
            <Textarea
              id="homeAddress"
              value={formData.homeAddress}
              onChange={(e) => handleInputChange('homeAddress', e.target.value)}
              placeholder="Enter your complete home address (street, area, city, state)"
              className={errors.homeAddress ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.homeAddress && <p className="text-red-500 text-sm">{errors.homeAddress}</p>}
          </div>

          {/* Gender and Date of Birth Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value: 'Male' | 'Female') => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
            </div>
          </div>

          {/* Marital Status */}
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status *</Label>
            <Select value={formData.maritalStatus} onValueChange={(value: 'Single' | 'Married' | 'Other') => handleInputChange('maritalStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Society Interest */}
          <div className="space-y-2">
            <Label htmlFor="society">Society/Organization Interest *</Label>
            <Select value={formData.society} onValueChange={(value) => handleInputChange('society', value)}>
              <SelectTrigger className={errors.society ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your society interest" />
              </SelectTrigger>
              <SelectContent>
                {societyOptions.map((society) => (
                  <SelectItem key={society} value={society}>
                    {society}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.society && <p className="text-red-500 text-sm">{errors.society}</p>}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || isCheckingDuplicate}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Now'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            * Required fields. Your information will be kept confidential and used only for church administration purposes.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}