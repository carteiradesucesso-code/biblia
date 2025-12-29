'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { BookOpen, Search, Mic, Settings, Bookmark, FileText, ChevronLeft, ChevronRight, BookMarked, Highlighter, X, Check, Home, Menu, StickyNote, Type, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { UserNav } from '@/components/user-nav'
import { useAuth } from '@/components/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { useProgressiveClick, AnalysisLevel } from '@/hooks/useProgressiveClick'
import { InteractiveWord } from '@/components/bible/InteractiveWord'
import { ExegesisPopup } from '@/components/bible/ExegesisPopup'

// Types
interface Book {
  id: string
  name: string
  nameShort: string
  testament: string
  category: string
  chapters: number
  order: number
}

interface BibleVersion {
  id: string
  name: string
  abbreviation: string
}

interface Verse {
  id: string
  number: number
  text: string
}

interface Bookmark {
  id: string
  verseId: string
  color: string
  note: string
  verse: {
    number: number
    text: string
    chapter: {
      number: number
      book: {
        name: string
      }
    }
  }
}

interface Outline {
  id: string
  title: string
  content: string
  createdAt: Date
}

// Categorias e cores
interface BookCategory {
  id: string
  name: string
  color: string
  colorBg: string
  colorBgLight: string
  books: Book[]
}

