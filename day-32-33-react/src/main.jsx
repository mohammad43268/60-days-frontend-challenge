import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/collections", element: <Collections /> },
      { path: "/gallery", element: <Gallery /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
