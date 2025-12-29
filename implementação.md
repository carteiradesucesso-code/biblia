# Especificação Funcional e de UX: Leitura Bíblica Exegética Interativa

Este documento serve como a "Fonte da Verdade" para o desenvolvimento da funcionalidade de leitura interativa. Qualquer IA ou desenvolvedor deve seguir estritamente estas diretrizes para garantir a integridade do conceito e a fluidez da experiência do usuário (UX).

## 1. O Conceito Fundamental
Transformar o texto bíblico estático em uma interface viva e exploratória. O objetivo é fornecer ao usuário uma ferramenta de **exegese instantânea** (análise profunda do texto original Hebraico/Grego) acessível via "Point-and-Click", sem exigir conhecimento prévio das línguas originais.

**A IA não deve pregar; ela deve explicar.** Ela atua como um dicionário exegético contextual inteligente.

---

## 2. Mecânica de Interação: O "Clique Progressivo"
O sistema deve interpretar a intenção do usuário baseando-se na repetição do clique sobre o mesmo elemento (palavra).

### Nível 1: A Palavra (1º Clique)
*   **Ação do Usuário:** Clica em uma palavra específica (ex: "No *princípio*").
*   **Foco da Análise:** Etimologia, definição léxica e sentido estrito da palavra no original (Hebraico/Grego) para aquele contexto específico.
*   **Seleção Visual:** Apenas a palavra clicada é destacada.

### Nível 2: A Frase/Sintaxe (2º Clique na mesma palavra)
*   **Ação do Usuário:** Clica novamente na palavra que já está selecionada.
*   **Foco da Análise:** Contexto imediato. Como essa palavra se conecta gramaticalmente com as vizinhas? (Sintaxe, preposições, regência).
*   **Seleção Visual:** O destaque se expande automaticamente para cobrir a frase ou expressão relacionada (ex: "*No princípio criou Deus*").

### Nível 3: O Versículo/Teologia (3º Clique)
*   **Ação do Usuário:** Clica uma terceira vez na seleção.
*   **Foco da Análise:** Visão macro. Qual a mensagem teológica central do versículo completo?
*   **Seleção Visual:** O versículo inteiro é destacado.

---

## 3. Diretrizes de UI/UX (Anti-Frustração)
A experiência deve ser fluida, perdoar erros e nunca bloquear a leitura.

