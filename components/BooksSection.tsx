
import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { Book } from '../types';
import { FileText, Download, Plus, Trash2, Book as BookIcon, Eye, X, BookOpen, Sparkles } from 'lucide-react';

interface BooksSectionProps {
  onBack?: () => void;
}

// Placeholder initial books to populate the library
const INITIAL_BOOKS: Book[] = [
  {
    id: 'placeholder-1',
    title: 'The Sealed Nectar (Ar-Raheeq Al-Makhtum)',
    fileName: 'sealed_nectar.pdf',
    data: '' // In a real app, this would be a URL or imported resource
  },
  {
    id: 'placeholder-2',
    title: 'Riyadhus Saliheen (The Meadows of the Righteous)',
    fileName: 'riyadhus_saliheen.pdf',
    data: ''
  },
  {
    id: 'placeholder-3',
    title: 'Fortress of the Muslim (Hisnul Muslim)',
    fileName: 'hisnul_muslim.pdf',
    data: ''
  }
];

const BooksSection: React.FC<BooksSectionProps> = ({ onBack }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_books');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Combine stored books with placeholders if library is low on content
        setBooks(parsed.length > 0 ? parsed : INITIAL_BOOKS);
      } catch (e) {
        setBooks(INITIAL_BOOKS);
      }
    } else {
      setBooks(INITIAL_BOOKS);
      localStorage.setItem('app_books', JSON.stringify([]));
    }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newBook: Book = {
          id: Date.now().toString(),
          title: file.name.replace('.pdf', ''),
          fileName: file.name,
          data: reader.result as string
        };
        const updated = [newBook, ...books];
        setBooks(updated);
        localStorage.setItem('app_books', JSON.stringify(updated.filter(b => !b.id.startsWith('placeholder-'))));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteBook = (id: string) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    localStorage.setItem('app_books', JSON.stringify(updated.filter(b => !b.id.startsWith('placeholder-'))));
  };

  return (
    <div className="animate-fade-in relative min-h-full pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <SectionHeader 
          title="Library of Knowledge" 
          subtitle="Expand your understanding through curated Islamic literature." 
          onBack={onBack}
        />
        <label className="flex items-center space-x-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C76B] hover:to-[#D4AF37] text-black px-8 py-4 rounded-2xl cursor-pointer transition-all font-black shadow-xl shadow-amber-900/20 active:scale-95 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-xs uppercase tracking-widest">Upload PDF</span>
          <input type="file" className="hidden" accept="application/pdf" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book) => (
          <div key={book.id} className="flex flex-col p-8 bg-neutral-900/40 border border-emerald-900/10 rounded-[2.5rem] hover:border-emerald-500/30 transition-all group backdrop-blur-md relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="flex items-start gap-5 mb-8">
              <div className="bg-emerald-900/20 p-5 rounded-[1.5rem] text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500 border border-emerald-500/10">
                <FileText size={32} strokeWidth={1.5} />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xl font-playfair font-bold text-white truncate mb-1 group-hover:text-[#D4AF37] transition-colors">{book.title}</h3>
                <p className="text-[10px] text-neutral-500 truncate font-black uppercase tracking-widest opacity-60">
                  {book.id.startsWith('placeholder-') ? 'Suggested Reading' : book.fileName}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-auto">
              <button 
                onClick={() => setActiveReadingBook(book)}
                disabled={!book.data && book.id.startsWith('placeholder-')}
                className={`
                  w-full py-4 rounded-xl transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-lg
                  ${!book.data && book.id.startsWith('placeholder-') 
                    ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'}
                `}
              >
                <Eye size={18} />
                <span>Read Now</span>
              </button>
              
              <div className="flex gap-3">
                <a 
                  href={book.data || '#'} 
                  download={book.fileName}
                  onClick={(e) => (!book.data && book.id.startsWith('placeholder-')) && e.preventDefault()}
                  className={`flex-1 p-4 rounded-xl transition-all border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                    !book.data && book.id.startsWith('placeholder-')
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-700 cursor-not-allowed'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-[#D4AF37]/40'
                  }`}
                >
                  <Download size={16} /> Save
                </a>
                {!book.id.startsWith('placeholder-') && (
                  <button 
                    onClick={() => deleteBook(book.id)}
                    className="p-4 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {book.id.startsWith('placeholder-') && !book.data && (
              <div className="mt-4 flex items-center gap-2 justify-center opacity-40">
                <Sparkles size={12} className="text-[#D4AF37]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Sample entry</span>
              </div>
            )}
          </div>
        ))}

        {books.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-neutral-600 border-2 border-dashed border-neutral-800 rounded-[3rem] bg-black/20">
            <BookIcon size={64} className="mb-6 opacity-10" />
            <p className="font-playfair text-2xl text-neutral-400 mb-2">No Books Found</p>
            <p className="text-sm opacity-50 tracking-widest font-amiri italic">Illuminate your path by uploading spiritual knowledge.</p>
          </div>
        )}
      </div>

      {/* Full-screen Reader Modal */}
      {activeReadingBook && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in overflow-hidden">
          {/* Reader Toolbar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-emerald-900/20 bg-black/90 backdrop-blur-2xl">
            <div className="flex items-center gap-5 min-w-0">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                <BookOpen size={24} />
              </div>
              <div className="min-w-0">
                <h4 className="text-white font-bold truncate text-lg leading-none mb-1">{activeReadingBook.title}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">Reading Mode</span>
                  <div className="w-1 h-1 bg-neutral-800 rounded-full" />
                  <p className="text-[10px] text-neutral-500 font-mono tracking-tighter truncate uppercase">{activeReadingBook.fileName}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               {activeReadingBook.data && (
                 <a 
                  href={activeReadingBook.data} 
                  download={activeReadingBook.fileName}
                  className="hidden md:flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-[#D4AF37] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[#D4AF37]/20"
                >
                  <Download size={16} /> Save Offline
                </a>
               )}
              <button 
                onClick={() => setActiveReadingBook(null)}
                className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-2xl transition-all shadow-xl shadow-red-900/40 active:scale-90"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Reader Content */}
          <div className="flex-grow bg-[#050505] relative flex flex-col items-center justify-center">
            {activeReadingBook.data ? (
              <iframe 
                src={`${activeReadingBook.data}#toolbar=0&view=FitH`}
                className="w-full h-full border-none"
                title={activeReadingBook.title}
              />
            ) : (
              <div className="text-center space-y-6 max-w-md px-10">
                <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mx-auto text-neutral-800">
                  <FileText size={48} />
                </div>
                <h5 className="text-white text-xl font-bold font-playfair italic">Placeholder Content</h5>
                <p className="text-neutral-500 text-sm leading-relaxed font-amiri">
                  This is a placeholder entry. To read a full book, please upload your own PDF file using the "Upload" button in the library.
                </p>
                <button 
                  onClick={() => setActiveReadingBook(null)}
                  className="px-10 py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"
                >
                  Return to Library
                </button>
              </div>
            )}
          </div>

          {/* Reader Footer */}
          <div className="px-8 py-4 border-t border-emerald-900/10 bg-black flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-neutral-700 font-amiri tracking-[0.4em] uppercase order-2 md:order-1">
              "Read! In the name of your Lord who created"
            </p>
            <div className="flex items-center gap-2 order-1 md:order-2">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">The Way of Success</span>
              <div className="w-1 h-1 bg-emerald-500/20 rounded-full" />
              <span className="text-[9px] font-black text-neutral-800 uppercase tracking-widest">Library Reader v2.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksSection;
