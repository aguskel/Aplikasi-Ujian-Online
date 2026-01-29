
import React, { useState, useEffect } from 'react';
import { UserRole, Exam, StudentResult } from './types';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';
import ExamRunner from './components/ExamRunner';
import { ShieldCheck, BookOpen, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [isTakingExam, setIsTakingExam] = useState(false);

  // Persistence (Mock Database)
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('exams');
    return saved ? JSON.parse(saved) : [];
  });

  const [results, setResults] = useState<StudentResult[]>(() => {
    const saved = localStorage.getItem('results');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('results', JSON.stringify(results));
  }, [results]);

  // Check for hash-based routing (for QR code login)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/exam/')) {
        const examId = hash.replace('#/exam/', '');
        const found = exams.find(e => e.id === examId);
        if (found) {
          setActiveExam(found);
          setRole('SISWA');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [exams]);

  const handleFinishExam = (result: StudentResult) => {
    setResults(prev => [...prev, result]);
    setExams(prev => prev.map(e => 
      e.id === result.examId ? { ...e, totalResults: e.totalResults + 1 } : e
    ));
    setIsTakingExam(false);
  };

  if (isTakingExam && activeExam) {
    return (
      <ExamRunner 
        exam={activeExam} 
        onFinish={handleFinishExam} 
        onCancel={() => setIsTakingExam(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            ExamPro <span className="text-indigo-600">Online</span>
          </h1>
        </div>
        
        {role && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 uppercase">
              {role}
            </span>
            <button 
              onClick={() => { setRole(null); setActiveExam(null); }}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {!role ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[70vh]">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Selamat Datang di ExamPro</h2>
              <p className="text-slate-600 max-w-lg mx-auto">Sistem manajemen ujian modern yang aman, cepat, dan mudah digunakan untuk Guru & Siswa.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
              <button 
                onClick={() => setRole('GURU')}
                className="group p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-600 hover:shadow-xl transition-all flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Pintu Masuk Guru</h3>
                <p className="text-sm text-slate-500">Kelola soal, lihat hasil ujian, dan buat barkot akses.</p>
              </button>

              <button 
                onClick={() => setRole('SISWA')}
                className="group p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-600 hover:shadow-xl transition-all flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Pintu Masuk Siswa</h3>
                <p className="text-sm text-slate-500">Mulai mengerjakan ujian dengan token atau scan barkot.</p>
              </button>
            </div>
          </div>
        ) : role === 'GURU' ? (
          <TeacherDashboard 
            exams={exams} 
            results={results}
            setExams={setExams} 
          />
        ) : (
          <StudentPortal 
            exams={exams} 
            onStartExam={(exam) => {
              setActiveExam(exam);
              setIsTakingExam(true);
            }} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} ExamPro Online. Solusi Ujian Digital Terintegrasi.
      </footer>
    </div>
  );
};

export default App;
