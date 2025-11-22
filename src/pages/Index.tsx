import { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import SuccessMessage from '@/components/SuccessMessage';
import { Church } from 'lucide-react';

export default function Index() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSuccess = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <Church className="w-8 h-8 text-blue-600" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">
                St. John's Catholic Cathedral
              </h1>
              <p className="text-sm text-gray-600">Bauchi, Nigeria</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Our Church Family
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your details help us maintain our membership records and understand the growth of our church community over time.
            </p>
          </div>

          {/* Form or Success Message */}
          <div className="flex justify-center">
            {isSubmitted ? (
              <SuccessMessage onReset={handleReset} />
            ) : (
              <RegistrationForm onSuccess={handleSuccess} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Church className="w-5 h-5" />
            <span className="font-semibold">St. John's Catholic Cathedral Bauchi</span>
          </div>
          <p className="text-gray-300 text-sm">
            Building a community of faith, hope, and love
          </p>
          <p className="text-gray-400 text-xs mt-2">
            © 2025 St. John's Catholic Cathedral Bauchi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}