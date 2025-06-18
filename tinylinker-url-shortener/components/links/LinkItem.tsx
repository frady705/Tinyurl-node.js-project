
import React, { useState } from 'react';
import { Link as LinkType } from '../../types';
import { Link as RouterLink } from 'react-router-dom';
import { Icons } from '../../constants';
import Button from '../ui/Button';
import { apiService, getShortUrl } from '../../services/apiService';

interface LinkItemProps {
  link: LinkType;
  onLinkDeleted: (linkId: string) => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ link, onLinkDeleted }) => {
  const shortUrlDisplay = getShortUrl(link._id); // Use new function for display and copy
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrlDisplay).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error('העתקה נכשלה: ', err));
  };

  const handleDelete = async () => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את הקישור: ${shortUrlDisplay}? לא ניתן לשחזר פעולה זו.`)) {
        return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
        await apiService.deleteLink(link._id);
        onLinkDeleted(link._id);
    } catch (error: any) {
        setDeleteError(error.message || 'מחיקת הקישור נכשלה.');
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div className="flex-1 min-w-0 mb-3 sm:mb-0">
          <p className="text-xs text-slate-500 mb-1">כתובת מקורית:</p>
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-sky-600 hover:text-sky-800 hover:underline truncate block"
            title={link.originalUrl}
          >
            {link.originalUrl}
          </a>
          <p className="text-xs text-slate-500 mt-2 mb-1">כתובת מקוצרת:</p>
          <div className="flex items-center space-x-2">
            <a
              href={shortUrlDisplay} // Direct link to backend for redirection
              target="_blank"
              rel="noopener noreferrer" // Good practice, though redirection makes it less critical
              className="text-sm font-semibold text-slate-700 hover:text-sky-600 hover:underline"
            >
              {shortUrlDisplay.replace(/^https?:\/\//, '')} 
            </a>
            <Button size="sm" variant="ghost" onClick={copyToClipboard} leftIcon={<Icons.Clipboard />} title="העתק כתובת מקוצרת">
              {copied ? 'הועתק!' : 'העתק'}
            </Button>
          </div>
        </div>
        <div className="flex-shrink-0 flex sm:flex-col lg:flex-row items-center space-x-2 sm:space-x-0 sm:space-y-2 lg:space-y-0 lg:space-x-2">
          <RouterLink to={`/link/${link._id}`}>
            <Button size="sm" variant="secondary" leftIcon={<Icons.Analytics />} className="w-full lg:w-auto">
              ניתוח נתונים
            </Button>
          </RouterLink>
           <Button 
            size="sm" 
            variant="danger" 
            onClick={handleDelete} 
            isLoading={isDeleting} 
            leftIcon={<Icons.Trash />}
            className="w-full lg:w-auto"
            >
            מחק
          </Button>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
        <span>קליקים: <span className="font-semibold text-slate-700">{link.clicks.length}</span></span>
        <span>נוצר: {new Date(link.createdAt).toLocaleDateString('he-IL')}</span>
      </div>
       {deleteError && <p className="mt-2 text-xs text-red-500">{deleteError}</p>}
    </div>
  );
};

export default LinkItem;