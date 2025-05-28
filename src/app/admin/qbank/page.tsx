"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchAllQuestionsFromSupabase, addQuestionToSupabase } from '@/lib/supabase/database';
import { supabase } from '@/lib/supabase/client';

export default function AdminQbankPage() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionOptions = [
    "brain",
    "spine",
    "head_and_neck",
    "peds",
    "physics",
  ];
  const difficultyOptions = ["easy", "advanced"];
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: '',
    difficulty: '',
    question_text: '',
    image_file: null as File | null,
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    explanation_image_file: null as File | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editImageUrls, setEditImageUrls] = useState<{ question: string; explanation: string }>({ question: '', explanation: '' });
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null);
  const [explanationImagePreview, setExplanationImagePreview] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch questions from Supabase on mount
  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const data = await fetchAllQuestionsFromSupabase();
        setQuestions(data || []);
      } catch (err) {
        setQuestions([]);
      }
      setLoading(false);
    }
    loadQuestions();
  }, []);

  // Sidebar links (shared with admin dashboard)
  const sidebarLinks = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Qbank", href: "/admin/qbank" },
    { label: "User dashboard", href: "/dashboard" },
    { label: "Settings", href: "#" },
    { label: "Sign out", href: "/auth", isSignOut: true },
  ];

  async function uploadImage(file: File, folder: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const { data, error } = await supabase.storage.from('question-images').upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('question-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  }

  // Edit handler: open modal with question data
  function handleEditQuestion(q: any) {
    console.log('Editing question:', q);
    console.log('Question image URL:', q.image_url);
    console.log('Question explanation image URL:', q.explanation_image_url);
    
    setForm({
      category: q.category,
      difficulty: q.difficulty,
      question_text: q.question_text,
      image_file: null,
      options: q.options || ['', '', '', ''],
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      explanation_image_file: null,
    });
    setEditQuestionId(q.id);
    setAddModalOpen(true);
    
    const questionImageUrl = q.image_url || '';
    const explanationImageUrl = q.explanation_image_url || '';
    
    console.log('Setting editImageUrls to:', { question: questionImageUrl, explanation: explanationImageUrl });
    
    setEditImageUrls({
      question: questionImageUrl,
      explanation: explanationImageUrl,
    });
    setQuestionImagePreview(null);
    setExplanationImagePreview(null);
  }

  // Duplicate handler: create a copy of the question
  async function handleDuplicateQuestion(q: any) {
    setSaving(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('questions').insert([
        {
          category: q.category,
          difficulty: q.difficulty,
          question_text: q.question_text,
          image_url: q.image_url,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          explanation_image_url: q.explanation_image_url,
        },
      ]);
      if (insertError) throw insertError;
      setLoading(true);
      const data = await fetchAllQuestionsFromSupabase();
      setQuestions(data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate question.');
    }
    setSaving(false);
  }

  // Delete handler: show confirmation popup
  function handleDeleteQuestion(q: any) {
    setDeleteConfirmId(q.id);
  }

  // Confirm delete
  async function confirmDeleteQuestion() {
    if (!deleteConfirmId) return;
    setSaving(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase.from('questions').delete().eq('id', deleteConfirmId);
      if (deleteError) throw deleteError;
      setDeleteConfirmId(null);
      setLoading(true);
      const data = await fetchAllQuestionsFromSupabase();
      setQuestions(data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete question.');
    }
    setSaving(false);
  }

  // Save handler: update if editing, insert if new
  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let image_url = null;
      let explanation_image_url = null;
      if (form.image_file) {
        image_url = await uploadImage(form.image_file, 'questions');
      }
      if (form.explanation_image_file) {
        explanation_image_url = await uploadImage(form.explanation_image_file, 'explanations');
      }
      if (editQuestionId) {
        // Update existing question
        const { error: updateError } = await supabase.from('questions').update({
          category: form.category,
          difficulty: form.difficulty,
          question_text: form.question_text,
          image_url: image_url !== null ? image_url : undefined,
          options: form.options,
          correct_answer: form.correct_answer,
          explanation: form.explanation || null,
          explanation_image_url: explanation_image_url !== null ? explanation_image_url : undefined,
        }).eq('id', editQuestionId);
        if (updateError) throw updateError;
      } else {
        // Insert new question
        const { error: insertError } = await supabase.from('questions').insert([
          {
            category: form.category,
            difficulty: form.difficulty,
            question_text: form.question_text,
            image_url,
            options: form.options,
            correct_answer: form.correct_answer,
            explanation: form.explanation || null,
            explanation_image_url,
          },
        ]);
        if (insertError) throw insertError;
      }
      setAddModalOpen(false);
      setEditQuestionId(null);
      setForm({
        category: '',
        difficulty: '',
        question_text: '',
        image_file: null,
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        explanation_image_file: null,
      });
      setQuestionImagePreview(null);
      setExplanationImagePreview(null);
      setLoading(true);
      const data = await fetchAllQuestionsFromSupabase();
      setQuestions(data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save question.');
    }
    setSaving(false);
  }

  // When closing the modal, clear previews
  const handleCloseModal = () => {
    setAddModalOpen(false);
    setEditQuestionId(null);
    setEditImageUrls({ question: '', explanation: '' });
    setQuestionImagePreview(null);
    setExplanationImagePreview(null);
  };

  // Bulk delete handler
  async function handleBulkDelete() {
    if (selectedQuestions.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase.from('questions').delete().in('id', selectedQuestions);
      if (deleteError) throw deleteError;
      setSelectedQuestions([]);
      setSelectAll(false);
      setLoading(true);
      const data = await fetchAllQuestionsFromSupabase();
      setQuestions(data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete questions.');
    }
    setSaving(false);
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions([]);
      setSelectAll(false);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
      setSelectAll(true);
    }
  };

  // Handle select one
  const handleSelectOne = (id: string) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-48 bg-white border-r flex flex-col py-8 px-4 min-h-screen">
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
          <div className="flex gap-2">
            <button
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              onClick={handleBulkDelete}
              disabled={selectedQuestions.length === 0 || saving}
            >
              Delete Questions
            </button>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              onClick={() => setAddModalOpen(true)}
            >
              Add Question
            </button>
          </div>
        </div>
        {/* Table of questions */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading questions...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2"></th>
                  <th className="py-3 px-2 font-semibold text-gray-700 text-left capitalize">Question</th>
                  <th className="py-3 px-2 font-semibold text-gray-700 text-left capitalize">Section</th>
                  <th className="py-3 px-2 font-semibold text-gray-700 text-left capitalize">Difficulty</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b hover:bg-gray-50 group align-middle">
                    <td className="py-3 px-2 align-middle">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(q.id)}
                        onChange={() => handleSelectOne(q.id)}
                      />
                    </td>
                    <td className="py-3 px-2 flex items-center gap-1 align-middle text-left capitalize">
                      {q.question_text}
                    </td>
                    <td className="py-3 px-2 align-middle text-left capitalize">{q.category}</td>
                    <td className="py-3 px-2 align-middle text-left capitalize">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{q.difficulty || '-'}</span>
                    </td>
                    <td className="py-3 px-4 text-right relative align-middle">
                      <button
                        className={`p-2 rounded-full hover:bg-gray-100 ${dropdownOpen === q.id ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setDropdownOpen(dropdownOpen === q.id ? null : q.id)}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
                      </button>
                      {dropdownOpen === q.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setDropdownOpen(null); handleEditQuestion(q); }}>Edit</button>
                          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setDropdownOpen(null); handleDuplicateQuestion(q); }}>Duplicate</button>
                          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={() => { setDropdownOpen(null); handleDeleteQuestion(q); }}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Delete confirmation modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-sm relative my-8 p-8">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-6">Are you sure you want to delete this question? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={confirmDeleteQuestion} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg w-1/2 relative my-8 max-h-[90vh] flex flex-col p-[20px]">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 mt-4">Add New Question</h2>
              <form
                onSubmit={handleSaveQuestion}
                className="space-y-4 overflow-y-auto px-1 pb-4 flex-1"
                style={{ maxHeight: '70vh' }}
              >
                {/* Category Dropdown */}
                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select category</option>
                    {sectionOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                {/* Difficulty Dropdown */}
                <div>
                  <label className="block font-medium mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select difficulty</option>
                    {difficultyOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {/* Question Text */}
                <div>
                  <label className="block font-medium mb-1">Question</label>
                  <textarea
                    value={form.question_text}
                    onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    rows={2}
                    required
                  />
                </div>
                {/* Question Image Upload */}
                <div>
                  <label className="block font-medium mb-1">Question Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setForm(f => ({ ...f, image_file: file }));
                      if (file) {
                        setQuestionImagePreview(URL.createObjectURL(file));
                      } else {
                        setQuestionImagePreview(null);
                      }
                    }}
                  />
                  {(questionImagePreview || editImageUrls.question) && (
                    <div className="mt-2">
                      <img
                        src={questionImagePreview || editImageUrls.question}
                        alt="Question"
                        width={200}
                        height={200}
                        style={{ objectFit: 'contain', borderRadius: 8, border: '1px solid #eee' }}
                        onError={e => { 
                          console.log('Question image failed to load:', e.currentTarget.src);
                          e.currentTarget.style.display = 'none'; 
                        }}
                        onLoad={() => {
                          console.log('Question image loaded successfully');
                          console.log('Rendering question image. Preview:', questionImagePreview, 'Edit URL:', editImageUrls.question);
                        }}
                      />
                    </div>
                  )}
                </div>
                {/* Multiple Choice Answers */}
                <div>
                  <label className="block font-medium mb-1">Multiple Choice Answers</label>
                  <div className="space-y-2">
                    {form.options.map((ans, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={ans}
                        onChange={e => setForm(f => {
                          const options = [...f.options];
                          options[idx] = e.target.value;
                          return { ...f, options };
                        })}
                        className="w-full border rounded px-3 py-2"
                        placeholder={`Answer ${idx + 1}`}
                        required
                      />
                    ))}
                  </div>
                </div>
                {/* Correct Answer */}
                <div>
                  <label className="block font-medium mb-1">Correct Answer</label>
                  <input
                    type="text"
                    value={form.correct_answer}
                    onChange={e => setForm(f => ({ ...f, correct_answer: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                {/* Explanation (optional) */}
                <div>
                  <label className="block font-medium mb-1">Answer Explanation (optional)</label>
                  <textarea
                    value={form.explanation}
                    onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    rows={2}
                  />
                </div>
                {/* Explanation Image Upload (optional) */}
                <div>
                  <label className="block font-medium mb-1">Answer Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setForm(f => ({ ...f, explanation_image_file: file }));
                      if (file) {
                        setExplanationImagePreview(URL.createObjectURL(file));
                      } else {
                        setExplanationImagePreview(null);
                      }
                    }}
                  />
                  {(explanationImagePreview || editImageUrls.explanation) && (
                    <div className="mt-2">
                      <img
                        src={explanationImagePreview || editImageUrls.explanation}
                        alt="Answer"
                        width={200}
                        height={200}
                        style={{ objectFit: 'contain', borderRadius: 8, border: '1px solid #eee' }}
                        onError={e => { 
                          console.log('Explanation image failed to load:', e.currentTarget.src);
                          e.currentTarget.style.display = 'none'; 
                        }}
                        onLoad={() => {
                          console.log('Explanation image loaded successfully');
                          console.log('Rendering explanation image. Preview:', explanationImagePreview, 'Edit URL:', editImageUrls.explanation);
                        }}
                      />
                    </div>
                  )}
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 