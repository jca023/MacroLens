import { Utensils } from 'lucide-react'
import './index.css'

function App() {
  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
        <Utensils size={32} className="text-emerald-500" />
      </div>
      <h1 className="text-4xl font-bold text-emerald-500 mb-2">MacroLens</h1>
      <p className="text-gray-400 mb-8 text-center">Your AI Food Companion</p>
      <button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-4 px-8 rounded-xl text-lg transition-colors">
        Get Started
      </button>
      <p className="text-gray-500 text-sm mt-4">Track your nutrition with AI-powered meal recognition</p>
    </div>
  )
}

export default App
