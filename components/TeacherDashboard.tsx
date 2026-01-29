
import React, { useState } from 'react';
import { Exam, StudentResult, QuestionType, Question, MatchingPair } from '../types';
import { Plus, Trash2, Edit3, QrCode, ClipboardList, ChevronRight, X, Save, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  exams: Exam[];
  results: StudentResult[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
}

const TeacherDashboard: React.FC<Props> = ({ exams, results, setExams }) => {
  const [activeTab, setActiveTab] = useState<'EXAMS' | 'RESULTS'>('EXAMS');
  const [showEditor, setShowEditor] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const handleDeleteExam = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus ujian ini? Semua data terkait akan hilang.')) {
      setExams(prev => prev.filter(e => e.id !== id));
    }
  };

  const openEditor = (exam?: Exam) => {
    if (exam && exam.totalResults > 0) {
      alert("Soal tidak dapat diubah karena sudah ada siswa yang mengerjakan.");
      return;
    }
    setEditingExam(exam || {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      token: Math.floor(1000 + Math.random() * 9000).toString(),
      questions: [],
      createdAt: Date.now(),
      totalResults: 0
    });
    setShowEditor(true);
  };

  const handleSaveExam = (exam: Exam) => {
    if (exams.find(e => e.id === exam.id)) {
      setExams(prev => prev.map(e => e.id === exam.id ? exam : e));
    } else {
      setExams(prev => [exam, ...prev]);
    }
    setShowEditor(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Guru</h2>
          <p className="text-slate-500">Kelola kurikulum dan pantau performa siswa.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('EXAMS')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'EXAMS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Daftar Ujian
          </button>
          <button 
            onClick={() => setActiveTab('RESULTS')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'RESULTS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Hasil Siswa
          </button>
        </div>
      </div>

      {activeTab === 'EXAMS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Exam Button */}
          <button 
            onClick={() => openEditor()}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-400 group"
          >
            <Plus className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-600">Buat Ujian Baru</span>
          </button>

          {exams.map(exam => (
            <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{exam.title}</h3>
                    <p className="text-xs text-slate-500">Token: <span className="font-mono font-bold text-indigo-600">{exam.token}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditor(exam)}
                      className={`p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors ${exam.totalResults > 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      title="Edit Soal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, (exam.questions.length / 500) * 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{exam.questions.length}/500 Soal</span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>{exam.totalResults} Siswa mengerjakan</span>
                  </div>
                  <div className="group relative">
                    <button className="p-2 bg-slate-100 rounded-lg hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 transition-colors">
                      <QrCode className="w-5 h-5" />
                    </button>
                    {/* Tooltip with QR */}
                    <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 p-4 bg-white shadow-2xl rounded-xl border border-slate-200 z-50 w-48 text-center">
                      <p className="text-[10px] font-bold text-slate-700 mb-2">Scan untuk Mengerjakan</p>
                      <div className="flex justify-center mb-2">
                        <QRCodeSVG value={`${window.location.origin}${window.location.pathname}#/exam/${exam.id}`} size={120} />
                      </div>
                      <p className="text-[8px] text-slate-400">ID: {exam.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
             <h3 className="font-bold text-slate-700">Laporan Hasil Ujian</h3>
             <select 
               className="text-sm border-slate-200 rounded-lg px-2 py-1 outline-none"
               onChange={(e) => setSelectedExamId(e.target.value)}
             >
               <option value="">Semua Ujian</option>
               {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
             </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Siswa</th>
                  <th className="px-6 py-4">Ujian</th>
                  <th className="px-6 py-4">Skor</th>
                  <th className="px-6 py-4">Persentase</th>
                  <th className="px-6 py-4">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.filter(r => !selectedExamId || r.examId === selectedExamId).map(result => (
                  <tr key={result.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{result.studentName}</div>
                      <div className="text-xs text-slate-400">ID: {result.studentId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{exams.find(e => e.id === result.examId)?.title || 'Ujian Terhapus'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-indigo-600">{result.score} / {result.totalPossibleScore}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${result.score/result.totalPossibleScore >= 0.7 ? 'text-emerald-600' : 'text-orange-500'}`}>
                          {Math.round((result.score / result.totalPossibleScore) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(result.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Belum ada hasil yang masuk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exam Editor Modal */}
      {showEditor && editingExam && (
        <ExamEditor 
          exam={editingExam} 
          onSave={handleSaveExam} 
          onClose={() => setShowEditor(false)} 
        />
      )}
    </div>
  );
};

// Internal component for Editing
const ExamEditor: React.FC<{ exam: Exam, onSave: (e: Exam) => void, onClose: () => void }> = ({ exam, onSave, onClose }) => {
  const [data, setData] = useState<Exam>(exam);

  const addQuestion = () => {
    if (data.questions.length >= 500) {
      alert("Maksimal 500 soal tercapai.");
      return;
    }
    const newQ: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type: QuestionType.SINGLE_CHOICE,
      prompt: '',
      options: ['Opsi 1', 'Opsi 2'],
      correctAnswer: '',
      weight: 1
    };
    setData({ ...data, questions: [...data.questions, newQ] });
  };

  const removeQuestion = (id: string) => {
    setData({ ...data, questions: data.questions.filter(q => q.id !== id) });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setData({
      ...data,
      questions: data.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Ujian</h2>
            <p className="text-sm text-slate-500">Sesuaikan konten dan bobot nilai soal.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
            <button 
              onClick={() => {
                if (!data.title) return alert("Judul wajib diisi");
                onSave(data);
              }} 
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan Ujian
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">
          {/* Header Info */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Judul Ujian</label>
                <input 
                  type="text" 
                  value={data.title} 
                  onChange={e => setData({...data, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Contoh: Matematika Semester 1"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi</label>
                <textarea 
                  rows={2}
                  value={data.description} 
                  onChange={e => setData({...data, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                  placeholder="Penjelasan singkat tentang ujian..."
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Token Masuk</label>
                <input 
                  type="text" 
                  value={data.token} 
                  onChange={e => setData({...data, token: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-indigo-600 font-bold" 
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">Maksimal soal adalah 500. Setiap soal memiliki bobot nilai kustom.</p>
              </div>
            </div>
          </section>

          {/* Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
              Konten Pertanyaan
              <span className="text-xs font-medium text-slate-400">{data.questions.length} / 500</span>
            </h3>

            {data.questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative group">
                <button 
                  onClick={() => removeQuestion(q.id)}
                  className="absolute -right-2 -top-2 w-8 h-8 bg-white border border-red-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                       <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">{idx + 1}</span>
                       <select 
                        value={q.type}
                        onChange={e => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                        className="text-sm font-bold text-slate-700 border-none bg-slate-100 px-3 py-1 rounded-lg outline-none cursor-pointer"
                       >
                         <option value={QuestionType.SINGLE_CHOICE}>Pilihan Ganda Tunggal</option>
                         <option value={QuestionType.COMPLEX_CHOICE}>Pilihan Ganda Kompleks</option>
                         <option value={QuestionType.TRUE_FALSE}>Benar / Salah</option>
                         <option value={QuestionType.AGREE_DISAGREE}>Sesuai / Tidak Sesuai</option>
                         <option value={QuestionType.SHORT_ANSWER}>Isian Singkat</option>
                         <option value={QuestionType.MATCHING}>Menjodohkan</option>
                       </select>
                    </div>
                    <textarea 
                      placeholder="Ketik pertanyaan di sini..."
                      value={q.prompt}
                      onChange={e => updateQuestion(q.id, { prompt: e.target.value })}
                      className="w-full text-lg font-semibold text-slate-800 bg-transparent border-none outline-none resize-none focus:ring-0"
                    />
                  </div>
                  <div className="md:w-32">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">BOBOT NILAI</label>
                    <input 
                      type="number"
                      value={q.weight}
                      onChange={e => updateQuestion(q.id, { weight: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-700"
                    />
                  </div>
                </div>

                {/* Sub-Editor based on type */}
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                   {/* This is simplified for space, usually you'd have more elaborate inputs here */}
                   {(q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.COMPLEX_CHOICE) && (
                     <div className="space-y-2">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input 
                              type={q.type === QuestionType.SINGLE_CHOICE ? "radio" : "checkbox"} 
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" 
                              name={`correct-${q.id}`}
                              checked={Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(opt) : q.correctAnswer === opt}
                              onChange={() => {
                                if (q.type === QuestionType.SINGLE_CHOICE) {
                                  updateQuestion(q.id, { correctAnswer: opt });
                                } else {
                                  const cur = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
                                  const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt];
                                  updateQuestion(q.id, { correctAnswer: next });
                                }
                              }}
                            />
                            <input 
                              type="text" 
                              value={opt}
                              onChange={e => {
                                const newOpts = [...(q.options || [])];
                                newOpts[oIdx] = e.target.value;
                                updateQuestion(q.id, { options: newOpts });
                              }}
                              className="flex-1 bg-transparent border-none text-sm outline-none focus:ring-0 py-1"
                            />
                          </div>
                        ))}
                        <button 
                          onClick={() => updateQuestion(q.id, { options: [...(q.options || []), `Opsi ${(q.options?.length || 0) + 1}`] })}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >+ Tambah Opsi</button>
                     </div>
                   )}
                   {q.type === QuestionType.SHORT_ANSWER && (
                     <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400">Kunci Jawaban</label>
                        <input 
                          type="text" 
                          value={q.correctAnswer}
                          onChange={e => updateQuestion(q.id, { correctAnswer: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                          placeholder="Ketik jawaban yang benar..."
                        />
                     </div>
                   )}
                   {q.type === QuestionType.MATCHING && (
                     <div className="space-y-2">
                        {q.matchingPairs?.map((pair, pIdx) => (
                          <div key={pair.id} className="flex gap-2">
                            <input 
                              type="text" 
                              value={pair.left}
                              onChange={e => {
                                const pairs = [...(q.matchingPairs || [])];
                                pairs[pIdx] = { ...pair, left: e.target.value };
                                updateQuestion(q.id, { matchingPairs: pairs });
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                              placeholder="Kiri"
                            />
                            <span className="text-slate-300">→</span>
                            <input 
                              type="text" 
                              value={pair.right}
                              onChange={e => {
                                const pairs = [...(q.matchingPairs || [])];
                                pairs[pIdx] = { ...pair, right: e.target.value };
                                updateQuestion(q.id, { matchingPairs: pairs });
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                              placeholder="Kanan"
                            />
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newPair = { id: Math.random().toString(), left: '', right: '' };
                            updateQuestion(q.id, { matchingPairs: [...(q.matchingPairs || []), newPair] });
                          }}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >+ Tambah Pasangan</button>
                     </div>
                   )}
                   {(q.type === QuestionType.TRUE_FALSE || q.type === QuestionType.AGREE_DISAGREE) && (
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`tf-${q.id}`} 
                            checked={q.correctAnswer === 'TRUE'}
                            onChange={() => updateQuestion(q.id, { correctAnswer: 'TRUE' })}
                          />
                          <span className="text-sm font-medium">{q.type === QuestionType.TRUE_FALSE ? 'Benar' : 'Sesuai'}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`tf-${q.id}`} 
                            checked={q.correctAnswer === 'FALSE'}
                            onChange={() => updateQuestion(q.id, { correctAnswer: 'FALSE' })}
                          />
                          <span className="text-sm font-medium">{q.type === QuestionType.TRUE_FALSE ? 'Salah' : 'Tidak Sesuai'}</span>
                        </label>
                     </div>
                   )}
                </div>
              </div>
            ))}

            <button 
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all font-bold"
            >
              <Plus className="w-5 h-5" /> Tambah Pertanyaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
