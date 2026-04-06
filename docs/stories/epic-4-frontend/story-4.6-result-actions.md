# Story 4.6: Result actions — download, gerar otimizado, copy

## Status: Draft

## Descricao
Implementar o componente ResultActions com botoes de acao sobre o resultado do espelhamento: download do JSON original, geracao de versao otimizada com sugestoes da IA, download do JSON otimizado e copia para clipboard. Essas acoes permitem ao usuario extrair valor concreto do espelhamento e levar os resultados para uso externo.

## Acceptance Criteria
- [ ] Given o JSON original esta disponivel, When o usuario clica "Download Original", Then deve baixar um arquivo .json com nome baseado no dominio (ex: exemplo-com.json)
- [ ] Given o JSON original esta disponivel, When o usuario clica "Gerar com Sugestoes", Then deve chamar o endpoint /optimize e exibir loading enquanto processa
- [ ] Given a otimizacao completou, When o JSON otimizado retorna, Then deve exibir o JSON otimizado no viewer e habilitar o botao "Download Otimizado"
- [ ] Given o JSON otimizado esta disponivel, When o usuario clica "Download Otimizado", Then deve baixar um arquivo .json com sufixo -otimizado (ex: exemplo-com-otimizado.json)
- [ ] Given qualquer JSON esta visivel no viewer, When o usuario clica "Copiar", Then o JSON deve ser copiado para o clipboard e o botao deve mostrar feedback visual (icone check por 2 segundos)
- [ ] Given a otimizacao falhou, When o erro retorna, Then deve exibir toast de erro com mensagem e botao retry
- [ ] Given nenhuma otimizacao foi gerada ainda, When o usuario observa, Then o botao "Download Otimizado" nao deve estar visivel

## Scope
### IN
- Componente ResultActions com barra de botoes
- Botao "Download Original" com icone Download
- Botao "Gerar com Sugestoes" com icone Sparkles e loading state
- Botao "Download Otimizado" (condicional, aparece apos gerar)
- Botao "Copiar" com feedback visual de sucesso
- Integracao com endpoint /optimize
- Download via Blob URL + anchor click

### OUT
- Compartilhamento direto (link, email)
- Preview side-by-side original vs otimizado
- Historico de otimizacoes
- Edicao manual antes de download

## Technical Notes
- Download: criar Blob com JSON.stringify(data, null, 2), gerar URL com URL.createObjectURL, trigger click em anchor invisivel
- Nome do arquivo: extrair dominio da URL, sanitizar (replace dots/slashes com hifens)
- Copy: usar navigator.clipboard.writeText(), com fallback para document.execCommand('copy') em browsers antigos
- Feedback do copy: useState com setTimeout de 2s para resetar icone
- Botao "Gerar com Sugestoes" deve usar o provider configurado (Story 4.2)
- Usar shadcn/ui Button com variantes: default, outline, ghost
- Icones Lucide: Download, Sparkles, Copy, Check, RefreshCw (retry)
- Loading state no botao de otimizar: spinner + texto "Gerando..."

## Dependencies
- Story 4.1 (layout base)
- Story 4.2 (provider configurado para chamar /optimize)
- Story 4.3 (JSON viewer para exibir resultado otimizado)
- Endpoint /optimize implementado (Epic 3)

## Estimate: 2

## File List
(preenchido durante dev)
