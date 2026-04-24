# Preview - Delivery Control

Esta pasta contém uma prévia funcional simples para demonstrar o envio de mensagens via WhatsApp Web usando a função sendWhatsAppMessage presente em src/utils/sendWhatsApp.ts.

ATENÇÃO: A automação do WhatsApp Web pode violar os termos de uso do WhatsApp. Use apenas para testes locais e com números que você tem permissão para contatar.

Como usar (rápido):

1) Na raiz do repositório, instale dependências de preview:

   cd preview
   npm install

2) Rodar o servidor de preview (primeira execução deve abrir o navegador para escanear QR):

   # Executa com ts-node
   npm run start

   Por padrão o servidor roda em http://localhost:3000

3) Configurações úteis (variáveis de ambiente):

   WHATSAPP_USERDATA_DIR - diretório para persistir sessão do WhatsApp (padrão: <repo-root>/whatsapp-session)
   HEADLESS - se 'true' roda puppeteer em headless (apenas após autenticar sessão)
   PREVIEW_PORT - porta do servidor (padrão 3000)

4) Primeiro login:

   - Execute o servidor com HEADLESS não definido (ou HEADLESS=false) para abrir Chromium e permitir escanear o QR.
   - Após autenticar, a pasta whatsapp-session (ou a definida em WHATSAPP_USERDATA_DIR) irá conter a sessão.

5) Exemplo de teste: abra http://localhost:3000 e preencha número/mensagem. Clique em "Enviar via API".

Arquivos criados:
- preview/index.html  (UI de demonstração)
- preview/server.ts   (API que usa src/utils/sendWhatsApp.ts)
- preview/package.json
- preview/tsconfig.json
- preview/README.md

Se quiser, eu também:
- adiciono /whatsapp-session ao .gitignore na raiz (se quiser que eu atualize o .gitignore existente, posso fazer isso após checar o arquivo atual),
- crio uma rota Next/Express integrada ao app principal em vez da pasta preview,
- configuro start scripts no package.json raiz.