// Definição das categorias e livros
const BIBLE_CATEGORIES: BookCategory[] = [
  // Antigo Testamento
  {
    id: 'law',
    name: 'Lei / Pentateuco',
    color: 'text-red-600 dark:text-red-400',
    colorBg: 'bg-red-500',
    colorBgLight: 'bg-red-50 dark:bg-red-950/30',
    books: [
      { id: 'gen', name: 'Gênesis', nameShort: 'Gn', testament: 'AT', category: 'law', chapters: 50, order: 1 },
      { id: 'exo', name: 'Êxodo', nameShort: 'Êx', testament: 'AT', category: 'law', chapters: 40, order: 2 },
      { id: 'lev', name: 'Levítico', nameShort: 'Lv', testament: 'AT', category: 'law', chapters: 27, order: 3 },
      { id: 'num', name: 'Números', nameShort: 'Nm', testament: 'AT', category: 'law', chapters: 36, order: 4 },
      { id: 'deu', name: 'Deuteronômio', nameShort: 'Dt', testament: 'AT', category: 'law', chapters: 34, order: 5 },
    ],
  },
  {
    id: 'history',
    name: 'Livros Históricos',
    color: 'text-orange-600 dark:text-orange-400',
    colorBg: 'bg-orange-500',
    colorBgLight: 'bg-orange-50 dark:bg-orange-950/30',
    books: [
      { id: 'jos', name: 'Josué', nameShort: 'Js', testament: 'AT', category: 'history', chapters: 24, order: 6 },
      { id: 'jui', name: 'Juízes', nameShort: 'Jz', testament: 'AT', category: 'history', chapters: 21, order: 7 },
      { id: 'rut', name: 'Rute', nameShort: 'Rt', testament: 'AT', category: 'history', chapters: 4, order: 8 },
      { id: '1sa', name: '1 Samuel', nameShort: '1Sm', testament: 'AT', category: 'history', chapters: 31, order: 9 },
      { id: '2sa', name: '2 Samuel', nameShort: '2Sm', testament: 'AT', category: 'history', chapters: 24, order: 10 },
      { id: '1rs', name: '1 Reis', nameShort: '1Rs', testament: 'AT', category: 'history', chapters: 22, order: 11 },
      { id: '2rs', name: '2 Reis', nameShort: '2Rs', testament: 'AT', category: 'history', chapters: 25, order: 12 },
      { id: '1cr', name: '1 Crônicas', nameShort: '1Cr', testament: 'AT', category: 'history', chapters: 29, order: 13 },
      { id: '2cr', name: '2 Crônicas', nameShort: '2Cr', testament: 'AT', category: 'history', chapters: 36, order: 14 },
      { id: 'edr', name: 'Esdras', nameShort: 'Ed', testament: 'AT', category: 'history', chapters: 10, order: 15 },
      { id: 'nee', name: 'Neemias', nameShort: 'Ne', testament: 'AT', category: 'history', chapters: 13, order: 16 },
      { id: 'est', name: 'Ester', nameShort: 'Et', testament: 'AT', category: 'history', chapters: 10, order: 17 },
    ],
  },
  {
    id: 'poetry',
    name: 'Poéticos e Sapienciais',
    color: 'text-yellow-600 dark:text-yellow-400',
    colorBg: 'bg-yellow-500',
    colorBgLight: 'bg-yellow-50 dark:bg-yellow-950/30',
    books: [
      { id: 'job', name: 'Jó', nameShort: 'Jó', testament: 'AT', category: 'poetry', chapters: 42, order: 18 },
      { id: 'sl', name: 'Salmos', nameShort: 'Sl', testament: 'AT', category: 'poetry', chapters: 150, order: 19 },
      { id: 'pv', name: 'Provérbios', nameShort: 'Pv', testament: 'AT', category: 'poetry', chapters: 31, order: 20 },
      { id: 'ec', name: 'Eclesiastes', nameShort: 'Ec', testament: 'AT', category: 'poetry', chapters: 12, order: 21 },
      { id: 'ct', name: 'Cantares', nameShort: 'Ct', testament: 'AT', category: 'poetry', chapters: 8, order: 22 },
    ],
  },
  {
    id: 'prophets',
    name: 'Profetas',
    color: 'text-green-600 dark:text-green-400',
    colorBg: 'bg-green-500',
    colorBgLight: 'bg-green-50 dark:bg-green-950/30',
    books: [
      { id: 'is', name: 'Isaías', nameShort: 'Is', testament: 'AT', category: 'prophets', chapters: 66, order: 23 },
      { id: 'jr', name: 'Jeremias', nameShort: 'Jr', testament: 'AT', category: 'prophets', chapters: 52, order: 24 },
      { id: 'lm', name: 'Lamentações', nameShort: 'Lm', testament: 'AT', category: 'prophets', chapters: 5, order: 25 },
      { id: 'ez', name: 'Ezequiel', nameShort: 'Ez', testament: 'AT', category: 'prophets', chapters: 48, order: 26 },
      { id: 'dn', name: 'Daniel', nameShort: 'Dn', testament: 'AT', category: 'prophets', chapters: 12, order: 27 },
      { id: 'os', name: 'Oséias', nameShort: 'Os', testament: 'AT', category: 'prophets', chapters: 14, order: 28 },
      { id: 'jl', name: 'Joel', nameShort: 'Jl', testament: 'AT', category: 'prophets', chapters: 3, order: 29 },
      { id: 'am', name: 'Amós', nameShort: 'Am', testament: 'AT', category: 'prophets', chapters: 9, order: 30 },
      { id: 'ob', name: 'Obadias', nameShort: 'Ob', testament: 'AT', category: 'prophets', chapters: 1, order: 31 },
      { id: 'jn', name: 'Jonas', nameShort: 'Jn', testament: 'AT', category: 'prophets', chapters: 4, order: 32 },
      { id: 'mq', name: 'Miquéias', nameShort: 'Mq', testament: 'AT', category: 'prophets', chapters: 7, order: 33 },
      { id: 'na', name: 'Naum', nameShort: 'Na', testament: 'AT', category: 'prophets', chapters: 3, order: 34 },
      { id: 'hc', name: 'Habacuque', nameShort: 'Hc', testament: 'AT', category: 'prophets', chapters: 3, order: 35 },
      { id: 'sf', name: 'Sofonias', nameShort: 'Sf', testament: 'AT', category: 'prophets', chapters: 3, order: 36 },
      { id: 'ag', name: 'Ageu', nameShort: 'Ag', testament: 'AT', category: 'prophets', chapters: 2, order: 37 },
      { id: 'zc', name: 'Zacarias', nameShort: 'Zc', testament: 'AT', category: 'prophets', chapters: 14, order: 38 },
      { id: 'ml', name: 'Malaquias', nameShort: 'Ml', testament: 'AT', category: 'prophets', chapters: 4, order: 39 },
    ],
  },
  // Novo Testamento
  {
    id: 'gospels',
    name: 'Evangelhos + Atos',
    color: 'text-blue-600 dark:text-blue-400',
    colorBg: 'bg-blue-500',
    colorBgLight: 'bg-blue-50 dark:bg-blue-950/30',
    books: [
      { id: 'mt', name: 'Mateus', nameShort: 'Mt', testament: 'NT', category: 'gospels', chapters: 28, order: 40 },
      { id: 'mc', name: 'Marcos', nameShort: 'Mc', testament: 'NT', category: 'gospels', chapters: 16, order: 41 },
      { id: 'lc', name: 'Lucas', nameShort: 'Lc', testament: 'NT', category: 'gospels', chapters: 24, order: 42 },
      { id: 'jo', name: 'João', nameShort: 'Jo', testament: 'NT', category: 'gospels', chapters: 21, order: 43 },
      { id: 'at', name: 'Atos', nameShort: 'At', testament: 'NT', category: 'gospels', chapters: 28, order: 44 },
    ],
  },
  {
    id: 'pauline',
    name: 'Cartas Paulinas',
    color: 'text-indigo-600 dark:text-indigo-400',
    colorBg: 'bg-indigo-500',
    colorBgLight: 'bg-indigo-50 dark:bg-indigo-950/30',
    books: [
      { id: 'rm', name: 'Romanos', nameShort: 'Rm', testament: 'NT', category: 'pauline', chapters: 16, order: 45 },
      { id: '1co', name: '1 Coríntios', nameShort: '1Co', testament: 'NT', category: 'pauline', chapters: 16, order: 46 },
      { id: '2co', name: '2 Coríntios', nameShort: '2Co', testament: 'NT', category: 'pauline', chapters: 13, order: 47 },
      { id: 'gl', name: 'Gálatas', nameShort: 'Gl', testament: 'NT', category: 'pauline', chapters: 6, order: 48 },
      { id: 'ef', name: 'Efésios', nameShort: 'Ef', testament: 'NT', category: 'pauline', chapters: 6, order: 49 },
      { id: 'fp', name: 'Filipenses', nameShort: 'Fp', testament: 'NT', category: 'pauline', chapters: 4, order: 50 },
      { id: 'cl', name: 'Colossenses', nameShort: 'Cl', testament: 'NT', category: 'pauline', chapters: 4, order: 51 },
      { id: '1ts', name: '1 Tessalonicenses', nameShort: '1Ts', testament: 'NT', category: 'pauline', chapters: 5, order: 52 },
      { id: '2ts', name: '2 Tessalonicenses', nameShort: '2Ts', testament: 'NT', category: 'pauline', chapters: 3, order: 53 },
      { id: '1tm', name: '1 Timóteo', nameShort: '1Tm', testament: 'NT', category: 'pauline', chapters: 6, order: 54 },
      { id: '2tm', name: '2 Timóteo', nameShort: '2Tm', testament: 'NT', category: 'pauline', chapters: 4, order: 55 },
      { id: 'tt', name: 'Tito', nameShort: 'Tt', testament: 'NT', category: 'pauline', chapters: 3, order: 56 },
      { id: 'fm', name: 'Filemom', nameShort: 'Fm', testament: 'NT', category: 'pauline', chapters: 1, order: 57 },
    ],
  },
  {
    id: 'general',
    name: 'Cartas Gerais + Apocalipse',
    color: 'text-purple-600 dark:text-purple-400',
    colorBg: 'bg-purple-500',
    colorBgLight: 'bg-purple-50 dark:bg-purple-950/30',
    books: [
      { id: 'hb', name: 'Hebreus', nameShort: 'Hb', testament: 'NT', category: 'general', chapters: 13, order: 58 },
      { id: 'tg', name: 'Tiago', nameShort: 'Tg', testament: 'NT', category: 'general', chapters: 5, order: 59 },
      { id: '1pe', name: '1 Pedro', nameShort: '1Pe', testament: 'NT', category: 'general', chapters: 5, order: 60 },
      { id: '2pe', name: '2 Pedro', nameShort: '2Pe', testament: 'NT', category: 'general', chapters: 3, order: 61 },
      { id: '1jo', name: '1 João', nameShort: '1Jo', testament: 'NT', category: 'general', chapters: 5, order: 62 },
      { id: '2jo', name: '2 João', nameShort: '2Jo', testament: 'NT', category: 'general', chapters: 1, order: 63 },
      { id: '3jo', name: '3 João', nameShort: '3Jo', testament: 'NT', category: 'general', chapters: 1, order: 64 },
      { id: 'jd', name: 'Judas', nameShort: 'Jd', testament: 'NT', category: 'general', chapters: 1, order: 65 },
      { id: 'ap', name: 'Apocalipse', nameShort: 'Ap', testament: 'NT', category: 'general', chapters: 22, order: 66 },
    ],
  },
]

