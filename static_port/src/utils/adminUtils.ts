import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// export const API_BASE = import.meta.env.VITE_BACKEND_URL 
//   ? `${import.meta.env.VITE_BACKEND_URL}/api`
//   : 'https://mmport-b2fzejc8h9cwfffb.centralindia-01.azurewebsites.net/api';


export const API_BASE = 'http://localhost:5001/api';


export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export function useRequireAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);
}
