# 📋 Testes Manuais - Sistema de Controle de Entregas

## ✅ Teste 1: Login com Credenciais Padrão

**Credenciais:**
- Username: `grupotmc`
- Senha: `123456`

**Passos:**
1. Acessar a página de login
2. Inserir username: `grupotmc`
3. Inserir senha: `123456`
4. Clicar em "Entrar"

**Resultado Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento para Dashboard
- ✅ Exibição do menu lateral com opções: Dashboard, Motoristas, WhatsApp

---

## ✅ Teste 2: Cadastro de Novo Usuário

**Passos:**
1. Na página de login, clicar em "Não tem conta? Cadastre-se"
2. Preencher formulário:
   - Username: `usuario_teste`
   - Senha: `senha123`
   - Confirmar Senha: `senha123`
3. Clicar em "Cadastrar"

**Resultado Esperado:**
- ✅ Usuário criado com sucesso
- ✅ Mensagem de sucesso exibida
- ✅ Redirecionamento para login
- ✅ Possibilidade de fazer login com novo usuário

---

## ✅ Teste 3: Criar Nova Entrega

**Passos:**
1. Fazer login com `grupotmc/123456`
2. Clicar em "Nova Entrega" no Dashboard
3. Preencher formulário:
   - N. Nota: `001`
   - Código Cliente: `CLI001`
   - Nome: `João Silva`
   - Endereço: `Rua A, 123`
   - Bairro: `Centro`
   - Telefone: `11999999999`
   - Observações: `Entrega normal`
4. Clicar em "Salvar"

**Resultado Esperado:**
- ✅ Entrega criada com sucesso
- ✅ Mensagem de confirmação
- ✅ Entrega aparece no Dashboard com status "Pendente"
- ✅ Cor azul indicando status Pendente

---

## ✅ Teste 4: Validação de Duplicatas

**Passos:**
1. Tentar criar outra entrega com:
   - N. Nota: `001`
   - Código Cliente: `CLI001`
2. Clicar em "Salvar"

**Resultado Esperado:**
- ✅ Erro exibido: "Esta combinação de N. Nota e Código Cliente já existe"
- ✅ Entrega não é criada

---

## ✅ Teste 5: Auto-preenchimento de Cliente

**Passos:**
1. Criar uma entrega com dados completos (Teste 3)
2. Criar nova entrega com:
   - N. Nota: `002`
   - Código Cliente: `CLI001`
3. Sair do campo Código Cliente

**Resultado Esperado:**
- ✅ Campos auto-preenchidos com dados do cliente anterior:
  - Nome: `João Silva`
  - Endereço: `Rua A, 123`
  - Bairro: `Centro`
  - Telefone: `11999999999`

---

## ✅ Teste 6: Editar Entrega

**Passos:**
1. No Dashboard, clicar no botão "Editar" (ícone lápis) de uma entrega
2. Alterar dados:
   - Nome: `João Silva Editado`
   - Endereço: `Rua B, 456`
3. Clicar em "Atualizar"

**Resultado Esperado:**
- ✅ Entrega atualizada com sucesso
- ✅ Dados refletidos no Dashboard
- ✅ Mensagem de confirmação

---

## ✅ Teste 7: Deletar Entrega

**Passos:**
1. No Dashboard, clicar no botão "Deletar" (ícone lixo) de uma entrega
2. Confirmar na caixa de diálogo

**Resultado Esperado:**
- ✅ Entrega deletada com sucesso
- ✅ Desaparece do Dashboard
- ✅ Mensagem de confirmação

---

## ✅ Teste 8: Cadastrar Motorista

**Passos:**
1. Clicar em "Motoristas" no menu lateral
2. Clicar em "Novo Motorista"
3. Preencher formulário:
   - Nome: `Carlos Santos`
   - Telefone: `11988888888`
4. Clicar em "Salvar"

**Resultado Esperado:**
- ✅ Motorista criado com sucesso
- ✅ Aparece na lista de motoristas
- ✅ Redirecionamento para página de motoristas

---

## ✅ Teste 9: Editar Motorista

**Passos:**
1. Na página de Motoristas, clicar em "Editar" (ícone lápis)
2. Alterar dados:
   - Nome: `Carlos Santos Editado`
   - Telefone: `11987777777`
3. Clicar em "Atualizar"

**Resultado Esperado:**
- ✅ Motorista atualizado com sucesso
- ✅ Dados refletidos na lista
- ✅ Mensagem de confirmação

---

## ✅ Teste 10: Deletar Motorista

**Passos:**
1. Na página de Motoristas, clicar em "Deletar" (ícone lixo)
2. Confirmar na caixa de diálogo

**Resultado Esperado:**
- ✅ Motorista deletado com sucesso
- ✅ Desaparece da lista
- ✅ Mensagem de confirmação

---

## ✅ Teste 11: Mudar Status de Entrega

