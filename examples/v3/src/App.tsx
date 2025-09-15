import { twn } from 'tailwind-nested';

function App() {
  return (
    <div className={twn('w-screen h-screen flex items-center justify-center bg-green-800', {
      hover: 'bg-green-900',
      'dark': 'bg-slate-900'
    })}>
      <h1 className={twn('text-3xl font-bold underline text-green-200', {
        hover: 'text-green-100 scale-105',
        focus: 'ring-2 ring-green-400',
        'dark': 'text-slate-200',
        'dark:hover': 'text-white'
      })}>
        Hello world!
      </h1>
    </div>
  )
}

export default App
