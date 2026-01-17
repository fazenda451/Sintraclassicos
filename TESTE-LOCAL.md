# Como Testar o CMS Localmente

## Opção 1: Netlify Dev (Recomendado)

O Netlify Dev simula o ambiente do Netlify localmente, incluindo o CMS.

### Instalação

```bash
npm install
```

### Executar

```bash
npm run dev
```

Ou diretamente:
```bash
npx netlify dev
```

### Aceder ao CMS Local

1. Abre o browser em `http://localhost:8888/admin`
2. O Netlify Dev vai pedir para fazer login (podes usar o modo "test" ou conectar ao Netlify)
3. Testa todas as funcionalidades do CMS

### Vantagens
- Simula exatamente o ambiente do Netlify
- Testa autenticação e Git Gateway
- Vê as alterações em tempo real

---

## Opção 2: Servidor HTTP Simples (Teste Básico)

Para testar apenas o carregamento de conteúdo (sem CMS):

```bash
npm run serve
```

Ou:
```bash
npx serve .
```

Depois abre `http://localhost:3000` no browser.

### Limitações
- Não testa a interface do CMS
- Apenas testa se o site carrega os ficheiros JSON corretamente

---

## Como Reverter Mudanças

### Se ainda não fizeste commit:

```bash
# Ver o que foi alterado
git status

# Descartar TODAS as alterações (cuidado!)
git reset --hard HEAD

# Ou descartar ficheiros específicos
git checkout -- nome-do-ficheiro
```

### Se já fizeste commit mas não fizeste push:

```bash
# Ver histórico
git log

# Voltar para um commit anterior (substitui COMMIT_HASH)
git reset --hard COMMIT_HASH

# Ou voltar 1 commit atrás
git reset --hard HEAD~1
```

### Se já fizeste push:

```bash
# Criar um novo commit que desfaz as mudanças
git revert HEAD

# Ou voltar para um commit específico (cuidado em branches partilhadas!)
git reset --hard COMMIT_HASH
git push --force  # ⚠️ Só se tiveres certeza!
```

---

## Estratégia Segura de Teste

### 1. Criar uma Branch de Teste

```bash
# Criar e mudar para nova branch
git checkout -b teste-cms

# Fazer alterações e commits
git add .
git commit -m "Teste do CMS"

# Testar localmente
npm run dev
```

### 2. Se funcionar, fazer merge

```bash
# Voltar para a branch principal
git checkout main

# Fazer merge da branch de teste
git merge teste-cms

# Fazer push
git push origin main
```

### 3. Se não funcionar, descartar

```bash
# Voltar para a branch principal (descartando a branch de teste)
git checkout main
git branch -D teste-cms
```

---

## Checklist de Teste

Antes de fazer push, testa:

- [ ] O site carrega sem erros no console
- [ ] O conteúdo do CMS aparece corretamente
- [ ] A interface do CMS abre em `/admin`
- [ ] Consegues fazer login no CMS
- [ ] Consegues editar conteúdo
- [ ] As alterações são guardadas
- [ ] O site atualiza após guardar

---

## Problemas Comuns

### "Cannot GET /admin"
- Certifica-te que o `netlify.toml` está configurado corretamente
- Verifica se estás a usar `netlify dev` e não um servidor simples

### "Git Gateway error"
- No modo local, podes precisar de configurar credenciais
- Ou usar o modo "test" do Netlify Dev

### "Content not loading"
- Verifica se os ficheiros JSON estão na pasta `content/`
- Abre a consola do browser para ver erros
- Verifica os caminhos dos ficheiros no `cms-loader.js`

---

## Backup Antes de Testar

Sempre bom fazer backup:

```bash
# Criar uma cópia da branch atual
git branch backup-antes-cms

# Se algo correr mal, voltar para o backup
git checkout backup-antes-cms
```