**Passos:**
1. No Dashboard, clicar em uma entrega para ver detalhes
2. Na seção de status, clicar no dropdown
3. Selecionar novo status: `Em Trânsito`
4. Confirmar mudança

**Resultado Esperado:**
- ✅ Status alterado para "Em Trânsito"
- ✅ Cor alterada para amarelo
- ✅ Movimentação registrada no histórico
- ✅ Dashboard atualizado

---

## ✅ Teste 12: Retorno e Nova Entrega

**Passos:**
1. Mudar status de entrega para `Retornado`
2. Verificar se é possível mudar para `Em Trânsito` novamente

**Resultado Esperado:**
- ✅ Status muda para "Retornado" (vermelho)
- ✅ Dropdown permite selecionar "Em Trânsito" novamente
- ✅ Permite nova tentativa de entrega

---

## ✅ Teste 13: Finalizar Entrega

**Passos:**
1. Mudar status para `Entregue`
2. Verificar cores e indicadores

**Resultado Esperado:**
- ✅ Status muda para "Entregue" (verde)
- ✅ Entrega marcada como finalizada
- ✅ Cor verde indicando conclusão

---

## ✅ Teste 14: Filtro por Status

**Passos:**
1. No Dashboard, clicar em "Filtro por Status"
2. Selecionar: `Pendente`
3. Aplicar filtro

**Resultado Esperado:**
- ✅ Apenas entregas com status "Pendente" são exibidas
- ✅ Contador atualizado
- ✅ Filtro pode ser removido

---

## ✅ Teste 15: Busca por N. Nota

**Passos:**
1. No Dashboard, preencher campo "Buscar por N. Nota"
2. Inserir: `001`
3. Pressionar Enter ou clicar em buscar

**Resultado Esperado:**
- ✅ Apenas entrega com N. Nota `001` é exibida
- ✅ Busca é sensível e exata
- ✅ Limpar busca retorna todas as entregas

---

## ✅ Teste 16: Busca por Código Cliente

**Passos:**
1. No Dashboard, preencher campo "Buscar por Código Cliente"
2. Inserir: `CLI001`
3. Pressionar Enter ou clicar em buscar

**Resultado Esperado:**
- ✅ Apenas entregas do cliente `CLI001` são exibidas
- ✅ Busca é sensível e exata
- ✅ Limpar busca retorna todas as entregas

---

## ✅ Teste 17: Logout

**Passos:**
1. Clicar no menu de usuário (canto superior direito)
2. Clicar em "Logout"

**Resultado Esperado:**
- ✅ Usuário desconectado
- ✅ Redirecionamento para página de login
- ✅ Sessão encerrada

---

## ✅ Teste 18: Responsividade Mobile

**Passos:**
1. Abrir aplicativo em dispositivo mobile ou emular (F12 > Toggle device toolbar)
2. Testar navegação e entrada de dados

**Resultado Esperado:**
- ✅ Layout adapta-se ao tamanho da tela
- ✅ Menu lateral colapsável
- ✅ Formulários são usáveis em mobile
- ✅ Tabelas são scrolláveis

---

## 📊 Resumo de Testes

| # | Teste | Status | Observações |
|---|-------|--------|-------------|
| 1 | Login Padrão | ⏳ | Pendente |
| 2 | Cadastro Novo Usuário | ⏳ | Pendente |
| 3 | Criar Entrega | ⏳ | Pendente |
| 4 | Validação Duplicatas | ⏳ | Pendente |
| 5 | Auto-preenchimento | ⏳ | Pendente |
| 6 | Editar Entrega | ⏳ | Pendente |
| 7 | Deletar Entrega | ⏳ | Pendente |
| 8 | Cadastrar Motorista | ⏳ | Pendente |
| 9 | Editar Motorista | ⏳ | Pendente |
| 10 | Deletar Motorista | ⏳ | Pendente |
| 11 | Mudar Status | ⏳ | Pendente |
| 12 | Retorno e Nova Entrega | ⏳ | Pendente |
| 13 | Finalizar Entrega | ⏳ | Pendente |
| 14 | Filtro por Status | ⏳ | Pendente |
| 15 | Busca por N. Nota | ⏳ | Pendente |
| 16 | Busca por Código Cliente | ⏳ | Pendente |
| 17 | Logout | ⏳ | Pendente |
| 18 | Responsividade Mobile | ⏳ | Pendente |

---

## 🎯 Instruções para Executar Testes

1. Acesse: `https://deliveryctl-ufcl8cfj.manus.space`
2. Siga os passos de cada teste
3. Marque como ✅ (sucesso) ou ❌ (falha)
4. Anote observações se houver problemas
5. Reporte qualquer erro ou comportamento inesperado

**Data de Teste:** 25/04/2026
**Testador:** [Seu Nome]
**Status Geral:** Pendente de Execução
