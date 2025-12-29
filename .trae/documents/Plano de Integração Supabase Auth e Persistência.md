# Integração de Login Discreto e Persistência com Supabase

Este plano visa integrar o Supabase ao projeto existente para permitir que usuários façam login e salvem suas preferências (tamanho da fonte, tema) e progresso de leitura, sem bloquear o acesso público à leitura da Bíblia.

## 1. Configuração do Banco de Dados (Supabase)
Utilizaremos o MCP Supabase para criar as tabelas necessárias para persistência de dados do usuário.
*   **Tabela `public.profiles`**:
    *   `id`: UUID (Chave primária, referência a `auth.users`).
    *   `preferences`: JSONB (Armazena configurações como tamanho da fonte, tema, etc.).
    *   `last_location`: JSONB (Armazena livro e capítulo onde parou).
    *   `updated_at`: Timestamp.
*   **Políticas de Segurança (RLS)**:
    *   Permitir que usuários visualizem e editem apenas seus próprios perfis.

## 2. Instalação de Dependências
*   Instalar `@supabase/supabase-js` e `@supabase/ssr` para integração com Next.js App Router.

## 3. Configuração do Cliente Supabase
*   Criar estrutura de clientes em `src/lib/supabase/`:
    *   `client.ts`: Cliente para componentes Client-side (navegador).
    *   `server.ts`: Cliente para componentes Server-side (cookies).

## 4. Contexto de Autenticação
*   Criar `src/components/auth-provider.tsx`:
    *   Gerenciar o estado global do usuário (logado/deslogado).
    *   Fornecer funções de `signInWithOtp` (Magic Link) e `signOut`.

## 5. Interface de Usuário (Login Discreto)
*   **Novo Componente `UserNav`**:
    *   Adicionar um botão discreto (ícone de usuário) no cabeçalho superior (`src/app/page.tsx`).
    *   **Estado Deslogado**: Ao clicar, abre um `Dialog` pedindo o e-mail para envio do Magic Link.
    *   **Estado Logado**: Exibe um menu dropdown simples com o e-mail do usuário e opção "Sair".
*   **Integração no Header**:
    *   Inserir este componente no cabeçalho fixo existente, mantendo o design limpo.

## 6. Lógica de Persistência
*   **Carregamento**: Ao entrar (login bem-sucedido), buscar as preferências na tabela `profiles` e atualizar o estado local da aplicação (`fontSize`, `currentBook`, etc.).
*   **Salvamento Automático**:
    *   Criar um *hook* ou efeito que monitora mudanças em `fontSize` e `selectedChapter`.
    *   Salvar essas alterações no Supabase (com *debounce* para evitar excesso de requisições).

## Resumo Técnico
A aplicação continuará funcionando normalmente para visitantes anônimos. A camada de Supabase será "aditiva", ativando recursos de sincronização apenas quando uma sessão de usuário for detectada.
