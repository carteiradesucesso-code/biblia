import { useState, useRef, useEffect } from 'react'
import { X, Loader2, BookOpen, TextQuote, FileText, Send, MessageSquare, User, Bot, Save, Trash2, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnalysisLevel } from '@/hooks/useProgressiveClick'

interface ExegesisPopupProps {
  isOpen: boolean
  isLoading: boolean
  level: AnalysisLevel | null
  content: string | null
  verseContext?: string | null
  onClose: () => void
  initialChatMessages?: {role: 'user' | 'assistant', content: string}[]
  isSaved?: boolean
  onSave?: (messages: {role: 'user' | 'assistant', content: string}[]) => void
  onDelete?: () => void
  position?: { x: number, y: number } // Para posicionamento inteligente (futuro)
}

export function ExegesisPopup({ 
  isOpen, 
  isLoading, 
  level, 
  content, 
  verseContext, 
  onClose,
  initialChatMessages,
  isSaved,
  onSave,
  onDelete
}: ExegesisPopupProps) {
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset chat when content changes (new analysis)
  useEffect(() => {
    if (initialChatMessages) {
        setChatMessages(initialChatMessages)
    } else {
        setChatMessages([])
    }
    setInputValue('')
    setIsChatLoading(false)
  }, [content, level, initialChatMessages])

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages, isChatLoading, content])

  if (!isOpen) return null

  const getLevelIcon = () => {
    switch (level) {
      case 'word': return <TextQuote className="w-4 h-4" />
      case 'phrase': return <FileText className="w-4 h-4" />
      case 'verse': return <BookOpen className="w-4 h-4" />
      default: return null
    }
  }

  const getLevelTitle = () => {
    switch (level) {
      case 'word': return 'Análise de Palavra'
      case 'phrase': return 'Análise de Contexto'
      case 'verse': return 'Análise Teológica'
      default: return 'Exegese'
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newMessage = { role: 'user' as const, content: inputValue }
    setChatMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsChatLoading(true)

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [...chatMessages, newMessage],
                context: `Texto Original: "${verseContext || ''}"\n\nAnálise Já Fornecida: ${content || ''}`
            })
        })
        
        const data = await response.json()
        if (data.reply) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        }
    } catch (error) {
        console.error(error)
    } finally {
        setIsChatLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 w-auto z-50 md:w-full md:max-w-md md:left-auto md:right-8 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm flex flex-col max-h-[80vh]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30 rounded-t-lg shrink-0">
          <div className="flex items-center gap-2 text-primary font-semibold">
            {getLevelIcon()}
            <CardTitle className="text-sm font-bold uppercase tracking-wide">
              {getLevelTitle()}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {content && !isLoading && (
                <>
                    {isSaved ? (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" 
                            onClick={onDelete}
                            title="Excluir nota salva"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-primary" 
                            onClick={() => onSave?.(chatMessages)}
                            title="Salvar como nota"
                        >
                            <Save className="w-4 h-4" />
                        </Button>
                    )}
                </>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" onClick={onClose}>
                <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 overflow-y-auto custom-scrollbar text-sm leading-relaxed flex-1" ref={scrollRef}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-medium animate-pulse">Consultando originais...</span>
            </div>
          ) : (
            <>
                <div className="prose dark:prose-invert prose-sm max-w-none">
                {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                    <p className="text-muted-foreground italic">Nenhuma análise disponível.</p>
                )}
                </div>

                {/* Chat Section */}
                {chatMessages.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-dashed border-primary/20 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-primary/70 text-[10px] uppercase font-bold tracking-wider mb-2">
                            <MessageSquare className="w-3 h-3" />
                            Chat Teológico
                        </div>
                        {chatMessages.map((msg, i) => (
                            <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-2 mb-1.5">
                                    {msg.role === 'user' ? (
                                        <>
                                            <div className="bg-primary/10 p-1 rounded-full">
                                                <User className="w-3 h-3 text-primary" />
                                            </div>
                                            <span className="text-xs font-bold text-primary uppercase tracking-wide">Você</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-primary/10 p-1 rounded-full">
                                                <Bot className="w-3 h-3 text-primary" />
                                            </div>
                                            <span className="text-xs font-bold text-primary uppercase tracking-wide">Assistente</span>
                                        </>
                                    )}
                                </div>
                                <div className={`prose dark:prose-invert prose-sm max-w-none pl-7 ${msg.role === 'user' ? 'text-foreground/80 font-medium' : 'text-foreground'}`}>
                                    {msg.role === 'assistant' ? (
                                        <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex items-center gap-2 pl-2">
                                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground italic">Digitando...</span>
                            </div>
                        )}
                    </div>
                )}
            </>
          )}
        </CardContent>

        {/* Input Footer */}
        {!isLoading && content && (
            <div className="p-3 border-t bg-muted/30 backdrop-blur shrink-0">
                <form 
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMessage()
                    }}
                    className="flex gap-2 items-center"
                >
                    <Input 
                        placeholder="Dúvida sobre a análise? Pergunte..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="h-9 text-xs bg-background/50 focus:bg-background transition-colors rounded-full px-4 border-primary/10 focus:border-primary/30"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="h-9 w-9 rounded-full shrink-0 transition-all hover:scale-105 active:scale-95" 
                        disabled={isChatLoading || !inputValue.trim()}
                    >
                        {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        )}
      </Card>
    </div>
  )
}