const BIBLE_VERSIONS: BibleVersion[] = [
  { id: 'arc', name: 'Almeida Revista e Corrigida', abbreviation: 'ARC' },
  { id: 'acf', name: 'Almeida Corrigida Fiel', abbreviation: 'ACF' },
  { id: 'ara', name: 'Almeida Revista e Atualizada', abbreviation: 'ARA' },
  { id: 'nvi', name: 'Nova Versão Internacional', abbreviation: 'NVI' },
]

const FONT_OPTIONS = [
  { id: 'crimson', name: 'Crimson Text', style: 'var(--font-crimson)' },
  { id: 'garamond', name: 'EB Garamond', style: 'var(--font-garamond)' },
  { id: 'alegreya', name: 'Alegreya', style: 'var(--font-alegreya)' },
  { id: 'gentium', name: 'Gentium Book', style: 'var(--font-gentium)' },
  { id: 'merriweather', name: 'Merriweather', style: 'var(--font-merriweather)' },
  { id: 'literata', name: 'Literata', style: 'var(--font-literata)' },
  { id: 'lexend', name: 'Lexend', style: 'var(--font-lexend)' },
  { id: 'atkinson', name: 'Atkinson', style: 'var(--font-atkinson)' },
  { id: 'roboto', name: 'Roboto', style: 'var(--font-roboto)' },
  { id: 'sans', name: 'Sistema (Sans)', style: 'var(--font-geist-sans)' },
]

