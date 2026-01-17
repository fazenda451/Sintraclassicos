# 🔑 Como Configurar a Chave do Google Maps no Netlify

## ⚠️ Problema

O ficheiro `.env` está no `.gitignore` (e bem!), então não vai para o GitHub nem para o Netlify. A chave do Google Maps precisa de ser configurada como **variável de ambiente** no Netlify.

## ✅ Solução

### 1. Adicionar Variável de Ambiente no Netlify

1. **Acede ao Netlify Dashboard**
   - Vai a https://app.netlify.com
   - Seleciona o teu site

2. **Vai a Site Settings**
   - No menu lateral, clica em **Site settings**

3. **Encontra Environment Variables**
   - No menu lateral, clica em **Environment variables**
   - Ou vai diretamente a: **Build & deploy** → **Environment**

4. **Adiciona a Variável**
   - Clica em **Add variable**
   - **Key:** `GOOGLE_API_KEY`
   - **Value:** Cola a tua chave do Google Maps (a mesma que tens no `.env`)
   - **Scopes:** Deixa marcado **All scopes** (ou seleciona apenas **Production** se quiseres)
   - Clica em **Save**

### 2. Verificar o Build

O script `generate-config.js` foi atualizado para:
- ✅ Ler de variáveis de ambiente do Netlify (produção)
- ✅ Ler do ficheiro `.env` (desenvolvimento local)

O `netlify.toml` está configurado para executar `npm run build` que gera o `config.js` com a chave.

### 3. Fazer Deploy

Após adicionar a variável:
1. Vai a **Deploys**
2. Clica em **Trigger deploy** → **Clear cache and deploy site**
3. Aguarda o deploy completar

## 🔍 Como Verificar se Funcionou

1. Após o deploy, abre o site
2. Abre a consola do browser (F12)
3. Verifica se não há erros relacionados com Google Maps
4. O mapa deve carregar normalmente

## 📝 Notas

- ✅ A chave **NÃO** vai para o GitHub (fica segura no Netlify)
- ✅ Funciona tanto em desenvolvimento local (`.env`) como em produção (Netlify)
- ✅ Se mudares a chave, apenas precisas de atualizar no Netlify

## 🛠️ Desenvolvimento Local

Para desenvolvimento local, continua a usar o `.env`:

```bash
# O .env já deve ter:
GOOGLE_API_KEY=sua-chave-aqui

# Gerar config.js localmente:
npm run generate-config
```

## ⚠️ Importante

- **NUNCA** commites o ficheiro `config.js` se tiver a chave real
- O `config.js` está no `.gitignore` por isso não vai para o Git
- Mas se por acaso não estiver, adiciona ao `.gitignore`:
  ```
  config.js
  ```

