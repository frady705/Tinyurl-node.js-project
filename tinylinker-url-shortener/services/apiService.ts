
import { User, Link, CreateLinkDto, UpdateLinkTargetsDto } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';
const SERVER_ROOT_URL = 'http://localhost:3000'; // For direct redirection links

// Helper function to handle fetch responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `שגיאת HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If error response is not JSON or empty
    }
    throw new Error(errorMessage);
  }
  // If response is 204 No Content or similar, might not have JSON body
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return {}; // Return empty object for non-json responses or handle as needed
};


export const apiService = {
  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('tinyLinkerToken');
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 401) { // Token invalid or expired
        localStorage.removeItem('tinyLinkerToken');
        localStorage.removeItem('tinyLinkerUser');
        return null;
      }
      const userData = await handleResponse(response);
      localStorage.setItem('tinyLinkerUser', JSON.stringify(userData)); // Cache user details
      return userData;
    } catch (error) {
      console.error('שגיאה בטעינת המשתמש הנוכחי:', error);
      localStorage.removeItem('tinyLinkerToken'); // Clear bad token
      localStorage.removeItem('tinyLinkerUser');
      return null;
    }
  },

  login: async (email: string, pass: string): Promise<{ user: User, token: string }> => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await handleResponse(response);
    if (data.token && data.userId) {
      localStorage.setItem('tinyLinkerToken', data.token);
      // Backend login only returns userId and token. Fetch full user profile separately.
      // This will be handled by AuthContext calling getCurrentUser after login.
      return { user: { _id: data.userId, email: email, name: '', links:[] }, token: data.token }; // Partial user, full fetch next
    }
    throw new Error('ההתחברות נכשלה: טוקן או מזהה משתמש לא התקבלו.');
  },

  register: async (name: string, email: string, pass: string): Promise<{ message: string, userId: string }> => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass }),
    });
    return handleResponse(response); // Expected: { message: 'User registered', userId: user._id }
  },

  logout: async (): Promise<void> => {
    // Logout is client-side: just remove token and user data
    localStorage.removeItem('tinyLinkerToken');
    localStorage.removeItem('tinyLinkerUser');
    // No backend call for logout in the provided server
    return Promise.resolve();
  },

  getUserLinks: async (userId: string): Promise<Link[]> => {
    // Note: Backend endpoint /api/users/:id/links is not protected in provided server code.
    // If it were, we'd add Authorization header.
    const response = await fetch(`${API_BASE_URL}/users/${userId}/links`);
    const linksFromServer = await handleResponse(response);
    // Add userId to each link for client-side consistency and ensure createdAt
    return linksFromServer.map((link: any) => ({ 
        ...link, 
        userId, 
        createdAt: link.createdAt || new Date(0).toISOString() // Provide a fallback for createdAt
    }));
  },

  createLink: async (userId: string, data: CreateLinkDto): Promise<Link> => {
    // Note: Backend endpoint /api/links (POST) is not protected.
    const response = await fetch(`${API_BASE_URL}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: data.originalUrl, userId }),
    });
    const result = await handleResponse(response); // Expected: { message: 'Link created', link: LinkObject }
    return { 
        ...result.link, 
        userId, 
        createdAt: result.link.createdAt || new Date().toISOString() // Ensure createdAt
    };
  },

  getLinkDetails: async (linkId: string): Promise<Link> => {
    // Note: Backend endpoint /api/links/:id (GET) is not protected.
    if (!linkId) throw new Error("מזהה קישור הינו חובה.");
    const response = await fetch(`${API_BASE_URL}/links/${linkId}`);
    const link = await handleResponse(response);
    return {
        ...link,
        createdAt: link.createdAt || new Date(0).toISOString() // Ensure createdAt
    };
  },
  
  updateLinkTargets: async (linkId: string, data: UpdateLinkTargetsDto): Promise<Link> => {
    // Note: Backend endpoint /api/links/:id (PUT) is not protected.
    const response = await fetch(`${API_BASE_URL}/links/${linkId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response); // Expected: { message: 'Link updated', link: LinkObject }
    return {
        ...result.link,
        createdAt: result.link.createdAt || new Date(0).toISOString() // Ensure createdAt
    };
  },

  deleteLink: async (linkId: string): Promise<void> => {
    // Note: Backend endpoint /api/links/:id (DELETE) is not protected.
    const response = await fetch(`${API_BASE_URL}/links/${linkId}`, {
      method: 'DELETE',
    });
    await handleResponse(response); // Expected: { message: 'Link deleted' } or just 200/204
  }
};

// This function is for generating the display URL, which now points to the backend.
export const getShortUrl = (linkId: string): string => {
  return `${SERVER_ROOT_URL}/${linkId}`;
};