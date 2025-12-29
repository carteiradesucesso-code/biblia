import { useState, useRef, useCallback } from 'react'

export type AnalysisLevel = 'word' | 'phrase' | 'verse'

interface UseProgressiveClickProps {
  onAnalyze: (text: string, level: AnalysisLevel, context: string, verseId: string, rangeStart: number, rangeEnd: number) => void
  onClear: () => void
}

export function useProgressiveClick({ onAnalyze, onClear }: UseProgressiveClickProps) {
  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null)
  const [selectionRange, setSelectionRange] = useState<{start: number, end: number} | null>(null)
  const [analysisLevel, setAnalysisLevel] = useState<AnalysisLevel | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const handleWordClick = useCallback((verseId: string, wordIndex: number, word: string, fullVerseText: string, isShiftPressed: boolean) => {
    // 1. Mudança de verso ou primeira seleção
    if (selectedVerseId !== verseId) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      
      setSelectedVerseId(verseId)
      setSelectionRange({ start: wordIndex, end: wordIndex })
      setAnalysisLevel('word')
      return
    }

    // Mesmo verso
    // Lógica inteligente de Range: Se clicou em outra palavra, estende a seleção.
    // (Não exige mais Shift para facilitar uso sequencial)
    
    if (selectionRange) {
        // Se clicou na MESMA palavra única que já estava selecionada -> Toggle Nível
        if (selectionRange.start === selectionRange.end && selectionRange.start === wordIndex) {
            if (debounceTimer.current) clearTimeout(debounceTimer.current)

            // Toggle entre Word e Verse
            if (analysisLevel === 'word') {
                setAnalysisLevel('verse')
            } else {
                setAnalysisLevel('word')
            }
            return
        }

        // Se clicou em outra palavra (ou range já existia) -> Atualiza Range
        // Comportamento: Estende o range atual para incluir a nova palavra clicada.
        const newStart = Math.min(selectionRange.start, wordIndex)
        const newEnd = Math.max(selectionRange.end, wordIndex)
        
        // Se o usuário clicar DENTRO de um range existente (redução), 
        // a lógica min/max mantém o range original se clicar no meio, ou não reduz.
        // Para permitir "correção" (ex: queria só a palavra clicada), podemos verificar:
        // Se clicou no meio, talvez ele queira resetar?
        // Mas o pedido é "não posso pular nenhuma palavra", sugerindo construção.
        // Vamos manter a expansão simples. Se ele quiser resetar, usa o botão X.
        
        // Exceção: Se o clique for muito longe? Não, versículos são curtos.
        
        setSelectionRange({ start: newStart, end: newEnd })
        setAnalysisLevel('phrase')
    } else {
        // Fallback (não deve acontecer pois verseId match implica seleção existente ou reset)
        setSelectionRange({ start: wordIndex, end: wordIndex })
        setAnalysisLevel('word')
    }
  }, [selectedVerseId, selectionRange, analysisLevel])

  const triggerAnalysis = useCallback((fullVerseText: string) => {
      if (!selectedVerseId || !selectionRange || !analysisLevel) return

      let textToAnalyze = ""
      
      if (analysisLevel === 'verse') {
        textToAnalyze = fullVerseText
      } else {
        // Word ou Phrase (Range)
        const words = fullVerseText.split(' ')
        // Garante índices válidos
        const start = Math.max(0, selectionRange.start)
        const end = Math.min(words.length, selectionRange.end + 1)
        textToAnalyze = words.slice(start, end).join(' ')
      }

      onAnalyze(textToAnalyze, analysisLevel, fullVerseText, selectedVerseId, selectionRange.start, selectionRange.end)
  }, [selectedVerseId, selectionRange, analysisLevel, onAnalyze])

  const clearSelection = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setSelectedVerseId(null)
    setSelectionRange(null)
    setAnalysisLevel(null)
    onClear()
  }, [onClear])

  const setManualSelection = useCallback((verseId: string, start: number, end: number, level: AnalysisLevel) => {
    setSelectedVerseId(verseId)
    setSelectionRange({ start, end })
    setAnalysisLevel(level)
  }, [])

  return {
    selectedVerseId,
    selectionRange,
    analysisLevel,
    handleWordClick,
    clearSelection,
    setManualSelection,
    triggerAnalysis
  }
}
