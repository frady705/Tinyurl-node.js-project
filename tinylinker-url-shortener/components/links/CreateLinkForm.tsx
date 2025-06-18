
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import { Link as LinkType } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Icons } from '../../constants';

interface CreateLinkFormProps {
  onLinkCreated: (newLink: LinkType) => void;
}

const CreateLinkForm: React.FC<CreateLinkFormProps> = ({ onLinkCreated }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('עליך להתחבר כדי ליצור קישור.');
      return;
    }
    if (!originalUrl.trim()) {
        setError('כתובת URL מקורית אינה יכולה להיות ריקה.');
        return;
    }
    try {
        new URL(originalUrl); // Basic URL validation
    } catch (_) {
        setError('אנא הזן כתובת URL תקינה (לדוגמה: https://example.com)');
        return;
    }


    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newLink = await apiService.createLink(user._id, { originalUrl });
      onLinkCreated(newLink);
      setOriginalUrl('');
      setSuccessMessage('הקישור נוצר בהצלחה!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'יצירת הקישור נכשלה.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
      {successMessage && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{successMessage}</p>}
      <Input
        label="כתובת URL מקורית"
        type="url"
        name="originalUrl"
        value={originalUrl}
        onChange={(e) => {
            setOriginalUrl(e.target.value);
            if (error) setError(null); // Clear error on input change
        }}
        placeholder="https://your-long-url.com/goes/here"
        required
        disabled={isLoading}
      />
      <Button type="submit" isLoading={isLoading} disabled={isLoading} leftIcon={<Icons.PlusCircle />}>
        קצר כתובת
      </Button>
    </form>
  );
};

export default CreateLinkForm;