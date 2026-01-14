# 🌑 SIDERA RPG Platform

Uma plataforma de **Virtual Tabletop (VTT)** desenvolvida sob medida para o sistema de RPG *Sidera*. Focada em horror cósmico, escassez de recursos e narrativa imersiva.

![Sidera Banner]()

## 🔥 Funcionalidades Principais

### Para o Vinculado (Jogador)
- **Ficha Viva:** Cálculos automáticos de Vida, Atributos e Órbita.
- **Arsenal Tático:** Gestão de munição, durabilidade de escudos e mecânica de "sacrifício de item".
- **Farmacopeia:** Uso rápido de consumíveis com feedbacks visuais.
- **Identidade:** Upload de avatar e customização de história.

### Para o Observador (Mestre)
- **Observatório (Dashboard):** Monitoramento em tempo real da saúde e sanidade de todos os jogadores.
- **Intervenção Divina:** Capacidade de alterar status, curar ou punir jogadores remotamente.
- **Projetor Mental:** Envio de imagens e sussurros secretos direto para a tela dos jogadores.
- **Gerenciador de Ameaças:** Bestiário integrado e rolagem de dados de monstros.

## 🛠️ Tecnologias

- **Frontend:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS (Design System Diegético)
- **Backend & Realtime:** Supabase (PostgreSQL, Realtime Subscriptions, Storage)
- **Animações:** Framer Motion

## 🚀 Como Rodar Localmente

1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente no arquivo `.env.local`:
   ```env
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_chave