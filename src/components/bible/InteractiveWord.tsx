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
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 z-[50] animate-in fade-in zoom-in duration-200">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onConfirmAnalyze?.()
                    }}
                    className="bg-popover text-popover-foreground p-1.5 rounded-full shadow-md border border-border hover:scale-105 transition-transform cursor-pointer"
                    title="Clique para analisar"
                >
                    <Search className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onClear?.()
                    }}
                    className="bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-md border border-border hover:scale-105 transition-transform cursor-pointer"
                    title="Fechar seleção"
                >
                    <X className="w-3.5 h-3.5" />
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
