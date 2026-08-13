// Components style
import '@/components/Avatar/style.css';
import '@/components/AvatarGroup/style.css';

// App style
import './styles/index.scss';

// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <App />
  // </StrictMode>
);
