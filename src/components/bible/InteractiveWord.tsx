import React from 'react'
import { Search, X } from 'lucide-react'

interface InteractiveWordProps {
  word: string
  index: number
  isSelected: boolean // A palavra clicada exata
  isHighlighted: boolean // Faz parte do contexto (frase/verso)
  hasSavedNote?: boolean // Se existe uma nota salva para esta palavra/range
  onClick: (index: number, word: string, e: React.MouseEvent) => void
  onConfirmAnalyze?: () => void
  onClear?: () => void
}

export function InteractiveWord({ word, index, isSelected, isHighlighted, hasSavedNote, onClick, onConfirmAnalyze, onClear }: InteractiveWordProps) {
  // Remove pontuação para análise limpa, mas exibe com pontuação
  const cleanWord = word.replace(/[.,;!?()]/g, '')

  return (
    <span className="relative inline-block group/word">
        {isSelected && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[50] animate-in fade-in zoom-in duration-200">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onConfirmAnalyze?.()
                    }}
                    className="bg-popover text-popover-foreground p-2.5 rounded-full shadow-lg border border-border hover:scale-110 transition-transform cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px]"
                    title="Clique para analisar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <circle cx="10" cy="10" r="7" />
                        <path d="m21 21-6-6" />
                    </svg>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onClear?.()
                    }}
                    className="bg-primary text-primary-foreground p-2.5 rounded-full shadow-lg border border-border hover:scale-110 transition-transform cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px]"
                    title="Fechar seleção"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        )}
        <span
        onClick={(e) => {
            e.stopPropagation()
            onClick(index, cleanWord, e)
        }}
        className={`
                    inline-block px-0.5 rounded cursor-pointer transition-all duration-200 select-none
                    ${(isSelected || isHighlighted)
                        ? 'bg-primary/10 text-foreground' 
                        : hasSavedNote 
                            ? 'bg-yellow-500/10 text-foreground decoration-yellow-500/30 underline decoration-wavy decoration-1 underline-offset-4'
                            : 'hover:bg-primary/5 hover:text-primary'
                    }
                    ${isSelected ? 'underline decoration-2 underline-offset-4 decoration-primary/50' : ''}
                `}
        >
        {word}{' '}
        </span>
    </span>
  )
}
