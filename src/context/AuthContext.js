import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';
import api from '../api';

const AuthContext = createContext();

export { AuthContext };

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const register = (username, email, password) =>
    api
      .post('/register', { username, email, password })
      .then(res => {
        setUser(res.data);
        return res.data;
      });

  const login = (username, password) =>
    api
      .post('/login', { username, password })
      .then(res => {
        setUser(res.data);
        return res.data;
      });

  const logout = () => {
    setUser(null);
    // localStorage is cleared by the effect above
  };

  const updateUser = updatedFields => {
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider
      value={{ user, register, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
