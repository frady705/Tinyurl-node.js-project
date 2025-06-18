
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { Link as LinkType } from '../types';
import CreateLinkForm from '../components/links/CreateLinkForm';
import LinkList from '../components/links/LinkList';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const userLinks = await apiService.getUserLinks(user._id);
      setLinks(userLinks.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setError(err.message || 'טעינת הקישורים נכשלה.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleLinkCreated = (newLink: LinkType) => {
    setLinks(prevLinks => [newLink, ...prevLinks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };
  
  const handleLinkDeleted = (deletedLinkId: string) => {
    setLinks(prevLinks => prevLinks.filter(link => link._id !== deletedLinkId));
  };


  if (!user) {
    return <p>אנא התחבר כדי לראות את הקישורים שלך.</p>; // Should be handled by ProtectedRoute
  }

  return (
    <div className="space-y-8">
      <Card title="צור קישור מקוצר חדש">
        <CreateLinkForm onLinkCreated={handleLinkCreated} />
      </Card>

      <Card title="הקישורים שלך">
        {isLoading && <LoadingSpinner message="טוען את הקישורים שלך..." />}
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        {!isLoading && !error && (
          links.length > 0 ? (
            <LinkList links={links} onLinkDeleted={handleLinkDeleted} />
          ) : (
            <p className="text-slate-600">עדיין לא יצרת קישורים. צור אחד למעלה!</p>
          )
        )}
      </Card>
    </div>
  );
};

export default HomePage;