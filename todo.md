# Controle de Entregas - TODO

## Banco de Dados
- [x] Criar schema com tabelas: deliveries, drivers, delivery_movements
- [x] Aplicar migrations ao banco de dados

## Backend (APIs)
- [x] Implementar CRUD de entregas (criar, listar, atualizar, deletar)
- [x] Implementar CRUD de motoristas
- [x] Implementar API de saída de entrega (atribuir motorista)
- [x] Implementar API de retorno de entrega (registrar entrega/retirada)
- [x] Implementar API de busca de notas fiscais
- [x] Implementar API de filtros avançados

## Frontend - Dashboard
- [x] Criar layout principal com sidebar navigation
- [x] Implementar Dashboard com listagem de entregas
- [x] Implementar tabela com colunas: N.Nota, Cliente, Endereço, Status, Motorista, Data
- [x] Adicionar filtros: Status, Motorista, Data, Bairro
- [ ] Implementar paginação

## Frontend - Formulários
- [x] Criar formulário de Entrada de Entrega
- [x] Criar formulário de Saída de Entrega (atribuir motorista)
- [x] Criar formulário de Retorno de Entrega (confirmar entrega/retirada)
- [x] Criar formulário de Cadastro de Motorista

## Frontend - Busca
- [x] Implementar barra de busca por N.Nota
- [x] Implementar busca por Código Cliente
- [x] Implementar busca por Telefone

## Frontend - Design
- [x] Aplicar design elegante com Tailwind CSS
- [x] Implementar tema consistente
- [x] Adicionar ícones e micro-interações
- [x] Garantir responsividade

## Testes
- [x] Testar CRUD de entregas
- [x] Testar CRUD de motoristas
- [x] Testar fluxo de entrada/saída/retorno
- [x] Testar buscas e filtros

## Melhorias Solicitadas

### Validação e Duplicatas
- [x] Validar duplicatas por N.Nota + Código Cliente (não apenas N.Nota)
- [x] Rejeitar entrada se combinação já existe
- [x] Mensagem de erro clara ao usuário

### Auto-preenchimento de Cliente
- [x] Buscar cliente por Código Cliente no formulário
- [x] Auto-preencher Nome, Endereço, Bairro, Telefone
- [x] Permitir edição dos campos auto-preenchidos

### Filtros de Busca
- [x] Filtro por N.Nota (busca exata)
- [x] Filtro por Código Cliente (busca exata)
- [x] Combinar filtros com status e bairro

### Cores de Status
- [x] Pendente: Azul (#3B82F6)
- [x] Em Trânsito: Amarelo (#F59E0B)
- [x] Entregue: Verde (#10B981)
- [x] Retornado: Vermelho (#EF4444)
- [x] Aplicar cores em badges, linhas de tabela e cards

## Sistema de Login e Cadastro

### Banco de Dados
- [x] Criar tabela de usuários simples (username, password, createdAt)
- [x] Adicionar usuário padrão (grupotmc/123456)

### Backend (APIs)
- [x] Implementar API de login com validação de credenciais
- [x] Implementar API de cadastro de novo usuário
- [x] Implementar API de logout
- [x] Criar middleware de autenticação

### Frontend
- [x] Criar página de Login
- [x] Criar página de Cadastro
- [x] Implementar redirecionamento para login se não autenticado
- [x] Adicionar botão de logout no Dashboard

### Segurança
- [x] Hash de senhas com bcrypt
- [x] Sessão com localStorage
- [x] Proteção de rotas privadas
