'use client';

import { Option } from '@/types/game';

interface OptionsListProps {
  options: Option[];
  onSelect: (option: Option) => void;
  disabled?: boolean;
}

export function OptionsList({ options, onSelect, disabled }: OptionsListProps) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <button
          key={option.id}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={`
            w-full text-left px-4 py-4 rounded-xl border-2 transition-all duration-200
            ${disabled
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50 hover:shadow-md active:scale-[0.98]'
            }
          `}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <span className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
            {option.text}
          </span>
        </button>
      ))}
    </div>
  );
}
