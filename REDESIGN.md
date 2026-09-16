# Redesign EstudarHub — sistema WA.S

Ramo: `redesign/wa-s-system`

## O que se manteve
- Cores do EstudarHub: azul `#3B82F6` (primária), `hsl(217 91% 50%)` (hover), neutros ardósia e as seis cores de rank.
- Toda a lógica, serviços, rotas e contratos com a API.

## O que veio do sistema WA.S
- **Tipografia:** Unbounded (títulos de página e números), Manrope (texto), JetBrains Mono (contagens, horas, telefone).
- **Geometria sona:** `src/shared/lib/sona.ts` gera lusona (esteira entrelaçada, uma só linha quando mdc(colunas, linhas) = 1).
  Usado na página inicial, painel de entrada, capas sem imagem, estados vazios, chat e 404.
- **Ranks como losangos** (`RankDiamond`, `RankBadge`).
- **Latão `#B8935A`** só no ponto central do símbolo e na assinatura "Um produto WA.S".
- **Símbolo novo** do EstudarHub: `src/shared/ui/brand/EstudarHubMark.tsx` e `public/brand/estudarhub-mark.svg`.

## Estrutura nova (compatível com FSD)
```
src/shared/
  lib/sona.ts
  ui/
    brand/      Logo, EstudarHubMark, Lusona, SonaCover, WASignature
    Avatar, PageHeader/BackLink, FilterChip/FilterRow,
    Form (Field, FormSection, FormActions), FileDrop, InstitutionMark
    index.ts    (importar de '@/shared/ui')
```
Classes utilitárias em `src/index.css`: `field`, `field-select`, `btn-primary`, `btn-secondary`,
`panel`, `page-title`, `detail-title`, `section-title`, `sona-dots`.

A reestruturação completa em Feature-Sliced Design fica para uma fase seguinte.

## Páginas
Refeitas: página inicial, entrar, criar conta, retorno OAuth, projectos, detalhe de projecto, novo projecto,
eventos, detalhe de evento, novo evento, pessoas, instituições e detalhe, perfil, editar perfil, convites,
chat, 404, casca da administração (barra lateral, barra superior, navegação móvel) e painel.
Restantes páginas de administração: herdam o sistema (tokens, título, botões, cartões) sem redesenho próprio.

## Erros corrigidos
- Chat: campo de mensagem e pesquisa perdiam o foco a cada tecla (componentes definidos dentro da página).
- Convites: página em branco quando a lista estava vazia.
- Painel de administração: página em branco com resposta parcial da API.
- Administração: "Sair" não terminava sessão; ponto de notificação falso; sem navegação abaixo de `lg`.
- Barra superior repetia a navegação da barra lateral; barra inferior tinha o Dashboard duplicado.
- Meta description falava do Brasil; `lang` passou a `pt-AO`; datas em `pt-AO`.
- Texto que prometia "arrastar" ficheiros sem suporte; agora `FileDrop` aceita largar.
- Menus e botões shadcn ficavam azuis no hover (o token `accent` é azul forte neste projecto).
- Gráficos da administração ilegíveis no tema escuro (cores fixas).
- Tema escuro com clarão branco ao carregar (script no `index.html`).
- Removidos números inventados na página inicial ("1.000+ projectos", "4.000+ estudantes").
- Linguagem passada a português europeu (palavra-passe, utilizadores, guardar, actualizar, etc.).

## Pontos em aberto
- O painel de administração usa `src/data/adminMockData.ts` quando a API falha (agora com aviso visível).
- `AuthContext` suporta Google e GitHub, mas a página de entrada não tem esses botões.
- Erros de lint já existentes (`any`, `return` dentro de `finally`) e o erro de tipos em `src/services/api.ts` não foram tocados.
