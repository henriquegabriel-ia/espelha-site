# Story 1.1: Setup projeto React + Vite + Tailwind + shadcn/ui

## Status: Draft

## Descricao
Inicializar o projeto base do Espelha Site com a stack definida (React + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui). Criar a estrutura de pastas padrao e configurar ferramentas de qualidade de codigo. Este e o alicerce sobre o qual todas as demais stories serao construidas.

## Acceptance Criteria
- [ ] Given o repositorio vazio, When rodar `npm run dev`, Then o app React inicia sem erros na porta padrao do Vite
- [ ] Given o projeto inicializado, When inspecionar o `vite.config.ts`, Then React e TypeScript estao configurados com path aliases (`@/`)
- [ ] Given Tailwind CSS v4 instalado, When adicionar classes utilitarias em um componente, Then os estilos sao aplicados corretamente no navegador
- [ ] Given shadcn/ui configurado, When importar um componente (ex: `<Button />`), Then ele renderiza com o tema padrao
- [ ] Given a estrutura de pastas, When listar `src/`, Then existem os diretorios: `components/`, `components/ui/`, `hooks/`, `lib/`, `types/`
- [ ] Given ESLint + Prettier configurados, When rodar `npm run lint`, Then o linter executa sem erros no codigo base inicial

## Scope
### IN
- Scaffold do projeto com `npm create vite@latest` (React + TypeScript)
- Instalacao e configuracao do Tailwind CSS v4
- Instalacao e configuracao do shadcn/ui com tema padrao
- Criacao da estrutura de pastas: `components/`, `components/ui/`, `hooks/`, `lib/`, `types/`
- Configuracao de path aliases (`@/` -> `src/`)
- Setup ESLint + Prettier com regras basicas para React/TypeScript
- Componente placeholder na home para validar stack

### OUT
- Integracao com Supabase (Story 1.2)
- Componentes de UI alem do placeholder
- Configuracao de testes (sera em outro epic)
- CI/CD pipeline

## Technical Notes
- Usar Vite 6.x com plugin `@vitejs/plugin-react`
- Tailwind CSS v4 usa a nova engine baseada em Rust; verificar compatibilidade com shadcn/ui
- shadcn/ui nao e uma lib instalada via npm — e um CLI que copia componentes para `components/ui/`
- Path alias `@/` deve ser configurado tanto no `tsconfig.json` quanto no `vite.config.ts`
- Considerar `tsconfig.app.json` separado para o app (padrao Vite 6)

## Dependencies
- Nenhuma (esta e a primeira story do projeto)

## Estimate: 2 pontos

## File List
(preenchido durante dev)
