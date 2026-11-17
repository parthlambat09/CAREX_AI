import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { RoleOption } from './roles';
import { cn } from '@/utils/cn';

interface RoleCardProps {
  role: RoleOption;
  isSelected: boolean;
  onSelect: (role: RoleOption) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, isSelected, onSelect }) => {
  const IconComponent = role.icon;

  return (
    <div
      onClick={() => onSelect(role)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(role);
        }
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 sm:p-8 cursor-pointer transition-all duration-300 transform hover:-translate-y-1',
        'border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900',
        isSelected
          ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/30 dark:ring-orange-500 dark:border-orange-500 dark:bg-zinc-900 shadow-lg'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-700'
      )}
    >
      {/* Background Subtle Gradient */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none',
          role.gradient,
          isSelected && 'opacity-100'
        )}
      />

      {/* Top Header: Icon + Selection Radio */}
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div
          className={cn(
            'p-3.5 rounded-2xl transition-all duration-300 border',
            isSelected
              ? 'bg-blue-600 text-white border-blue-600 dark:bg-orange-500 dark:text-black dark:border-orange-500 scale-110 shadow-sm'
              : 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-zinc-700 dark:group-hover:text-zinc-100'
          )}
        >
          <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        {/* Radio Indicator */}
        <div
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
            isSelected
              ? 'border-blue-600 bg-blue-600 text-white dark:border-orange-500 dark:bg-orange-500 dark:text-black scale-110'
              : 'border-slate-300 dark:border-zinc-700 group-hover:border-slate-400 bg-transparent'
          )}
        >
          {isSelected && <CheckCircle2 className="w-4 h-4" />}
        </div>
      </div>

      {/* Role Title & Badge */}
      <div className="relative z-10 space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            {role.title}
          </h3>
        </div>

        <span
          className={cn(
            'inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-colors',
            isSelected
              ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30'
              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
          )}
        >
          {role.badgeText}
        </span>
      </div>

      {/* Role Description */}
      <p className="relative z-10 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed min-h-[44px]">
        {role.description}
      </p>

      {/* Bottom CTA Cue */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold">
        <span
          className={cn(
            'transition-colors',
            isSelected
              ? 'text-blue-600 dark:text-orange-400'
              : 'text-slate-500 group-hover:text-slate-800 dark:text-zinc-500 dark:group-hover:text-zinc-300'
          )}
        >
          {isSelected ? 'Role Selected' : 'Select Role'}
        </span>
        <ArrowRight
          className={cn(
            'w-4 h-4 transition-transform duration-300',
            isSelected
              ? 'text-blue-600 dark:text-orange-400 translate-x-1'
              : 'text-slate-400 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-400 group-hover:translate-x-0.5'
          )}
        />
      </div>
    </div>
  );
};
