
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formMessage, setFormMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const { login, register, loadingAuth, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // Consolidate error display
  React.useEffect(() => {
    if (authError) {
      setFormMessage({ type: 'error', text: authError });
    }
  }, [authError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setFormMessage(null);

    if (isLogin) {
      const user = await login(email, password);
      if(user) {
        navigate('/home');
      } else if (!authError) { // If login returns null but no specific authError is set by context
        setFormMessage({type: 'error', text: "ההתחברות נכשלה. אנא בדוק את פרטיך."});
      }
    } else {
      // Register now returns { success: boolean, message: string }
      const regResponse = await register(name, email, password);
      if (regResponse.success) {
        setFormMessage({type: 'success', text: `${regResponse.message || 'ההרשמה הסתיימה בהצלחה.'} אנא התחבר.`});
        setIsLogin(true); // Switch to login form
        setPassword(''); // Clear password for login
        // Email and name can remain or be cleared as preferred
      } else if (!authError) { // If register returns !success but no specific authError
         setFormMessage({type: 'error', text: regResponse.message || "ההרשמה נכשלה."});
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setFormMessage(null);
    // Reset fields when toggling for a cleaner UX
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
        {isLogin ? 'ברוך שובך!' : 'יצירת חשבון'}
      </h2>
      {formMessage && (
        <div className={`mb-4 p-3 border rounded-md text-sm ${formMessage.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
          {formMessage.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <Input
            label="שם מלא"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="ישראל ישראלי"
          />
        )}
        <Input
          label="כתובת אימייל"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@example.com"
        />
        <Input
          label="סיסמה"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
        <Button type="submit" isLoading={loadingAuth} className="w-full" size="lg">
          {isLogin ? 'התחברות' : 'הרשמה'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        {isLogin ? "אין לך חשבון?" : 'כבר יש לך חשבון?'}
        <button
          onClick={toggleMode}
          className="ms-1 font-medium text-sky-600 hover:text-sky-500 hover:underline"
        >
          {isLogin ? 'הירשם' : 'התחבר'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;