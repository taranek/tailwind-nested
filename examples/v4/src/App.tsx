import { twn } from 'tailwind-nested';

function App() {
  return (
    <div className={twn('w-screen flex-col gap-10 h-screen flex items-center justify-center bg-green-800', {
      hover: 'bg-green-900 uppercase',
    })}>
      <h1 className={twn('text-3xl font-bold underline text-green-200', {
        hover: 'text-green-100 scale-105 border-2 border-red-200',
        focus: 'ring-2 ring-green-400',
      })}>
        Hello world!!
      </h1>
      <button className={twn('bg-transparent', {
        hover: 'bg-blue-700 font-bold shadow-xl transform scale-110 text-black',
      })}>
        siema
      </button>
    </div>
  )
}

export default App
