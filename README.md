# 🤖 AI Task Manager

> Gerenciador de tarefas full-stack com integração de Inteligência Artificial, desenvolvido com Spring Boot, React, PostgreSQL, Spring AI, Google Gemini e Ollama.

O **AI Task Manager** é uma aplicação web para gerenciamento de tarefas que utiliza Inteligência Artificial para auxiliar no planejamento, análise e organização do trabalho.

O projeto foi desenvolvido com foco em uma arquitetura simples, extensível e preparada para trabalhar com diferentes provedores de IA sem acoplar a regra de negócio a uma implementação específica.

---

## ✨ Funcionalidades

### 📋 Gerenciamento de tarefas

- Criar tarefas
- Listar tarefas
- Visualizar tarefas
- Editar tarefas
- Excluir tarefas
- Definir prioridade
- Definir status
- Definir prazo
- Criar subtarefas
- Consultar subtarefas de uma tarefa

### 🤖 Recursos de Inteligência Artificial

O sistema possui um conjunto de operações de IA integradas ao gerenciamento de tarefas:

- ✍️ **Melhoria de tarefas**
  - Analisa título e descrição
  - Sugere uma versão mais clara e objetiva

- 🔎 **Análise de tarefas**
  - Analisa a tarefa considerando seu contexto
  - Retorna informações estruturadas sobre complexidade e execução

- 🧩 **Decomposição de tarefas**
  - Divide tarefas complexas em subtarefas menores
  - Permite transformar uma tarefa de alto nível em etapas executáveis

- 📊 **Resumo do workspace**
  - Analisa o conjunto de tarefas
  - Gera um resumo geral do estado atual do trabalho

- 💬 **Assistente de IA**
  - Conversa em linguagem natural
  - Utiliza o contexto das tarefas existentes
  - Permite consultar informações do workspace por meio de perguntas

---

## 🧠 Provedores de IA

Um dos principais objetivos técnicos do projeto é permitir a utilização de diferentes provedores de Inteligência Artificial.

Atualmente são suportados:

| Provedor | Característica |
|---|---|
| **Google Gemini** | Modelo de IA acessado através da API do Google |
| **Ollama** | Execução de modelos localmente |

O usuário pode selecionar o provedor globalmente pela interface.

Todas as operações de IA utilizam o provedor selecionado:

- Chat
- Melhoria de tarefas
- Análise
- Decomposição
- Resumo do workspace

---

# 🏗️ Arquitetura

A integração com IA utiliza uma arquitetura baseada em **Adapter + Router**.

A aplicação não chama diretamente Gemini ou Ollama a partir da regra de negócio.

O fluxo é:

```text
┌──────────────────────────┐
│       React / Vite       │
│         Frontend         │
└────────────┬─────────────┘
             │
             │ HTTP / REST
             ▼
┌──────────────────────────┐
│      Spring Boot API     │
│       Controllers        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      TaskAiService       │
│      Regra de negócio    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    AiProviderRouter      │
│                          │
│  Seleciona o provedor    │
└────────────┬─────────────┘
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
┌────────────┐ ┌────────────┐
│   Gemini   │ │   Ollama   │
│   Adapter  │ │   Adapter  │
└────────────┘ └────────────┘
