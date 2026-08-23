# Contexto do Projeto: Kibō-no-Iê

O projeto **Kibō-no-Iê** é um sistema completo e integrado de gestão e guia de eventos desenvolvido para a **Sociedade Beneficente Kibô-no-Iê**. Ele é um monorepo composto por três frentes, unidas pela infraestrutura do Firebase.

## 🏗️ Estrutura e Arquitetura

O projeto está dividido em quatro pastas principais na raiz:

1. **`/backend` (Cloud Functions for Firebase)**
   - **Stack**: Node.js 24, TypeScript, Firebase Functions v7.
   - **Função Principal**: Atuar como o "cérebro" centralizado do sistema, provendo todos os endpoints de API (REST) seguros que serão consumidos pelo painel web e pelo app móvel.
   - **Responsabilidades**: Gerenciar o CRUD de Produtos, Lojas/Barracas e Avisos. Processar e salvar uploads de imagens e validar a identidade do usuário através de tokens JWT (`Authorization: Bearer`).
   - **Serviços**: Realtime Database (leitura e estruturação rápida de dados), Storage (armazenamento de fotos) e Firebase Auth.

2. **`/admin` (Painel Administrativo Web)**
   - **Stack**: Next.js 16 (App Router), React 19, TailwindCSS v4.
   - **Função Principal**: Fornecer uma interface gráfica amigável e segura (restrita por login) para que os voluntários e a organização do evento possam cadastrar e alterar dados.
   - **Responsabilidades**: Gerenciar o catálogo de produtos (preços, estoque), atualizar a localização e dados de lojas/barracas no mapa do evento, e publicar avisos gerais. Tudo isso consumindo a API do `/backend`.
   - **Integrações**: Consome os endpoints do `/backend`, valida autenticação no client-side (`AuthContext`) e exibe mapas usando `@react-google-maps/api`.

3. **`/mobile` (App para Visitantes)**
   - **Stack**: Flutter (Dart) - Android e iOS.
   - **Função Principal**: Ser o guia de bolso e cardápio digital oficial para o público final (visitantes do evento), melhorando a experiência do usuário e otimizando filas.
   - **Responsabilidades**: Apresentar um mapa interativo do evento (para a pessoa se localizar e achar as lojas), listar os produtos disponíveis com a função de "carrinho" (apenas para somar valores e agilizar o pedido nos caixas físicos), e exibir um feed ao vivo com recados e comunicados.
   - **Comportamento**: Consome os endpoints de leitura do `/backend` de forma assíncrona, usando models robustos.

4. **`/visitante` (SPA Web PWA para Visitantes)**
   - **Stack**: React 19, Vite, TailwindCSS v4, PWA (Progressive Web App).
   - **Função Principal**: Oferecer a mesma experiência do aplicativo móvel nativo de forma acessível diretamente no navegador, permitindo a instalação via service worker.
   - **Responsabilidades**: Apresentar um mapa interativo do evento, listar produtos disponíveis e exibir o feed de avisos.
   - **Comportamento**: Consome os endpoints de leitura do `/backend` e utiliza as mesmas diretrizes de cores do projeto (Kibô-no-Iê theme).

---

## 🤖 Diretrizes e Regras para o Assistente (Agent)

Ao atuar neste repositório, siga as regras abaixo:

### 1. Respeito à Arquitetura
- **Separação de Responsabilidades**: O `admin` e o `mobile` **não devem** se conectar diretamente ao Realtime Database para operações complexas de escrita; eles devem consumir os endpoints REST disponíveis no `backend`.
- **Rotas e API**: Modificações no banco de dados devem ocorrer no `backend`, através de funções do Firebase Cloud.

### 2. Padrões de Código e Stack
- **Next.js**: Mantenha o padrão do **App Router** no `/admin`.
- **TypeScript**: É a linguagem principal no `/backend`. Adicione sempre tipagens explícitas.
- **Flutter**: Respeite o gerenciamento de estado existente e siga as convenções do Dart e da plataforma. Utilize os modelos (`Product`, `Shop`, `Warning`) ao invés de JSON puro.
- **Tailwind v4**: Utilize apenas as classes do Tailwind no admin. Não crie arquivos CSS personalizados a não ser que estritamente necessário.

### 3. Idioma e Nomenclaturas
- **Código e Variáveis**: Escreva em **Inglês** (ex: `listProducts`, `updateShop`, `Warning`).
- **Comentários, READMEs e UI**: Mantenha em **Português Brasileiro** para facilitar a manutenção pela equipe local e o entendimento dos voluntários e visitantes.

### 4. Testes e Ambientes
- Sempre que fizer alterações que afetem múltiplas pontas (ex: mudar um campo em `Product` no backend), lembre-se de sugerir a atualização das interfaces no `/admin` e dos Models/Parsers no `/mobile`.
- Existem comandos facilitadores no arquivo `Makefile` na raiz (`make dev`, `make backend`, etc) que devem ser preservados e mantidos consistentes com as dependências.

### 5. Padrões de Design e Identidade Visual (Admin Web)
- O projeto web utiliza variáveis globais CSS (`admin/app/globals.css`) que ditam o tema da Kibô-no-Iê.
- **Cores Principais**:
  - `primary-forest` (`#1e4d2b`) e `secondary-leaf` (`#8cb83e`) devem ser usadas para as chamadas principais e elementos de apoio, respectivamente.
  - A cor de fundo padrão das telas é ditada pela variável `kibo-bg` (`#f5f8f2`).
- Procure utilizar essas cores via Tailwind (ex: `bg-primary-forest`, `text-secondary-leaf`) em vez de injetar cores arbitrárias.

### 6. Estrutura de Dados (Realtime Database Schema)
As entidades principais no Firebase seguem rigidamente este contrato:
- **Product**: `{ id: string, name: string, price: number, isAvailable: boolean, category: string, shopId?: string }`
- **Shop**: `{ id: string, name: string, latitude: number, longitude: number, image: string (URL) }`
- **Warning**: `{ id: string, text: string, timestamp: string (ISO-8601/DateTime) }`
> **Atenção Agent**: Ao criar ou modificar endpoints no backend ou models no mobile, espelhe estritamente esses campos para não quebrar a sincronização do monorepo.

### 7. Tratamento de Erros e Logs (Backend)
- Para log de erros nas Cloud Functions, utilize sempre a lib nativa `logger.error(...)` de `firebase-functions/logger` em vez de `console.log`.
- Se uma requisição de API falhar (ex. validação incorreta ou erro interno), a Cloud Function deve retornar um *Status Code* de falha e a mensagem em **texto plano**, ex: `response.status(401).send("Unauthorized")` ou `400 Bad Request`. **Não retorne erros empacotados em JSON** a não ser que tenha sido orientado o contrário.
