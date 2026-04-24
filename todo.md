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


## Edição e Exclusão de Entregas

### Backend (APIs)
- [x] Implementar API de atualização de entrega (update)
- [x] Implementar API de exclusão de entrega (delete)
- [x] Validar permissões e dados antes de atualizar/deletar

### Frontend
- [x] Criar página de edição de entrega (EditDelivery.tsx)
- [x] Adicionar botões de ação (Editar/Excluir) na tabela do Dashboard
- [x] Implementar diálogo de confirmação para exclusão
- [x] Redirecionar para edição quando clicar em "Editar"
- [x] Atualizar lista após edição/exclusão com invalidate


## Edição de Status e Cadastro de Motorista

### Edição de Status
- [x] Implementar API para atualizar status de entrega
- [x] Adicionar dropdown de status na página de detalhes da entrega
- [x] Permitir mudança de status: Pendente → Em Trânsito → Entregue/Retornado
- [x] Registrar movimentação ao alterar status

### Cadastro de Motorista
- [x] Implementar API de cadastro de motorista
- [x] Criar formulário de cadastro de motorista (NewDriver.tsx)
- [x] Adicionar botão "Novo Motorista" na página de motoristas
- [x] Validar campos obrigatórios (nome, telefone)
- [x] Atualizar lista de motoristas após cadastro


## Lógica de Status e Gerenciamento de Motoristas

### Lógica de Status Avançada
- [x] Permitir mudança de Retornado para Em Trânsito para nova entrega
- [x] Apenas finalizar quando status for Entregue
- [x] Validar transições de status permitidas

### Gerenciamento de Motoristas
- [x] Implementar API de edição de motorista (update)
- [x] Implementar API de exclusão de motorista (delete) - já existe
- [x] Criar página de edição de motorista (EditDriver.tsx)
- [x] Adicionar botões de editar e excluir na tabela de motoristas
- [x] Implementar diálogo de confirmação para exclusão


## Integração com WhatsApp

### Banco de Dados
- [ ] Criar tabela whatsapp_config para armazenar número, token, status de conexão
- [ ] Criar tabela whatsapp_templates para armazenar mensagens de cada status
- [ ] Criar tabela whatsapp_messages para registrar histórico de mensagens enviadas

### Backend (APIs)
- [ ] Implementar API para login do WhatsApp (conectar número da loja)
- [ ] Implementar API para logout do WhatsApp
- [ ] Implementar API para verificar conectividade do WhatsApp
- [ ] Implementar API para enviar mensagem via WhatsApp
- [ ] Implementar API para atualizar templates de mensagens
- [ ] Integrar envio automático ao mudar status de entrega
- [ ] Implementar envio de pesquisa de satisfação ao finalizar entrega

### Frontend
- [ ] Criar página de configuração do WhatsApp
- [ ] Adicionar formulário de login do número do WhatsApp
- [ ] Exibir status de conectividade (conectado/desconectado)
- [ ] Adicionar botão para desconectar/trocar número
- [ ] Criar interface para editar templates de mensagens
- [ ] Mostrar histórico de mensagens enviadas
- [ ] Adicionar indicador de status no sidebar/header

### Mensagens Automáticas
- [ ] Mensagem para status "Pendente"
- [ ] Mensagem para status "Em Trânsito"
- [ ] Mensagem para status "Entregue"
- [ ] Mensagem para status "Retornado"
- [ ] Pesquisa de satisfação ao finalizar entrega
- [ ] Personalizar mensagens com dados da entrega (N.Nota, motorista, etc)

### Segurança
- [ ] Armazenar token do WhatsApp de forma segura
- [ ] Validar número de telefone antes de enviar
- [ ] Registrar tentativas de envio com sucesso/falha
- [ ] Implementar rate limiting para evitar spam
