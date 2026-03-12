import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = 'Pesquisar...' }: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
      />
    </div>
  );
};
