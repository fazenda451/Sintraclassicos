# ✅ CMS Configurado e Pronto para Produção

## 📋 Checklist Antes do Primeiro Deploy

- [x] Ficheiros de configuração criados
- [x] Estrutura de pastas `content/` criada
- [x] Ficheiros JSON com conteúdo inicial
- [x] CMS loader integrado no site
- [x] Configuração do Netlify pronta

## 🚀 Próximos Passos no Netlify

### 1. Ativar Identity Service
1. Vai a **Site settings** → **Identity**
2. Clica em **Enable Identity**
3. Aguarda alguns segundos para ativar

### 2. Ativar Git Gateway
1. Ainda em **Identity**, vai a **Services** → **Git Gateway**
2. Clica em **Enable Git Gateway**
3. Aguarda a ativação

### 3. Configurar Permissões
1. Em **Identity** → **Registration**
2. Escolhe:
   - **Open** - Qualquer pessoa pode registar-se (para testes)
   - **Invite only** - Apenas pessoas convidadas (recomendado para produção)

### 4. Convidar Utilizadores (se necessário)
1. Em **Identity** → **Invite users**
2. Adiciona o email do cliente
3. O cliente recebe um email para criar conta

## 📁 Estrutura de Ficheiros Criada

```
├── admin/
│   ├── index.html          # Interface do CMS
│   └── config.yml          # Config (backup)
├── static/admin/
│   └── config.yml          # Config principal do CMS
├── config.yml              # Config na raiz (para compatibilidade)
├── content/                # Conteúdo editável
│   ├── hero/
│   ├── eventos/
│   ├── agenda/
│   ├── galeria/
│   ├── loja/
│   ├── comunidade/
│   ├── contactos/
│   └── config/
├── cms-loader.js           # Carrega conteúdo dinamicamente
└── netlify.toml            # Configuração do Netlify
```

## 🔧 Como Funciona

1. **Cliente acede a:** `https://seu-site.netlify.app/admin`
2. **Faz login** com a conta criada
3. **Edita conteúdo** através da interface
4. **Guarda** - as alterações são commitadas automaticamente no Git
5. **Netlify faz deploy** automático
6. **Site atualiza** com o novo conteúdo

## 📝 Notas Importantes

- ✅ Todos os `config.yml` estão configurados com `git-gateway` (modo produção)
- ✅ O site carrega conteúdo dinamicamente através do `cms-loader.js`
- ✅ As imagens carregadas via CMS vão para a pasta `img/`
- ✅ Todos os ficheiros JSON são versionados no Git

## 🐛 Troubleshooting

### CMS não carrega
- Verifica se Identity e Git Gateway estão ativados
- Verifica se o ficheiro `static/admin/config.yml` existe

### Conteúdo não aparece no site
- Verifica a consola do browser para erros
- Verifica se os ficheiros JSON estão em `content/`
- Verifica se `cms-loader.js` está a ser carregado

### Erro ao guardar
- Verifica permissões do Git Gateway
- Verifica se a branch está correta (main)

## 📚 Documentação Adicional

- `README-CMS.md` - Guia completo do CMS
- `TESTE-LOCAL.md` - Como testar localmente
- `NOTA-IMPORTANTE.md` - Notas sobre backends

