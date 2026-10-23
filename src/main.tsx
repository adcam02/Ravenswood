import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/sorts-mill-goudy/400.css';
import '@fontsource/sorts-mill-goudy/400-italic.css';
import '@fontsource/im-fell-english-sc/400.css';
import '@fontsource/im-fell-english/400.css';
import '@fontsource/im-fell-english/400-italic.css';
import '@fontsource/unifrakturmaguntia/400.css';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import './styles/base.css';
import './styles/token.css';
import './styles/square.css';
import './styles/app.css';
import './styles/cards.css';
import './styles/modals.css';
import './styles/cosy.css';
import './styles/town.css';
import './styles/casino.css';
import './styles/jobs.css';
import { App } from './App';
import { Guard } from './components/Guard';
import { preloadParts } from './lib/lazy';
import { watchForProblems } from './lib/report';
import { watchForUpdates } from './lib/version';

watchForUpdates();
preloadParts();
watchForProblems();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Guard>
      <App />
    </Guard>
  </StrictMode>,
);
