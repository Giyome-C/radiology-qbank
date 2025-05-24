import React from 'react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Radiology QBank
        </h1>
        <p className="text-center text-lg mb-8">
          Master radiology through comprehensive practice questions and detailed explanations
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
} 