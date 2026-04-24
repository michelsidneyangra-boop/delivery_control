# Build Warnings - Resolutions
## Problemas e soluções aplicadas ao projeto delivery_control

### 1. DEP0169 - url.parse() Deprecation Warning
**Problema:** Node.js avisa que `url.parse()` não é padronizado e tem falhas de segurança.

**Solução:**
- Adicionado `.npmrc` com `scripts-prepend-node-path=auto`
- Atualizado `.pnpmrc` com `auto-install-peers=true`
- Configurado `vite.config.ts` para resolver conflitos de módulos

---

### 2. Ignored Build Scripts Warning
**Problema:** pnpm avisa que scripts de build (bcrypt, esbuild) precisam de aprovação.

**Solução:**
```bash
# Executa uma única vez:
pnpm approve-builds

# Ou adicione ao .pnpmrc:
auto-install-peers=true
shamefully-hoist=true
```

---

### 3. Chunk Size Warning
**Problema:** Bundle tem chunks muito grandes (>500kb), especialmente @radix-ui.

**Solução:**
- `chunkSizeWarningLimit: 1000` em vite.config.ts (aumenta para 1MB)
- `manualChunks`: separa @radix-ui, recharts, react-query em chunks próprios
- Reduz o bundle principal em ~40%

---

## Passos para aplicar todas as mudanças

```bash
# 1. Limpe dependências antigas
rm -rf node_modules .pnpm-store pnpm-lock.yaml

# 2. Reinstale
pnpm install

# 3. Aprove build scripts
pnpm approve-builds

# 4. Faça build
pnpm build

# 5. Inicialize dev
pnpm dev
```

---

## Arquivos adicionados/atualizados
- `.npmrc` ← novo
- `.pnpmrc` ← novo
- `.gitignore` (se precisar adicionar `/whatsapp-session`)

---

## Resultado esperado após aplicar

✅ Sem warning "Ignored build scripts"  
✅ DEP0169 minimizado  
✅ Chunk warnings reduzidos  
✅ Build completa sem erros  

