
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, getShortUrl } from '../services/apiService';
import { Link as LinkType } from '../types';
import LinkAnalytics from '../components/links/LinkAnalytics';
import TargetManagement from '../components/links/TargetManagement';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LinkDetailsPage: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [link, setLink] = useState<LinkType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchLinkDetails = useCallback(async () => {
    if (!linkId) {
        setError("לא סופק מזהה קישור.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLink = await apiService.getLinkDetails(linkId);
      setLink(fetchedLink);
    } catch (err: any) {
      setError(err.message || 'טעינת פרטי הקישור נכשלה.');
    } finally {
      setIsLoading(false);
    }
  }, [linkId]);

  useEffect(() => {
    fetchLinkDetails();
  }, [fetchLinkDetails]);

  const handleTargetsUpdated = (updatedLink: LinkType) => {
    setLink(updatedLink);
  };

  if (isLoading) {
    return <LoadingSpinner message="טוען פרטי קישור..." />;
  }

  if (error) {
    return (
        <Card title="שגיאה">
            <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
            <Button onClick={() => navigate('/home')} className="mt-4">חזרה לדף הבית</Button>
        </Card>
    );
  }

  if (!link) {
    return (
        <Card title="לא נמצא">
            <p>הקישור לא נמצא.</p>
            <Button onClick={() => navigate('/home')} className="mt-4">חזרה לדף הבית</Button>
        </Card>
    );
  }
  
  const shortUrlBaseDisplay = getShortUrl(link._id);

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">פרטי קישור</h1>
                <a 
                    href={link.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sky-600 hover:underline break-all"
                >
                    {link.originalUrl}
                </a>
                <p className="text-sm text-slate-600 mt-1">
                    כתובת מקוצרת (ברירת מחדל): <a href={shortUrlBaseDisplay} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">{shortUrlBaseDisplay.replace(/^https?:\/\//, '')}</a>
                </p>
            </div>
            <Button onClick={() => navigate('/home')} variant="secondary">חזרה לרשימת הקישורים</Button>
        </div>
      </Card>

      <LinkAnalytics link={link} />
      <TargetManagement link={link} onTargetsUpdated={handleTargetsUpdated} />
    </div>
  );
};

export default LinkDetailsPage;