export default function BibleApp() {
  const [currentView, setCurrentView] = useState<'home' | 'chapter' | 'search' | 'bookmarks' | 'outlines' | 'settings'>('home')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [currentChapterVerses, setCurrentChapterVerses] = useState<Verse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState('arc')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [outlines, setOutlines] = useState<Outline[]>([])
  const [selectedBookmarkVerse, setSelectedBookmarkVerse] = useState<string | null>(null)
  const [bookmarkNote, setBookmarkNote] = useState('')
  const [bookmarkColor, setBookmarkColor] = useState('yellow')
  const [newOutlineTitle, setNewOutlineTitle] = useState('')
  const [newOutlineContent, setNewOutlineContent] = useState('')
  const [selectedVerses, setSelectedVerses] = useState<string[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [viewingNotesVerseId, setViewingNotesVerseId] = useState<string | null>(null)
  const { toast } = useToast()

  // Settings (Declared BEFORE usage in effects)
  const [fontSize, setFontSize] = useState(18)
  const [fontFamily, setFontFamily] = useState('var(--font-crimson)')

  // Auth & Persistence
  const { user } = useAuth()
  const supabase = createClient()

  // Exegesis State
  const [exegesisOpen, setExegesisOpen] = useState(false)
  const [exegesisContent, setExegesisContent] = useState<string | null>(null)
  const [exegesisContext, setExegesisContext] = useState<string | null>(null)
  const [isExegesisLoading, setIsExegesisLoading] = useState(false)
  const [currentAnalysisLevel, setCurrentAnalysisLevel] = useState<AnalysisLevel | null>(null)
  
  interface ExegesisNote {
    id: string
    verseId: string
    rangeStart: number
    rangeEnd: number
    level: AnalysisLevel
    content: string
    chatMessages: {role: 'user' | 'assistant', content: string}[]
    timestamp: number
  }
  
  const [exegesisNotes, setExegesisNotes] = useState<ExegesisNote[]>([])

  const handleExegesisAnalyze = async (text: string, level: AnalysisLevel, context: string, verseId: string, rangeStart: number, rangeEnd: number) => {
    setIsExegesisLoading(true)
    setExegesisOpen(true)
    setCurrentAnalysisLevel(level)
    setExegesisContext(context)

    // Check for saved note
    const noteId = `${verseId}-${rangeStart}-${rangeEnd}-${level}`
    const savedNote = exegesisNotes.find(n => n.id === noteId)
    
    if (savedNote) {
        setExegesisContent(savedNote.content)
        setIsExegesisLoading(false)
        return
    }

    setExegesisContent(null)
 
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level, context })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      
      setExegesisContent(data.analysis)
    } catch (error) {
      console.error(error)
      setExegesisContent('<p class="text-red-500">Erro ao analisar. Verifique a chave da API.</p>')
    } finally {
      setIsExegesisLoading(false)
    }
  }

  const handleExegesisClear = () => {
    setExegesisOpen(false)
    setExegesisContent(null)
    setExegesisContext(null)
    setCurrentAnalysisLevel(null)
  }

  const { 
    selectedVerseId: exegesisVerseId, 
    selectionRange: exegesisSelectionRange, 
    analysisLevel: exegesisLevel, 
    handleWordClick: handleExegesisClick, 
    clearSelection: clearExegesis,
    triggerAnalysis: triggerExegesisAnalysis,
    setManualSelection
  } = useProgressiveClick({
    onAnalyze: (text, level, context, verseId, start, end) => handleExegesisAnalyze(text, level, context, verseId, start, end),
    onClear: handleExegesisClear
  })

  // Efeito para limpar ao clicar fora ou ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearExegesis()
    }
    const handleClickOutside = (e: MouseEvent) => {
        // Se clicar em algo que não seja uma InteractiveWord, limpar
        // Simplificado: se clicar em qualquer lugar e não tiver clicado numa palavra, o hook não dispara.
        // Mas precisamos detectar cliques fora. O documento diz "Clicar em qualquer espaço vazio".
        // Vamos assumir que se não for InteractiveWord, o evento borbulha e cai aqui?
        // Na verdade, o InteractiveWord tem stopPropagation. Então se chegar aqui, foi fora.
        // Mas se clicar num botão?
        // Vamos deixar o usuário clicar no X ou ESC. E adicionar um onClick no container principal do capitulo.
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearExegesis])

  // Load settings
  useEffect(() => {
    if (!user || !supabase) return

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('preferences, last_location')
        .eq('id', user.id)
        .single()

      if (data) {
        if (data.preferences) {
           const prefs = data.preferences as any
           if (prefs.fontSize) setFontSize(prefs.fontSize)
           if (prefs.fontFamily) setFontFamily(prefs.fontFamily)
           if (prefs.version) setSelectedVersion(prefs.version)
           if (prefs.bookmarks) setBookmarks(prefs.bookmarks)
           if (prefs.outlines) setOutlines(prefs.outlines)
        }
      }
    }
    loadProfile()
  }, [user])

  // Load Exegesis Notes from dedicated table
  useEffect(() => {
    if (!user || !supabase) return

    const loadNotes = async () => {
        const { data } = await supabase
            .from('exegesis_notes')
            .select('*')
            .eq('user_id', user.id)
        
        if (data) {
            const notes: ExegesisNote[] = data.map((n: any) => ({
                id: `${n.verse_id}-${n.range_start}-${n.range_end}-${n.level}`,
                verseId: n.verse_id,
                rangeStart: n.range_start,
                rangeEnd: n.range_end,
                level: n.level as AnalysisLevel,
                content: n.content,
                chatMessages: n.chat_messages || [],
                timestamp: new Date(n.updated_at).getTime()
            }))
            setExegesisNotes(notes)
        }
    }
    loadNotes()
  }, [user])

  // Save settings (Debounced)
  useEffect(() => {
    if (!user || !supabase) return

    const saveSettings = setTimeout(async () => {
      await supabase.from('profiles').upsert({
        id: user.id,
        preferences: {
          fontSize,
          fontFamily,
          version: selectedVersion,
          bookmarks,
          outlines
        },
        last_location: {
          bookId: selectedBook?.id,
          chapter: selectedChapter
        },
        updated_at: new Date().toISOString()
      })
    }, 2000)

    return () => clearTimeout(saveSettings)
  }, [fontSize, fontFamily, selectedVersion, selectedBook, selectedChapter, user, bookmarks, outlines])

  const handleSaveExegesisNote = async (chatMessages: {role: 'user' | 'assistant', content: string}[]) => {
    if (!exegesisVerseId || !exegesisSelectionRange || !currentAnalysisLevel || !exegesisContent || !user) return
    
    const { start, end } = exegesisSelectionRange
    const id = `${exegesisVerseId}-${start}-${end}-${currentAnalysisLevel}`
    
    const newNote: ExegesisNote = {
      id,
      verseId: exegesisVerseId,
      rangeStart: start,
      rangeEnd: end,
      level: currentAnalysisLevel,
      content: exegesisContent,
      chatMessages,
      timestamp: Date.now()
    }
    
    // Optimistic update
    setExegesisNotes(prev => {
      const filtered = prev.filter(n => n.id !== id)
      return [...filtered, newNote]
    })

    // Save to DB
    const { error } = await supabase.from('exegesis_notes').upsert({
        user_id: user.id,
        verse_id: exegesisVerseId,
        range_start: start,
        range_end: end,
        level: currentAnalysisLevel,
        content: exegesisContent,
        chat_messages: chatMessages,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'user_id,verse_id,range_start,range_end,level'
    })

    if (error) {
        console.error('Error saving note:', error)
        toast({ title: "Erro ao salvar", description: "Falha na persistência da nota.", variant: "destructive" })
        return
    }

    toast({ title: "Nota Salva", description: "Análise e chat salvos com sucesso." })
  }

  const handleDeleteExegesisNote = async () => {
    if (!exegesisVerseId || !exegesisSelectionRange || !currentAnalysisLevel || !user) return
    const { start, end } = exegesisSelectionRange
    const id = `${exegesisVerseId}-${start}-${end}-${currentAnalysisLevel}`
    
    // Optimistic delete
    setExegesisNotes(prev => prev.filter(n => n.id !== id))
    setExegesisContent(null)
    setExegesisOpen(false)

    // Delete from DB
    const { error } = await supabase.from('exegesis_notes').delete().match({
        user_id: user.id,
        verse_id: exegesisVerseId,
        range_start: start,
        range_end: end,
        level: currentAnalysisLevel
    })

    if (error) {
        console.error('Error deleting note:', error)
        toast({ title: "Erro ao excluir", description: "Falha ao remover do banco.", variant: "destructive" })
        return
    }

    toast({ title: "Nota Excluída", description: "Análise removida." })
  }

  const atCategories = BIBLE_CATEGORIES.filter(cat => cat.books[0]?.testament === 'AT')
  const ntCategories = BIBLE_CATEGORIES.filter(cat => cat.books[0]?.testament === 'NT')

  // Voice search (mock - será substituído por API)
  const handleVoiceSearch = async () => {
    setIsListening(true)
    setTimeout(() => {
      const mockResults = ['João 3:16', 'Gênesis 1:1', 'Salmos 23']
      const result = mockResults[Math.floor(Math.random() * mockResults.length)]
      setSearchQuery(result)
      setIsListening(false)
      toast({
        title: "Busca por voz",
        description: `Resultado: "${result}"`,
      })
    }, 2000)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setCurrentView('search')
  }

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book)
    setSelectedChapter(1)
    fetchVerses(book.id, 1)
    setCurrentView('chapter')
    setMobileMenuOpen(false)
  }

  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchVerses = async (bookId: string, chapter: number) => {
    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Cria novo controller
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch(
        `/api/bible/verses?bookId=${bookId}&chapter=${chapter}&versionId=${selectedVersion}`,
        { signal: controller.signal }
      )
      
      if (!response.ok) throw new Error('Falha ao carregar versículos')
      
      const data = await response.json()
      setCurrentChapterVerses(data.verses || [])
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Ignora erros de cancelamento
        return
      }
      console.error(error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o capítulo.",
        variant: "destructive",
      })
      setCurrentChapterVerses([])
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }
    }
  }

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      fetchVerses(selectedBook.id, selectedChapter)
    }
  }, [selectedVersion])

  const handleChapterChange = (newChapter: number) => {
    if (!selectedBook) return
    if (newChapter < 1 || newChapter > selectedBook.chapters) return
    setSelectedChapter(newChapter)
    fetchVerses(selectedBook.id, newChapter)
  }

  const handleAddBookmark = (verseIds: string[]) => {
    if (verseIds.length === 0) return

    const newBookmarks = verseIds.map(verseId => {
      const verse = currentChapterVerses.find(v => v.id === verseId)
      if (!verse) return null

      return {
        id: Date.now().toString() + Math.random().toString(),
        verseId,
        color: bookmarkColor,
        note: bookmarkNote,
        verse: {
          number: verse.number,
          text: verse.text,
          chapter: {
            number: selectedChapter || 1,
            book: {
              name: selectedBook?.name || '',
            },
          },
        },
      }
    }).filter((b): b is Bookmark => b !== null)

    setBookmarks([...bookmarks, ...newBookmarks])
    setSelectedBookmarkVerse(null)
    setSelectedVerses([])
    setBookmarkNote('')
    toast({
      title: "Marcação adicionada",
      description: `${newBookmarks.length} versículo(s) marcado(s) com sucesso.`,
    })
  }

  const [selectionMode, setSelectionMode] = useState<'none' | 'selecting' | 'menu'>('none')

  const toggleVerseSelection = (verseId: string) => {
    setSelectedVerses(prev => {
      const isSelected = prev.includes(verseId)
      
      if (!isSelected) {
        // 1º Clique: Seleciona
        setSelectionMode('selecting')
        return [...prev, verseId]
      } else {
        // Se já está selecionado...
        if (selectionMode === 'selecting') {
           // 2º Clique: Ativa menu
           setSelectionMode('menu')
           return prev // Mantém selecionado
        } else if (selectionMode === 'menu') {
           // 3º Clique: Deseleciona
           const newSelection = prev.filter(id => id !== verseId)
           if (newSelection.length === 0) setSelectionMode('none')
           return newSelection
        }
        return prev
      }
    })
  }

  const handleCopyVerses = (verseIds: string[]) => {
    const textToCopy = verseIds
      .map(id => {
        const verse = currentChapterVerses.find(v => v.id === id)
        return verse ? `${verse.number}. ${verse.text}` : ''
      })
      .join('\n')
    
    const reference = `${selectedBook?.name} ${selectedChapter}`
    const fullText = `${reference}\n\n${textToCopy}`

    navigator.clipboard.writeText(fullText)
    toast({
      title: "Copiado!",
      description: `${verseIds.length} versículo(s) copiado(s) para a área de transferência.`,
    })
    setSelectedVerses([])
  }

  const handleRemoveBookmark = (bookmarkId: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== bookmarkId))
    toast({
      title: "Marcação removida",
      description: "Marcação removida com sucesso.",
    })
  }

  const handleAddOutline = () => {
    if (!newOutlineTitle.trim() || !newOutlineContent.trim()) {
      toast({
        title: "Erro",
        description: "Preencha título e conteúdo.",
        variant: "destructive",
      })
      return
    }

    const newOutline: Outline = {
      id: Date.now().toString(),
      title: newOutlineTitle,
      content: newOutlineContent,
      createdAt: new Date(),
    }

    setOutlines([...outlines, newOutline])
    setNewOutlineTitle('')
    setNewOutlineContent('')
    toast({
      title: "Esboço criado",
      description: "Esboço salvo com sucesso.",
    })
  }

  // Render home view com navegação hierárquica
  const renderHomeView = () => (
    <div className="flex flex-col h-full">
      {/* Search Compacto */}
      <div className="pb-4 pt-2 px-1">
        <div className="flex gap-2 relative">
          <Input
            placeholder="Buscar livro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 h-12 text-lg shadow-sm"
          />
          <Button
            size="icon"
            variant={isListening ? "destructive" : "default"}
            onClick={handleVoiceSearch}
            className="h-12 w-12 shrink-0 shadow-sm"
          >
            <Mic className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
          </Button>
          {searchQuery && (
            <Button onClick={handleSearch} size="icon" className="h-12 w-12 shrink-0 shadow-sm">
              <Search className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 no-scrollbar">
          {/* Antigo Testamento Slide */}
          <div className="min-w-full snap-center px-1">
            <h2 className="text-lg font-bold text-muted-foreground mb-2 sticky left-0">Antigo Testamento</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {atCategories.flatMap(cat => 
                cat.books.map(book => ({ ...book, categoryColor: cat.colorBg }))
              ).map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleBookSelect(book)}
                  className={`${book.categoryColor} text-white p-2 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all flex flex-col items-center justify-center h-20 w-full`}
                >
                  <span className="font-bold text-base leading-tight mb-1">{book.nameShort}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center text-muted-foreground md:hidden">
              <span className="text-sm flex items-center animate-pulse">
                Deslize para Novo Testamento <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </div>
          </div>

          {/* Novo Testamento Slide */}
          <div className="min-w-full snap-center px-1">
            <h2 className="text-lg font-bold text-muted-foreground mb-2 sticky left-0">Novo Testamento</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {ntCategories.flatMap(cat => 
                cat.books.map(book => ({ ...book, categoryColor: cat.colorBg }))
              ).map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleBookSelect(book)}
                  className={`${book.categoryColor} text-white p-2 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all flex flex-col items-center justify-center h-20 w-full`}
                >
                  <span className="font-bold text-base leading-tight mb-1">{book.nameShort}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center text-muted-foreground md:hidden">
               <span className="text-sm flex items-center animate-pulse">
                <ChevronLeft className="w-4 h-4 mr-1" /> Deslize para Antigo Testamento
              </span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  const [scrollProgress, setScrollProgress] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    // Normaliza o valor do scroll para uma animação suave (0 a 100px)
    const progress = Math.min(scrollTop / 60, 1)
    setScrollProgress(progress)

    // O header principal só aparece se estivermos no topo
    if (scrollTop > 50) {
      setIsHeaderVisible(false)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
    } else {
      setIsHeaderVisible(true)
    }
  }

  const renderChapterControls = (isInHeader = false) => {
    // Se estiver no header principal, mostra apenas quando scroll < 0.5 (Hero visível)
    // Se estiver na barra secundária, mostra apenas quando scroll > 0.5 (Hero sumindo)
    // Usamos pointer-events para garantir que o botão invisível não seja clicável
    
    const opacity = isInHeader ? Math.max(0, 1 - scrollProgress * 2) : Math.min(1, scrollProgress * 2)
    const pointerEvents = opacity > 0.1 ? 'auto' : 'none'
    
    return (
      <div 
        className="flex items-center gap-2 pr-2 transition-opacity duration-300"
        style={{ opacity, pointerEvents: pointerEvents as any }}
      >
        {selectedVerses.length > 0 && selectionMode === 'menu' ? (
          <div className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-xl min-w-[180px] justify-center">
             <span className="font-bold text-sm whitespace-nowrap px-2">{selectedVerses.length} sel.</span>
             <div className="h-4 w-px bg-primary-foreground/30 mx-1" />
             <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary-foreground/20 text-primary-foreground rounded-full" title="Adicionar Nota">
                  <Highlighter className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nota / Destaque</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-2 justify-center">
                    {['yellow', 'green', 'blue', 'red', 'purple'].map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full bg-${color}-400 border-2 ${
                          bookmarkColor === color ? 'border-black dark:border-white scale-110' : 'border-transparent'
                        } transition-transform hover:scale-105`}
                        onClick={() => setBookmarkColor(color)}
                      />
                    ))}
                  </div>
                  <Textarea
                    placeholder="Sua anotação aqui..."
                    value={bookmarkNote}
                    onChange={(e) => setBookmarkNote(e.target.value)}
                    className="min-h-[100px] text-lg"
                  />
                  <Button onClick={() => handleAddBookmark(selectedVerses)} className="w-full h-12 text-lg">
                    Salvar
                  </Button>
                </div>
              </DialogContent>
             </Dialog>
             
             <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-primary-foreground/20 text-primary-foreground rounded-full"
                onClick={() => handleCopyVerses(selectedVerses)}
                title="Copiar"
             >
                <Copy className="w-4 h-4" />
             </Button>

             <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-primary-foreground/20 text-primary-foreground rounded-full"
                onClick={() => setSelectedVerses([])}
                title="Fechar"
             >
                <X className="w-4 h-4" />
             </Button>
          </div>
        ) : (
          <>
            <Badge variant="outline" className="text-base h-10 px-4 font-semibold border-2">
              {BIBLE_VERSIONS.find(v => v.id === selectedVersion)?.abbreviation || 'NVI'}
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-accent/50 rounded-full">
                  <Type className="w-6 h-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 mr-4">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium">Tamanho da fonte</Label>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">{fontSize}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">A</span>
                      <Slider
                        min={12}
                        max={64}
                        step={1}
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        className="flex-1 py-4"
                      />
                      <span className="text-xl font-bold text-foreground">A</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Tipo de fonte</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => setFontFamily(font.style)}
                          className={`text-base p-3 rounded-md border-2 transition-all text-left ${
                            fontFamily === font.style
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-transparent hover:bg-accent hover:border-accent'
                          }`}
                          style={{ fontFamily: font.style }}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
    )
  }

  const renderChapterView = () => (
    <div className="space-y-4">
      <div 
        className="flex items-center justify-between fixed left-0 right-0 z-40 bg-background/95 backdrop-blur py-3 border-b shadow-sm transition-all duration-500 ease-in-out px-4"
        style={{ 
          top: '0',
          transform: isHeaderVisible ? 'translateY(4rem)' : 'translateY(0)',
          opacity: isHeaderVisible ? 0 : 1,
          pointerEvents: isHeaderVisible ? 'none' : 'auto'
        }}
      >
        <div className="flex items-center gap-3 container mx-auto px-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 shrink-0 hover:bg-accent/50 rounded-full" 
            onClick={() => setCurrentView('home')}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <div 
            className="flex flex-col transition-all duration-500 ease-out origin-left"
          >
            <h1 className="text-2xl font-bold leading-none tracking-tight">{selectedBook?.name}</h1>
            <p className="text-base text-muted-foreground leading-tight font-medium mt-1">Capítulo {selectedChapter}</p>
          </div>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {renderChapterControls(false)}
        </div>
      </div>

      <Card className="border-0 shadow-none bg-transparent relative h-[100vh]">
        <CardContent className="p-0 h-full">
          {/* Fogs / Gradients */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background via-background/80 to-transparent z-10 pointer-events-none" style={{ top: '4rem' }} />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

          <ScrollArea className="h-full" onScroll={handleScroll}>
            <div className="space-y-4 px-8 pt-24 pb-32 mx-auto w-full" style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }}>
              {/* Hero Title */}
              <div 
                className="flex flex-col items-center justify-center py-12 transition-all duration-300 ease-out origin-center"
                style={{ 
                  opacity: 1 - scrollProgress,
                  transform: `scale(${1 - (scrollProgress * 0.15)}) translateY(-${scrollProgress * 20}px)`
                }}
              >
                <h1 className="text-4xl font-bold tracking-tight text-center mb-2">{selectedBook?.name}</h1>
                <p className="text-xl text-muted-foreground font-medium uppercase tracking-widest">Capítulo {selectedChapter}</p>
              </div>

              {currentChapterVerses.map((verse) => {
                const verseBookmarks = bookmarks.filter(b => b.verseId === verse.id)
                const hasNotes = verseBookmarks.some(b => b.note)
                const primaryBookmark = verseBookmarks[verseBookmarks.length - 1] 
                const isSelected = selectedVerses.includes(verse.id)
                const colorMap: Record<string, string> = {
                  yellow: 'bg-yellow-100 dark:bg-yellow-900/20',
                  green: 'bg-green-100 dark:bg-green-900/20',
                  blue: 'bg-blue-100 dark:bg-blue-900/20',
                  red: 'bg-red-100 dark:bg-red-900/20',
                  purple: 'bg-purple-100 dark:bg-purple-900/20',
                }
                const bgColor = primaryBookmark && primaryBookmark.color ? colorMap[primaryBookmark.color] : ''
                const selectionClass = isSelected ? 'ring-2 ring-primary ring-offset-2 bg-accent' : ''
                
                // Quebra em palavras para interatividade
                const words = verse.text.split(' ')

                return (
                  <div
                    key={verse.id}
                    onClick={(e) => {
                        // Se clicar no container e não na palavra, limpa exegese
                        if (exegesisLevel) clearExegesis()
                        toggleVerseSelection(verse.id)
                    }}
                    className={`py-2 px-2 transition-all cursor-pointer hover:bg-accent/30 ${bgColor} ${selectionClass} relative group`}
                  >
                    <span className="inline-block font-bold text-primary/40 text-[0.75em] mr-2 select-none tabular-nums tracking-tighter align-top mt-1">
                      {verse.number}
                    </span>
                    <span className="leading-relaxed text-foreground/90 inline">
                      {words.map((word, wordIndex) => {
                         const isInsideRange = exegesisVerseId === verse.id && 
                                               exegesisSelectionRange && 
                                               wordIndex >= exegesisSelectionRange.start && 
                                               wordIndex <= exegesisSelectionRange.end

                         // O popup aparece na última palavra da seleção
                         const isPopupAnchor = exegesisVerseId === verse.id && 
                                               exegesisSelectionRange && 
                                               wordIndex === exegesisSelectionRange.end

                         let isHighlighted = false
                         if (exegesisVerseId === verse.id) {
                           if (exegesisLevel === 'verse') {
                              isHighlighted = true
                           } else if (isInsideRange) {
                              isHighlighted = true
                           }
                         }

                         const savedNote = exegesisNotes.find(n => 
                            n.verseId === verse.id && 
                            wordIndex >= n.rangeStart && 
                            wordIndex <= n.rangeEnd
                         );

                         return (
                           <InteractiveWord
                             key={wordIndex}
                             word={word}
                             index={wordIndex}
                             isSelected={isPopupAnchor || false}
                             isHighlighted={isHighlighted}
                             hasSavedNote={!!savedNote}
                             onClick={(idx, w, e) => {
                                if (savedNote) {
                                    setManualSelection(savedNote.verseId, savedNote.rangeStart, savedNote.rangeEnd, savedNote.level);
                                    handleExegesisAnalyze(
                                        savedNote.content, 
                                        savedNote.level, 
                                        verse.text, 
                                        savedNote.verseId, 
                                        savedNote.rangeStart, 
                                        savedNote.rangeEnd
                                    );
                                } else {
                                    handleExegesisClick(verse.id, idx, w, verse.text, e.shiftKey)
                                }
                             }}
                             onConfirmAnalyze={() => triggerExegesisAnalysis(verse.text)}
                             onClear={clearExegesis}
                           />
                         )
                      })}
                    </span>
                    
                    {hasNotes && (
                      <span className="inline-flex align-middle ml-1">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewingNotesVerseId(verse.id)
                              }}
                            >
                              <StickyNote className="w-4 h-4 fill-current" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Notas do Versículo {verse.number}</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                              <p className="text-base text-muted-foreground italic border-l-4 border-primary/20 pl-4 mb-6 leading-relaxed">
                                "{verse.text}"
                              </p>
                              <div className="space-y-3">
                                {verseBookmarks.filter(b => b.note).map((bookmark) => (
                                  <Card key={bookmark.id} className="border-l-4" style={{ borderLeftColor: `var(--${bookmark.color}-500)` }}>
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className={`w-3 h-3 rounded-full bg-${bookmark.color}-400 ring-2 ring-offset-1 ring-${bookmark.color}-200`} />
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                              {new Date(Number(bookmark.id.split('.')[0])).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-base leading-relaxed">{bookmark.note}</p>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 -mr-2 text-muted-foreground hover:text-destructive"
                                          onClick={() => handleRemoveBookmark(bookmark.id)}
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                              <Button 
                                variant="outline" 
                                className="w-full mt-4 h-12 text-base font-medium"
                                onClick={() => {
                                  setViewingNotesVerseId(null)
                                }}
                              >
                                Fechar
                              </Button>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t flex items-center justify-between max-w-5xl mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
            <Button
              variant="secondary"
              className="h-14 px-8 text-base font-medium rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
              onClick={() => selectedChapter && handleChapterChange(selectedChapter - 1)}
              disabled={!selectedChapter || selectedChapter <= 1}
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Anterior
            </Button>
            
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-[10px]">Capítulo</span>
              <span className="text-xl font-bold tabular-nums leading-none">
                {selectedChapter} <span className="text-muted-foreground/40 font-normal">/</span> {selectedBook?.chapters}
              </span>
            </div>
            
            <Button
              variant="default"
              className="h-14 px-8 text-base font-medium rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary hover:bg-primary/90"
              onClick={() => selectedChapter && handleChapterChange(selectedChapter + 1)}
              disabled={!selectedChapter || !selectedBook || selectedChapter >= selectedBook.chapters}
            >
              Próximo
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Exegesis Popup */}
      <ExegesisPopup 
        isOpen={exegesisOpen}
        isLoading={isExegesisLoading}
        level={currentAnalysisLevel}
        content={exegesisContent}
        verseContext={exegesisContext}
        onClose={handleExegesisClear}
        initialChatMessages={exegesisVerseId && exegesisSelectionRange && currentAnalysisLevel 
            ? exegesisNotes.find(n => n.id === `${exegesisVerseId}-${exegesisSelectionRange.start}-${exegesisSelectionRange.end}-${currentAnalysisLevel}`)?.chatMessages 
            : undefined}
        isSaved={!!(exegesisVerseId && exegesisSelectionRange && currentAnalysisLevel 
            && exegesisNotes.some(n => n.id === `${exegesisVerseId}-${exegesisSelectionRange.start}-${exegesisSelectionRange.end}-${currentAnalysisLevel}`))}
        onSave={handleSaveExegesisNote}
        onDelete={handleDeleteExegesisNote}
      />
    </div>
  )

  const renderSearchView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setCurrentView('home')}>
          <ChevronLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">Resultados da busca</h2>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Termo: "{searchQuery}"</p>
          <p className="text-sm text-muted-foreground mt-2">Funcionalidade de busca em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderBookmarksView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setCurrentView('home')}>
          <ChevronLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">Minhas Marcações</h2>
      </div>
      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma marcação ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {bookmark.verse.chapter.book.name} {bookmark.verse.chapter.number}:{bookmark.verse.number}
                      </Badge>
                      <span className={`w-4 h-4 rounded-full bg-${bookmark.color}-400`} />
                    </div>
                    <p className="text-sm mb-2">{bookmark.verse.text}</p>
                    {bookmark.note && (
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        <strong>Nota:</strong> {bookmark.note}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveBookmark(bookmark.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderOutlinesView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setCurrentView('home')}>
            <ChevronLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">Meus Esboços</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Novo Esboço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Esboço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  placeholder="Título do esboço"
                  value={newOutlineTitle}
                  onChange={(e) => setNewOutlineTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Conteúdo</Label>
                <Textarea
                  placeholder="Escreva seu esboço aqui..."
                  value={newOutlineContent}
                  onChange={(e) => setNewOutlineContent(e.target.value)}
                  rows={6}
                />
              </div>
              <Button onClick={handleAddOutline} className="w-full">Salvar Esboço</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {outlines.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum esboço ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {outlines.map((outline) => (
            <Card key={outline.id} className="hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{outline.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{outline.content}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  Criado em {new Date(outline.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderSettingsView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setCurrentView('home')}>
          <ChevronLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">Configurações</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Leitura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Versão da Bíblia</Label>
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_VERSIONS.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.name} ({version.abbreviation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tamanho da fonte: {fontSize}px</Label>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header 
        className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-all duration-500 ease-in-out"
        style={{
          transform: (currentView === 'chapter' && !isHeaderVisible) ? 'translateY(-100%)' : 'translateY(0)',
          opacity: (currentView === 'chapter' && !isHeaderVisible) ? 0 : 1,
          pointerEvents: (currentView === 'chapter' && !isHeaderVisible) ? 'none' : 'auto'
        }}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {currentView === 'chapter' ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setCurrentView('home')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Menu de Navegação</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4 mt-8">
                    <Button
                      variant={currentView === 'home' ? 'secondary' : 'ghost'}
                      onClick={() => {
                        setCurrentView('home')
                        setMobileMenuOpen(false)
                      }}
                      className="justify-start"
                    >
                      <Home className="w-5 h-5 mr-2" />
                      Início
                    </Button>
                    <Button
                      variant={currentView === 'bookmarks' ? 'secondary' : 'ghost'}
                      onClick={() => {
                        setCurrentView('bookmarks')
                        setMobileMenuOpen(false)
                      }}
                      className="justify-start"
                    >
                      <Bookmark className="w-5 h-5 mr-2" />
                      Marcações
                    </Button>
                    <Button
                      variant={currentView === 'outlines' ? 'secondary' : 'ghost'}
                      onClick={() => {
                        setCurrentView('outlines')
                        setMobileMenuOpen(false)
                      }}
                      className="justify-start"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Esboços
                    </Button>
                    <Button
                      variant={currentView === 'settings' ? 'secondary' : 'ghost'}
                      onClick={() => {
                        setCurrentView('settings')
                        setMobileMenuOpen(false)
                      }}
                      className="justify-start"
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Configurações
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => setCurrentView('home')}
            >
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl hidden sm:inline-block">Bíblia Sagrada</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentView === 'chapter' ? (
              renderChapterControls(true)
            ) : (
              <nav className="hidden md:flex items-center gap-1">
                <Button variant={currentView === 'home' ? 'secondary' : 'ghost'} onClick={() => setCurrentView('home')}>
                  <Home className="w-4 h-4 mr-2" />
                  Início
                </Button>
                <Button variant={currentView === 'bookmarks' ? 'secondary' : 'ghost'} onClick={() => setCurrentView('bookmarks')}>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Marcações
                </Button>
                <Button variant={currentView === 'outlines' ? 'secondary' : 'ghost'} onClick={() => setCurrentView('outlines')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Esboços
                </Button>
                <Button variant={currentView === 'settings' ? 'secondary' : 'ghost'} onClick={() => setCurrentView('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </nav>
            )}
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={`flex-1 container px-4 ${currentView === 'chapter' ? 'pt-0 max-w-none' : 'pt-20 max-w-5xl'}`}>
        {currentView === 'home' && renderHomeView()}
        {currentView === 'chapter' && renderChapterView()}
        {currentView === 'search' && renderSearchView()}
        {currentView === 'bookmarks' && renderBookmarksView()}
        {currentView === 'outlines' && renderOutlinesView()}
        {currentView === 'settings' && renderSettingsView()}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto bg-background">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Bíblia Sagrada © 2024 - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
