
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <Card className="max-w-lg">
        <h1 className="text-6xl font-bold text-sky-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-slate-800 mb-3">הדף לא נמצא</h2>
        <p className="text-slate-600 mb-8">
          אופס! הדף שאתה מחפש אינו קיים. ייתכן שהוא הועבר או נמחק.
        </p>
        <Link to="/home">
          <Button size="lg">מעבר לדף הבית</Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFoundPage;