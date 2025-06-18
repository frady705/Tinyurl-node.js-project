
import React from 'react';
import { Link as LinkType } from '../../types';
import LinkItem from './LinkItem';

interface LinkListProps {
  links: LinkType[];
  onLinkDeleted: (linkId: string) => void;
}

const LinkList: React.FC<LinkListProps> = ({ links, onLinkDeleted }) => {
  if (links.length === 0) {
    return <p className="text-slate-500">אין קישורים להצגה.</p>;
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <LinkItem key={link._id} link={link} onLinkDeleted={onLinkDeleted} />
      ))}
    </div>
  );
};

export default LinkList;