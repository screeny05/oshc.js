import * as ReactDOM from 'react-dom/client';
import { gameUi } from './components/game-ui';

const $uiContainer = document.querySelector('#ui-container')!;

const main = async () => {
  ReactDOM.createRoot($uiContainer).render(gameUi());
};

main();
