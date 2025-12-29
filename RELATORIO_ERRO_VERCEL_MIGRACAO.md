# Relatório de Diagnóstico de Erro e Solução - Projeto Bíblia (Vercel)

## 🚨 O Problema Atual
O site está funcional em ambiente local, mas apresenta **Erro 500 (Internal Server Error)** ao tentar abrir qualquer capítulo da Bíblia na versão de produção (Vercel).

**Sintomas:**
- O site carrega a página inicial.
- Ao clicar em um livro (ex: Gênesis) e capítulo, a página não exibe os versículos e mostra um erro no canto da tela: *"Erro: Não foi possível carregar o capítulo"*.
- Logs da Vercel indicam: `Error: Environment variable not found: DATABASE_URL`.

## 🔍 Diagnóstico Técnico
A raiz do problema é uma **incompatibilidade arquitetural** entre o banco de dados escolhido e a plataforma de hospedagem.

1.  **Banco de Dados SQLite Local:** O projeto está configurado para usar um arquivo local (`db/custom.db`) via SQLite.
2.  **Limitação da Vercel:** A Vercel utiliza uma infraestrutura "Serverless" (sem servidor fixo). Isso significa que:
    - Ela não suporta bancos de dados baseados em arquivos locais para escrita.
    - O sistema de arquivos é temporário (ephemeral). Qualquer dado gravado (como um favorito ou nota de usuário) seria apagado minutos depois.
    - O erro específico `DATABASE_URL` ocorre porque a aplicação espera saber onde está o banco, mas essa configuração não existe no ambiente de produção.

3.  **Mito da "Arquitetura Híbrida":**
    - Havia uma suposição de que o projeto usava SQLite apenas para leitura (texto bíblico) e Supabase para usuários.
    - **A Realidade do Código:** A análise do código (`src/lib/db.ts` e `schema.prisma`) confirmou que a aplicação usa **uma única conexão** do Prisma para *tudo*. Como ela está configurada para SQLite, ela tenta buscar *tudo* no arquivo local, o que falha na nuvem.

## ✅ A Solução Recomendada: Migração Total para Supabase

Para corrigir o erro e garantir que o site funcione profissionalmente (permitindo login, salvar favoritos, etc.), é necessária uma migração completa.

### Passos para Resolução:

1.  **Mudança de Provider:**
    - Alterar o arquivo `prisma/schema.prisma` para usar `postgresql` (Postgres) em vez de `sqlite`.

2.  **Migração de Dados (O Grande Desafio):**
    - O arquivo `custom.db` atual contém todos os textos da Bíblia (aprox. 55MB).
    - Como não podemos simplesmente "copiar e colar" o arquivo SQLite para o Supabase, precisamos:
        1.  Criar um script para ler todos os dados do SQLite local.
        2.  Converter esses dados para um formato intermediário (JSON).
        3.  Inserir esses dados no banco de dados Supabase na nuvem.

3.  **Configuração de Ambiente:**
    - Configurar a variável `DATABASE_URL` no painel da Vercel apontando para o banco de dados do Supabase.

### Benefícios Desta Solução
- **Sincronização Real:** Seus usuários poderão acessar favoritos e notas de qualquer dispositivo.
- **Estabilidade:** Elimina os erros de "arquivo não encontrado" ou "banco bloqueado".
- **Escalabilidade:** O Supabase suporta milhares de acessos simultâneos muito melhor que um arquivo SQLite.

---
*Documento gerado para auxiliar na manutenção e correção do deploy na Vercel.*
