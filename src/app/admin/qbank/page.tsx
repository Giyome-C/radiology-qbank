"use client"

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock data for demonstration
const questions = [
  {
    id: 1,
    question: "Formula for calculating percentage change in price?",
    section: "Math",
    difficulty: "Easy",
  },
  {
    id: 2,
    question: "Revenue: $10,000; expenses: $7,500. What is profit?",
    section: "Finance",
    difficulty: "Medium",
  },
  {
    id: 3,
    question: "Inflation rate: 3%; original price: $100. New price after one year?",
    section: "Economics",
    difficulty: "Medium",
  },
  {
    id: 4,
    question: "Demand function: Q = 100 - 2P. Equilibrium price and quantity?",
    section: "Economics",
    difficulty: "Easy",
  },
];

export default function AdminQbankPage() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Sidebar links (shared with admin dashboard)
  const sidebarLinks = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Qbank", href: "/admin/qbank" },
    { label: "User dashboard", href: "/dashboard" },
    { label: "Settings", href: "#" },
    { label: "Sign out", href: "/auth", isSignOut: true },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-8 px-4 min-h-screen">
        <div className="mb-8">
          <span className="text-xl font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-2">
          {sidebarLinks.map((link) =>
            link.isSignOut ? (
              <button
                key={link.label}
                onClick={() => router.push(link.href)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer font-medium text-red-600"
              >
                {link.label}
              </button>
            ) : (
              <Link key={link.label} href={link.href}>
                <span className="block px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer font-medium">
                  {link.label}
                </span>
              </Link>
            )
          )}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 bg-gray-50 px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
            Add Question
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 font-semibold text-gray-700">Question</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Section</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Difficulty</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b hover:bg-gray-50 group">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="text-gray-600">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" /></svg>
                    </span>
                    {q.question}
                  </td>
                  <td className="py-3 px-4">{q.section}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{q.difficulty}</span>
                  </td>
                  <td className="py-3 px-4 text-right relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100"
                      onClick={() => setDropdownOpen(dropdownOpen === q.id ? null : q.id)}
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
                    </button>
                    {dropdownOpen === q.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Duplicate</button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
} 