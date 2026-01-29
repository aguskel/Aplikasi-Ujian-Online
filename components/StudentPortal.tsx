
import React, { useState } from 'react';
import { Exam } from '../types';
import { KeyRound, ShieldAlert, ArrowRight, Camera } from 'lucide-react';

interface Props {
  exams: Exam[];
  onStartExam: (exam: Exam) => void;
}

const StudentPortal: React.FC<Props> = ({ exams, onStartExam }) => {
  const [token, setToken] = useState('');
  const [examIdInput, setExamIdInput] = useState('');
  const [error, setError] = useState('');

  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const exam = exams.find(ex => ex.id === examIdInput || ex.token === token);
    
    if (!exam) {
      setError('Ujian tidak ditemukan. Periksa kembali ID atau Token.');
      return;
    }

    if (exam.token !== token) {
      setError('Token salah. Silakan minta token kepada guru Anda.');
      return;
    }

    setError('');
    onStartExam(exam);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <KeyRound className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Akses Ujian</h2>
          <p className="text-emerald-100 text-sm mt-1">Masukkan detail untuk mulai mengerjakan.</p>
        </div>

        <form onSubmit={handleManualJoin} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">ID Ujian / Scan QR</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={examIdInput}
                  onChange={e => setExamIdInput(e.target.value)}
                  placeholder="ID Ujian (Contoh: abc123def)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none pr-12 transition-all"
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600"
                  title="Gunakan Kamera (Fitur simulasi)"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Token Masuk</label>
              <input 
                type="text" 
                maxLength={6}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="4-6 Digit Token"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center font-mono text-xl tracking-widest transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 animate-pulse">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95 group"
          >
            Mulai Ujian <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="text-center">
            <p className="text-xs text-slate-400 italic">
              Pastikan koneksi internet stabil sebelum menekan tombol mulai.
            </p>
          </div>
        </form>
      </div>

      <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-amber-800">Perhatian: Lockdown Mode</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Selama ujian berlangsung, Anda dilarang meninggalkan halaman aplikasi. Keluar dari fullscreen atau mengganti tab dapat membatalkan sesi ujian Anda secara otomatis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
