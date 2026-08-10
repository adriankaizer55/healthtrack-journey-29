# HealthTrack Hub

Aqui está a versão otimizada especificamente para o Lovable:

Crie um protótipo completo e navegável do app "HealthTrack" — plataforma de saúde e bem-estar. Use React + React Router + Tailwind CSS + Context API. Todas as rotas devem estar declaradas e funcionais — nenhum clique pode gerar erro 404.

---

## IDENTIDADE VISUAL

- Primária: azul #2563EB → #3B82F6
- Destaque: teal #14B8A6 (gradiente com azul no logo e botões principais)
- Fundo claro: #F8FAFC | Fundo escuro: #0F172A e #1E293B
- Cards: rounded-2xl, shadow-sm, fundo branco (claro) / #1E293B (escuro)
- Botões: gradiente azul→teal, rounded-xl, texto branco bold
- Tipografia: Inter (Google Fonts)
- Bottom navigation fixa com 5 itens no mobile: Início, Hábitos, Alimentação, IA Coach, Mais
- Sidebar fixa à esquerda no desktop

---

## MODO ESCURO FUNCIONAL

- Provider global com classe `dark` no `<html>`
- Toggle em Acessibilidade altera o tema de TODO o app em tempo real
- Persistir via localStorage
- Todas as telas com variantes dark: no Tailwind

---

## ROTAS

/ → redireciona para /login
/login
/cadastro
/onboarding
/dashboard
/habitos
/alimentacao
/ia-coach
/hidratacao
/mais
/perfil
/notificacoes
/ajuda
/acessibilidade
/acessibilidade/modo-escuro
/acessibilidade/alto-contraste
/acessibilidade/fonte-grande
/acessibilidade/leitura-simplificada
/acessibilidade/navegacao-por-voz

- → página 404 simples (nunca acionada por clique interno)

---

## TELAS

### /login

Logo (coração com onda em gradiente azul/teal) + "HealthTrack" + tagline "Mais acessível. Mais humano. Mais você." | Campos: e-mail e senha (olho mostrar/ocultar) | Checkbox "Lembrar de mim" + link "Esqueci minha senha" | Botão "Entrar" → /dashboard | Botão "Criar uma conta" → /cadastro | Link "Precisa de ajuda?"

### /cadastro

Seta voltar → /login | Campos: nome, e-mail, senha, confirmação de senha | Checkbox termos | Botão "Cadastrar" → /onboarding | Link "Já tem conta? Entrar" → /login

### /onboarding

4 etapas com barra de progresso:

1. Objetivo (Perder peso / Manter peso / Ganhar massa / Melhorar saúde) — cards selecionáveis
2. Peso atual e meta em kg
3. Nível de atividade (Sedentário / Leve / Moderado / Intenso)
4. "Tudo pronto, Adrian!" com resumo + botão "Começar" → /dashboard
   Dados salvos no estado global para personalizar metas do app

### /dashboard

Saudação "Olá, Adrian! 👋" com avatar e sino de notificação | Card de progresso: gráfico de linha de peso + indicador circular "-3,1 kg" | Card "Atividades hoje": hábitos com meta e checkmark verde | Card "Calorias consumidas": barra de progresso | Card "Hidratação": copos do dia + atalho → /hidratacao | Streak: "🔥 7 dias seguidos" | Comparativo: "Essa semana: +12% em relação à semana passada"

### /habitos

Título "Hábitos" | Seletor de dias da semana com dia atual em círculo azul | Card progresso: "X/6 hábitos concluídos" + indicador circular + streak 🔥 | Gráfico de barras 7 dias | Lista de hábitos: ícone colorido + nome + meta + valor + checkmark interativo (clicar marca/desmarca e atualiza progresso em tempo real) | Ao clicar em "Beber água" → /hidratacao | Ao concluir todos: animação de celebração + mensagem motivacional | Empty state ilustrado quando vazio

### /alimentacao

Título "Alimentação" | Navegador de data com setas < e > | Grid 2x2: cards de Calorias, Proteínas, Carboidratos, Gorduras com barra de progresso individual | Gráfico de linha semanal | Lista de refeições: thumbnail, nome, horário, descrição, calorias | Botão "+ Adicionar alimento" (gradiente azul/teal) abre modal com: nome, categoria (Café/Almoço/Lanche/Jantar/Ceia), kcal, proteínas, carboidratos, gorduras, horário pré-preenchido, botão "Salvar" que atualiza lista e resumo imediatamente | Empty state quando vazio

