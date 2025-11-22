import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessMessageProps {
  onReset: () => void;
}

export default function SuccessMessage({ onReset }: SuccessMessageProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h2 className="text-2xl font-bold text-green-700">Registration Successful!</h2>
          <p className="text-gray-600 leading-relaxed">
            Thank you for providing your information to St. John's Catholic Cathedral Bauchi.
            Your details are now on record, allowing us to keep your membership on file and see how our community is growing..
          </p>
          <button
            onClick={onReset}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register Another Member
          </button>
        </div>
      </CardContent>
    </Card>
  );
}