
import React, { useState, useEffect, useCallback } from 'react';
import { Exam, StudentResult, QuestionType, Question } from '../types';
import { ShieldAlert, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Send, HelpCircle } from 'lucide-react';

interface Props {
  exam: Exam;
  onFinish: (result: StudentResult) => void;
  onCancel: () => void;
}

const ExamRunner: React.FC<Props> = ({ exam, onFinish, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  // Lockdown simulation
  useEffect(() => {
    if (!hasStarted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isFinished) {
        setWarnings(prev => prev + 1);
        alert("PERINGATAN: Jangan meninggalkan halaman ujian!");
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFinished) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Request fullscreen for "Lockdown"
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } catch (e) { console.warn("Fullscreen rejected"); }

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasStarted, isFinished]);

  const calculateScore = () => {
    let totalScore = 0;
    let maxPossible = 0;

    exam.questions.forEach(q => {
      maxPossible += q.weight;
      const userAns = answers[q.id];
      
      if (q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.TRUE_FALSE || q.type === QuestionType.AGREE_DISAGREE) {
        if (userAns === q.correctAnswer) totalScore += q.weight;
      } else if (q.type === QuestionType.COMPLEX_CHOICE) {
        // Compare arrays
        const correct = (q.correctAnswer as string[]) || [];
        const user = (userAns as string[]) || [];
        if (correct.length === user.length && correct.every(v => user.includes(v))) {
          totalScore += q.weight;
        }
      } else if (q.type === QuestionType.MATCHING) {
        // Very basic matching score: all pairs must match
        // In a real app, partial credit could be awarded
        const correctMap = q.matchingPairs?.reduce((acc, p) => ({ ...acc, [p.left]: p.right }), {}) || {};
        const userMap = (userAns as Record<string, string>) || {};
        let allMatch = true;
        Object.keys(correctMap).forEach(key => {
          if (userMap[key] !== (correctMap as any)[key]) allMatch = false;
        });
        if (allMatch && Object.keys(userMap).length > 0) totalScore += q.weight;
      }
    });

    return { totalScore, maxPossible };
  };

  const submitExam = () => {
    if (confirm("Apakah Anda yakin ingin mengakhiri ujian?")) {
      const { totalScore, maxPossible } = calculateScore();
      const result: StudentResult = {
        id: Math.random().toString(36).substr(2, 9),
        examId: exam.id,
        studentName: studentName || 'Anonim',
        studentId: 'SIS-' + Math.floor(1000 + Math.random() * 9000),
        score: totalScore,
        totalPossibleScore: maxPossible,
        answers: answers,
        timestamp: Date.now()
      };
      setIsFinished(true);
      if (document.exitFullscreen) {
        try { document.exitFullscreen(); } catch (e) {}
      }
      onFinish(result);
    }
  };

  const handleSetAnswer = (qId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const currentQ = exam.questions[currentIdx];

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
          <div className="text-center">
             <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-indigo-600" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800">Siap Untuk Memulai?</h2>
             <p className="text-slate-500 mt-2">Ujian: <span className="font-bold">{exam.title}</span></p>
          </div>

          <div className="space-y-4 py-4">
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Lengkap</label>
               <input 
                type="text" 
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Masukkan nama Anda..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
               />
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
               <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
               <p className="text-xs text-amber-700 leading-relaxed">
                 Dengan mengklik "Mulai", aplikasi akan masuk ke mode layar penuh. Jangan berpindah jendela aplikasi.
               </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors">Batal</button>
            <button 
              disabled={!studentName}
              onClick={() => setHasStarted(true)} 
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mulai Sekarang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col h-full select-none overflow-hidden">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold border border-white/5">
            {currentIdx + 1} / {exam.questions.length}
          </div>
          <h1 className="font-bold text-sm hidden md:block">{exam.title}</h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-rose-400">
             <ShieldAlert className="w-4 h-4" />
             <span className="text-xs font-bold">WARNINGS: {warnings}</span>
           </div>
           <button 
            onClick={submitExam}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
           >
             SELESAI <Send className="w-3 h-3" />
           </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
          style={{ width: `${((currentIdx + 1) / exam.questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sidebar Nav (Desktop Only) */}
        <div className="hidden md:flex w-72 bg-slate-50 border-r border-slate-200 overflow-y-auto p-6 flex-col gap-4">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigasi Soal</h3>
           <div className="grid grid-cols-4 gap-2">
              {exam.questions.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                    currentIdx === i 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : answers[exam.questions[i].id] 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
           </div>
           
           <div className="mt-auto p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <div className="flex items-center gap-2 text-indigo-700 mb-1">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-bold">Info Siswa</span>
              </div>
              <p className="text-xs text-indigo-600 font-medium">{studentName}</p>
           </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-100 tracking-widest uppercase">
                PERTANYAAN #{currentIdx + 1} ({currentQ.weight} Poin)
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                {currentQ.prompt || "Isi soal tidak tersedia."}
              </h2>
            </div>

            <div className="grid gap-4">
              {/* Question Logic */}
              {(currentQ.type === QuestionType.SINGLE_CHOICE || currentQ.type === QuestionType.COMPLEX_CHOICE) && (
                <div className="space-y-3">
                  {currentQ.options?.map((opt, i) => {
                    const isSelected = currentQ.type === QuestionType.SINGLE_CHOICE 
                      ? answers[currentQ.id] === opt
                      : (answers[currentQ.id] || []).includes(opt);
                    
                    return (
                      <button 
                        key={i}
                        onClick={() => {
                          if (currentQ.type === QuestionType.SINGLE_CHOICE) {
                            handleSetAnswer(currentQ.id, opt);
                          } else {
                            const cur = (answers[currentQ.id] || []);
                            const next = cur.includes(opt) ? cur.filter((x: any) => x !== opt) : [...cur, opt];
                            handleSetAnswer(currentQ.id, next);
                          }
                        }}
                        className={`w-full p-5 text-left rounded-2xl border-2 transition-all flex items-center gap-4 ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-600 shadow-md translate-x-1' 
                            : 'bg-white border-slate-100 hover:border-indigo-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === QuestionType.SHORT_ANSWER && (
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-400">JAWABAN ANDA</label>
                  <input 
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={e => handleSetAnswer(currentQ.id, e.target.value)}
                    className="w-full p-6 text-xl bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-colors font-medium"
                    placeholder="Ketik jawaban di sini..."
                  />
                </div>
              )}

              {currentQ.type === QuestionType.MATCHING && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 italic">Pilih pasangan yang sesuai untuk setiap item di sisi kiri.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       {currentQ.matchingPairs?.map(pair => (
                         <div key={pair.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-slate-700">{pair.left}</span>
                            <select 
                              className="px-3 py-1 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                              value={answers[currentQ.id]?.[pair.left] || ''}
                              onChange={e => {
                                const cur = answers[currentQ.id] || {};
                                handleSetAnswer(currentQ.id, { ...cur, [pair.left]: e.target.value });
                              }}
                            >
                              <option value="">Pilih...</option>
                              {currentQ.matchingPairs?.map(p => <option key={p.id} value={p.right}>{p.right}</option>)}
                            </select>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {(currentQ.type === QuestionType.TRUE_FALSE || currentQ.type === QuestionType.AGREE_DISAGREE) && (
                <div className="grid grid-cols-2 gap-4">
                  {['TRUE', 'FALSE'].map(val => (
                    <button 
                      key={val}
                      onClick={() => handleSetAnswer(currentQ.id, val)}
                      className={`p-10 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${
                        answers[currentQ.id] === val
                          ? 'bg-indigo-50 border-indigo-600 shadow-lg scale-[1.02]'
                          : 'bg-white border-slate-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${answers[currentQ.id] === val ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {val === 'TRUE' ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                      </div>
                      <span className="text-xl font-bold text-slate-800 uppercase">
                        {val === 'TRUE' 
                          ? (currentQ.type === QuestionType.TRUE_FALSE ? 'BENAR' : 'SESUAI') 
                          : (currentQ.type === QuestionType.TRUE_FALSE ? 'SALAH' : 'TIDAK SESUAI')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Bottom Bar (Mobile Only) */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 flex gap-2 md:p-6 justify-between items-center sticky bottom-0">
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex gap-2">
            <span className="text-xs text-white/50 font-medium">Soal {currentIdx + 1} dari {exam.questions.length}</span>
          </div>

          <button 
            disabled={currentIdx === exam.questions.length - 1}
            onClick={() => setCurrentIdx(prev => prev + 1)}
            className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamRunner;
