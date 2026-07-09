import React, { createContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('verdant_user')) || null,
  isAuthenticated: !!localStorage.getItem('verdant_user')
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false
      };
    case 'UPDATE_FIRST_LOGIN':
      if (state.user) {
        return {
          ...state,
          user: { ...state.user, isFirstLogin: false }
        };
      }
      return state;
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('verdant_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('verdant_user');
    }
  }, [state.user]);

  const login = (user) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const confirmFirstLogin = () => {
    dispatch({ type: 'UPDATE_FIRST_LOGIN' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, confirmFirstLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
