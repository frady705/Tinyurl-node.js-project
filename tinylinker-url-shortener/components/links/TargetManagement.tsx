
import React, { useState, FormEvent, useEffect } from 'react';
import { Link as LinkType, TargetValue, UpdateLinkTargetsDto } from '../../types';
import { apiService, getShortUrl } from '../../services/apiService';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Icons } from '../../constants';

interface TargetManagementProps {
  link: LinkType;
  onTargetsUpdated: (updatedLink: LinkType) => void;
}

const TargetManagement: React.FC<TargetManagementProps> = ({ link, onTargetsUpdated }) => {
  const [targetParamName, setTargetParamName] = useState(link.targetParamName || 't');
  const [targetValues, setTargetValues] = useState<TargetValue[]>(link.targetValues || []);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetValue, setNewTargetValue] = useState('');
  const [editingTarget, setEditingTarget] = useState<TargetValue | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTargetParamName(link.targetParamName || 't');
    setTargetValues(link.targetValues || []);
  }, [link]);
  
  const shortUrlBaseDisplay = getShortUrl(link._id);

  const handleSaveTargets = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!targetParamName.trim()) {
        setError("שם פרמטר היעד אינו יכול להיות ריק.");
        setIsLoading(false);
        return;
    }
    if (targetValues.some(tv => !tv.name.trim() || !tv.value.trim())) {
        setError("שם וערך היעד אינם יכולים להיות ריקים עבור אף מקור יעד.");
        setIsLoading(false);
        return;
    }
    const uniqueValues = new Set(targetValues.map(tv => tv.value));
    if (uniqueValues.size !== targetValues.length) {
        setError("ערכי היעד חייבים להיות ייחודיים.");
        setIsLoading(false);
        return;
    }


    const payload: UpdateLinkTargetsDto = {
      targetParamName,
      targetValues,
    };

    try {
      const updatedLink = await apiService.updateLinkTargets(link._id, payload);
      onTargetsUpdated(updatedLink);
      setSuccessMessage('היעדים עודכנו בהצלחה!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'עדכון היעדים נכשל.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateTarget = () => {
    if (!newTargetName.trim() || !newTargetValue.trim()) {
        setError("שם וערך היעד אינם יכולים להיות ריקים.");
        return;
    }
    if (!editingTarget && targetValues.some(tv => tv.value === newTargetValue)) {
        setError(`ערך היעד "${newTargetValue}" כבר קיים. הערכים חייבים להיות ייחודיים.`);
        return;
    }
    if (editingTarget && editingTarget.value !== newTargetValue && targetValues.some(tv => tv.value === newTargetValue)) {
         setError(`ערך היעד "${newTargetValue}" כבר קיים. הערכים חייבים להיות ייחודיים.`);
        return;
    }
    setError(null);

    if (editingTarget) {
      setTargetValues(
        targetValues.map((tv) =>
          tv._id === editingTarget._id ? { ...tv, name: newTargetName, value: newTargetValue } : tv
        )
      );
      setEditingTarget(null);
    } else {
      setTargetValues([...targetValues, { _id: `new_${Date.now()}`, name: newTargetName, value: newTargetValue }]);
    }
    setNewTargetName('');
    setNewTargetValue('');
  };

  const handleEditTarget = (target: TargetValue) => {
    setEditingTarget(target);
    setNewTargetName(target.name);
    setNewTargetValue(target.value);
  };

  const handleRemoveTarget = (idToRemove: string) => {
    setTargetValues(targetValues.filter((tv) => tv._id !== idToRemove));
    if (editingTarget && editingTarget._id === idToRemove) {
        setEditingTarget(null);
        setNewTargetName('');
        setNewTargetValue('');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingTarget(null);
    setNewTargetName('');
    setNewTargetValue('');
    setError(null);
  };

  return (
    <Card title="ניהול מקורות יעד" className="mt-8">
      <form onSubmit={handleSaveTargets} className="space-y-6">
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        {successMessage && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{successMessage}</p>}
        
        <Input
          label="שם פרמטר היעד (לדוגמה: 'source', 't', 'utm_campaign')"
          name="targetParamName"
          value={targetParamName}
          onChange={(e) => setTargetParamName(e.target.value)}
          placeholder="t"
          disabled={isLoading}
        />

        <div className="space-y-4">
          <h4 className="text-md font-semibold text-slate-700">הגדר מקורות יעד:</h4>
          {targetValues.map((tv) => (
            <div key={tv._id} className="p-3 bg-slate-50 rounded-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div className="flex-1">
                <p className="font-medium text-slate-800">{tv.name} <span className="text-xs text-slate-500">(ערך: {tv.value})</span></p>
                <p className="text-xs text-sky-600 truncate" title={`${shortUrlBaseDisplay}?${targetParamName}=${tv.value}`}>
                    כתובת שנוצרה: {`${shortUrlBaseDisplay.replace(/^https?:\/\//, '')}?${targetParamName}=${tv.value}`}
                </p>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <Button type="button" size="sm" variant="ghost" onClick={() => handleEditTarget(tv)} leftIcon={<Icons.Edit />} disabled={isLoading}>
                  ערוך
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveTarget(tv._id)} leftIcon={<Icons.Trash />} className="text-red-600 hover:bg-red-100" disabled={isLoading}>
                  הסר
                </Button>
              </div>
            </div>
          ))}
           {targetValues.length === 0 && <p className="text-sm text-slate-500">עדיין לא הוגדרו מקורות יעד.</p>}
        </div>

        <div className="p-4 border border-slate-200 rounded-md mt-4 space-y-3 bg-slate-50">
          <h5 className="text-md font-semibold text-slate-700">{editingTarget ? 'ערוך מקור יעד' : 'הוסף מקור יעד חדש'}</h5>
          <Input
            label="שם המקור (לדוגמה: 'ניוזלטר', 'מודעת פייסבוק')"
            name="newTargetName"
            value={newTargetName}
            onChange={(e) => setNewTargetName(e.target.value)}
            placeholder="קמפיין קיץ"
            disabled={isLoading}
            containerClassName="mb-2"
          />
          <Input
            label="ערך המקור (משמש בכתובת, לדוגמה: 'nl', 'fb_ad_summer')"
            name="newTargetValue"
            value={newTargetValue}
            onChange={(e) => setNewTargetValue(e.target.value)}
            placeholder="summer_campaign"
            disabled={isLoading}
            containerClassName="mb-2"
          />
          <div className="flex space-x-2">
            <Button type="button" onClick={handleAddOrUpdateTarget} variant="secondary" disabled={isLoading || !newTargetName.trim() || !newTargetValue.trim()}>
              {editingTarget ? 'עדכן מקור' : 'הוסף מקור'}
            </Button>
            {editingTarget && (
                <Button type="button" variant="ghost" onClick={handleCancelEdit} disabled={isLoading}>בטל עריכה</Button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" isLoading={isLoading} disabled={isLoading} leftIcon={<Icons.Target />}>
            שמור את כל הגדרות היעד
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TargetManagement;