### 3.1. Feedback Visual Imediato (O "Quadrinho Preto")
*   **Requisito:** No momento exato do clique (0ms de delay), o elemento clicado deve mudar de estado.
*   **Estilo:** Fundo **Preto (#000000)** com texto **Branco (#FFFFFF)** e bordas levemente arredondadas (rounded-md).
*   **Objetivo:** Contraste máximo. O usuário deve saber exatamente o que o sistema "está olhando".

### 3.2. Prevenção de Disparos Acidentais (Debounce)
*   **Problema:** O usuário clica errado ou muda de ideia rapidamente. Chamar a API imediatamente desperdiça recursos e gera "pisca-pisca" de informações erradas.
*   **Solução:** Implementar um **Debounce de 600ms**.
    *   Ao clicar, o destaque visual é imediato.
    *   O sistema aguarda 600ms. Se nenhuma outra ação ocorrer, a requisição à IA é disparada.
    *   Se o usuário clicar em outra palavra antes dos 600ms, o timer anterior é cancelado, o destaque antigo some, e o processo reinicia na nova palavra.

### 3.3. Saída Rápida (Easy Dismiss)
*   **Cenário:** O usuário quer limpar a tela.
*   **Ação:** 
    1.  Clicar em qualquer espaço vazio fora do texto.
    2.  Clicar no botão "X" do popup.
    3.  Pressionar a tecla "Esc".
*   **Resultado:** Todas as seleções somem e o popup fecha instantaneamente.

### 3.4. O Popup de Resposta
*   **Tipo:** Janela flutuante não-modal (Overlay). Não deve bloquear a tela inteira.
*   **Comportamento:** Deve surgir de forma suave. Posicionamento inteligente para não cobrir o texto que está sendo lido (preferência: abaixo da seleção).
*   **Conteúdo:**
    *   Cabeçalho com botão de fechar.
    *   Indicador visual do nível atual (Palavra > Frase > Versículo).
    *   Área de texto com a resposta da IA.

> **NOTA:** A funcionalidade de arrastar (draggable) foi **removida** para simplificar. O posicionamento inteligente automático atende melhor à maioria dos casos de uso, especialmente em dispositivos móveis.

---

## 4. Arquitetura Técnica

### Frontend (Cliente)
*   Responsável por gerenciar o estado da seleção (qual palavra, qual nível).
*   Responsável pelo timer de debounce.
*   Responsável por renderizar o texto bíblico palavra por palavra (tokenização) para permitir a interatividade individual.

### Backend (API Route)
*   Rota segura (ex: `/api/ai/analyze`) para ocultar a chave da API.
*   ~~Lê a chave de API do arquivo `CHAVE.txt` na raiz do sistema.~~ **DEPRECIADO!**
*   **CORREÇÃO DE SEGURANÇA:** A chave da API deve ser lida de **variáveis de ambiente** (`process.env.GEMINI_API_KEY`), configurada no arquivo `.env.local`.
*   Constrói o prompt adequado baseado no nível solicitado (word/phrase/verse) e envia ao Google Gemini.

> **IMPORTANTE:** O arquivo `CHAVE.txt` na raiz do projeto é uma **má prática de segurança**. Expor chaves de API em arquivos texto representa risco de vazamento. A migração para variáveis de ambiente é obrigatória.

### Persona da IA (Prompting)
*   **Role:** Especialista em Exegese Bíblica e Línguas Originais.
*   **Tom:** Acadêmico, objetivo, claro e em Português do Brasil.
*   **Restrição:** Proibido "pregar" ou criar devocionais genéricos. A resposta deve ser estritamente analítica sobre o texto fornecido.

---

## 5. Considerações e Decisões Técnicas

### 5.1. O que foi mantido (Considerações aceitas)
| Aspecto | Justificativa |
|---------|---------------|
| Clique Progressivo (3 níveis) | Excelente UX - evita sobrecarga e permite exploração gradual |
| Debounce de 600ms | Essencial para evitar chamadas desnecessárias à API |
| Persona da IA estritamente analítica | Mantém a ferramenta útil e diferenciada |
| Feedback visual imediato (fundo preto) | Contraste máximo = clareza absoluta |
| Saída rápida (ESC, clique fora) | Padrão de UX moderno |

### 5.2. O que foi ajustado (Correções aplicadas)
| Aspecto Original | Problema Identificado | Correção Aplicada |
|------------------|----------------------|-------------------|
| Popup draggable | Complexidade alta, ruim em mobile | Posicionamento inteligente automático |
| Chave de API em `CHAVE.txt` | Risco grave de segurança | Usar `process.env.GEMINI_API_KEY` |

---

## 6. Pendências de Banco de Dados

> **NOTA:** As seguintes tarefas requerem manipulação do banco de dados e devem ser executadas **separadamente** da implementação de código.

### 6.1. Tokenização de Palavras (Opcional/Futuro)
Se for necessário armazenar análises exegéticas para cache ou offline, considerar criar tabela:

```sql
CREATE TABLE word_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id UUID REFERENCES verse(id) ON DELETE CASCADE,
  word_index INTEGER NOT NULL,
  word_original TEXT NOT NULL,
  analysis_level_1 TEXT, -- Etimologia
  analysis_level_2 TEXT, -- Sintaxe
  analysis_level_3 TEXT, -- Teologia
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_word_analysis_verse ON word_analysis(verse_id);
CREATE INDEX idx_word_analysis_word ON word_analysis(word_original);
```

### 6.2. Verificar Estrutura do `profiles`
Garantir que a tabela `profiles` tem coluna `preferences` do tipo JSONB para armazenar configurações de fonte, versão, etc.

### 6.3. Dados de Versículos
Garantir que os versículos estão populados no banco. O sistema atual espera dados na estrutura:
- `Book` → `Chapter` → `Verse`
- Versão `arc` (Almeida Revista e Corrigida) deve estar disponível

---

## 7. Arquivos do Projeto

### Estrutura de Novos Arquivos
```
src/
├── app/
│   └── api/
│       └── ai/
│           └── analyze/
│               └── route.ts          # [NOVO] API do Gemini
├── components/
│   └── bible/
│       ├── InteractiveWord.tsx       # [NOVO] Palavra clicável
│       └── ExegesisPopup.tsx         # [NOVO] Popup de análise
├── hooks/
│   └── useProgressiveClick.ts        # [NOVO] Hook de clique progressivo
```

### Arquivos Modificados
- `src/app/page.tsx` - Integração dos novos componentes na renderização de versículos