### /ia-coach

Layout: header fixo + área chat (flex-1 overflow-y-auto) + input fixo no rodapé — sem scroll na página inteira | Header: avatar robô + "IA Coach — Seu parceiro de saúde" + menu ••• | Bolhas: assistente à esquerda com avatar, usuário à direita em azul | Cards dentro do chat: sugestão de treino (ícone, nome, duração, kcal, botão "Começar agora"), card de hidratação com barra de progresso | Scroll automático até última mensagem | Input "Pergunte algo..." com ícone de anexo, microfone e botão enviar | Tom humano, caloroso e motivacional, menciona "Adrian" pelo nome

### /hidratacao

Seta voltar → /habitos | Abas Dia / Semana / Mês | Indicador circular com % da meta | Grid 2x4 de copos 250ml (preenchidos em azul/teal quando consumidos, pontilhados quando vazios) | Botão "−" e botão "+ Adicionar água" | Gráfico nas abas Semana/Mês | Card "Dica do dia" | Toast "Água registrada ✓" ao adicionar

### /acessibilidade

Lista com 5 opções (ícone + nome + toggle + seta → sub-rota):

- Modo escuro → /acessibilidade/modo-escuro (toggle FUNCIONAL que altera tema do app + opções Agendar e Sempre ativado)
- Alto contraste → /acessibilidade/alto-contraste (toggle + radio: preto e branco / amarelo / azul, aplica no app)
- Fonte grande → /acessibilidade/fonte-grande (slider tamanho + prévia ao vivo, aplica CSS variable no app)
- Leitura simplificada → /acessibilidade/leitura-simplificada (toggle + exemplo antes/depois)
- Navegação por voz → /acessibilidade/navegacao-por-voz (toggle + seletor idioma + botão "Testar" com Web Speech API)

### /mais

Menu com ícones navegando para:
Perfil → /perfil | Notificações → /notificacoes | Acessibilidade → /acessibilidade | Privacidade (LGPD) → tela com política resumida + "Exportar meus dados" | Ajuda → /ajuda (FAQ em acordeão + "Fale conosco") | Sobre o app → versão e missão | Sair da conta → /login

### /perfil

Foto editável | Campos: nome (Adrian), e-mail, peso atual, meta, unidade kg/lb | Botão "Salvar" com toast de confirmação | Seção de conquistas/badges obtidos | Botão "Sair da conta" → /login

### /notificacoes

Toggles de preferências: lembrete de hidratação, hábitos diários, sugestões IA Coach, relatório semanal

---

## GAMIFICAÇÃO

- Streak 🔥 com contador de dias no Dashboard e Hábitos
- Badges/conquistas no Perfil: grid com conquistados (coloridos) e bloqueados (cinza). Exemplos: "Primeira semana 🏅", "30 dias de hidratação 💧", "Madrugador ☀️", "Mestre dos hábitos 🏆"
- Animação de celebração ao concluir todos os hábitos do dia

---

## QUALIDADE E POLISH

- Skeleton loaders (pulse animation) em todas as telas durante carregamento
- Empty states ilustrados com texto motivacional e botão de ação nas telas: Hábitos, Alimentação, Chat, Conquistas
- Toasts no canto superior direito (desktop) / topo (mobile) por 3 segundos: "Água registrada ✓", "Alimento adicionado ✓", "Hábito concluído ✓", "Configurações salvas ✓", "Erro ao salvar ✗"
- Tela de erro de conexão: ilustração + "Sem conexão" + botão "Tentar novamente"
- Área de toque mínima 44x44px em todos os elementos interativos
- Hover e focus visível em todos os elementos clicáveis
- Transições suaves: transition-all duration-300

---

## REGRAS DE NAVEGAÇÃO — OBRIGATÓRIO

- NENHUM botão ou link com href="#" ou sem destino definido
- Todos usam useNavigate() ou <Link to="..."> para rotas existentes
- Item ativo na sidebar/bottom nav destacado em azul
- Botão de voltar em todas as telas secundárias
- Validar navegação completa antes de finalizar — nenhum clique resulta em 404

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cf1a70b8-559a-4f9c-a339-40f91197a917).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
