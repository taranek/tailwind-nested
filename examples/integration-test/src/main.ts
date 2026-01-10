import './index.css';
import { twn } from 'tailwind-nested';

const button = twn('px-4 py-2', {
  hover: 'bg-red-500 shadow-xl',
  focus: 'ring-4 ring-red-300',
  disabled: 'opacity-50 cursor-not-allowed',
});

const card = twn('p-4', {
  dark: {
    hover: 'bg-gray-900 text-gray-100',
  },
});

const accordion = twn('border', {
  hover: 'bg-blue-100',
  'aria-[expanded=true]': 'bg-blue-200',
  'data-[state=open]': 'rotate-45',
});

document.getElementById('app')!.innerHTML = `
  <button class="${button}">Button</button>
  <div class="${card}">Card</div>
  <div class="${accordion}" aria-expanded="true">Accordion</div>
`;
