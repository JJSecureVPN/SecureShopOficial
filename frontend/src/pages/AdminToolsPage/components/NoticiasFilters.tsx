import { Search, Filter } from 'lucide-react';
import type { NoticiaCategoria } from '../../../types';

interface NoticiasFiltersProps {
  categorias: NoticiaCategoria[];
  selectedCategoria: string;
  onCategoriaChange: (categoria: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function NoticiasFilters({
  categorias,
  selectedCategoria,
  onCategoriaChange,
  searchTerm,
  onSearchChange,
}: NoticiasFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-4 flex-1 w-full lg:w-auto">
      {/* Buscador de Inteligencia */}
      <div className="relative group flex-1 min-w-[280px]">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-300" />
        <input
          type="text"
          placeholder="Rastrear registros..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 text-[11px] font-black uppercase tracking-widest text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500/50 transition-all duration-300 focus:bg-zinc-950/60 shadow-inner"
        />
        <div className="absolute inset-0 rounded-2xl bg-orange-500/0 group-focus-within:bg-orange-500/[0.02] transition-colors pointer-events-none" />
      </div>

      {/* Selector de Clasificación */}
      <div className="relative group min-w-[200px]">
        <Filter className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-orange-500 transition-colors duration-300" />
        <select
          value={selectedCategoria}
          onChange={(e) => onCategoriaChange(e.target.value)}
          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 text-[10px] font-black uppercase tracking-widest text-zinc-400 appearance-none focus:outline-none focus:border-orange-500/50 transition-all duration-300 cursor-pointer hover:bg-zinc-950/60"
        >
          <option value="" className="bg-zinc-900">Categoría: Global</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-zinc-900">
              {cat.nombre}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 group-hover:text-orange-500/50 transition-all">
           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
}
