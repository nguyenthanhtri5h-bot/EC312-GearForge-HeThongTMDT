import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/header.css';
import './styles/hover-reveal.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/sections-more.css';
import './styles/subpage-bands.css';
import './styles/contact-section.css';
import './styles/contact-footer.css';
import './styles/widgets.css';
import './styles/drawers.css';

const mountEl =
  document.getElementById('gf-flagship-root') ||
  document.getElementById('root');

if (mountEl) {
  createRoot(mountEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
