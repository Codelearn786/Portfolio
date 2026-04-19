import './styles/app.css';
import { bootstrap } from './app/bootstrap';

const app = document.querySelector<HTMLElement>('#app');
if (!app) {
  throw new Error('#app not found');
}

void bootstrap(app);
