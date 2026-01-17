# ⚠️ Nota Importante sobre Backends do CMS

## Modos de Backend

O CMS tem diferentes modos de backend dependendo do ambiente:

### 1. `file-system` (Desenvolvimento Local)
- **Usa:** Para testar localmente e ver os ficheiros existentes
- **Lê:** Diretamente dos ficheiros na pasta `content/`
- **Guarda:** Localmente (não faz commit no Git)
- **Quando usar:** Durante desenvolvimento local

### 2. `test-repo` (Teste sem Git)
- **Usa:** Para testar a interface sem precisar de Git
- **Lê:** Cria um repositório vazio em memória
- **Guarda:** Apenas em memória (perde ao recarregar)
- **Quando usar:** Para testar apenas a interface, sem conteúdo

### 3. `git-gateway` (Produção no Netlify)
- **Usa:** No Netlify em produção
- **Lê:** Do repositório Git através do Git Gateway
- **Guarda:** Faz commit e push automático no Git
- **Quando usar:** Quando o site está no Netlify

## Antes de Fazer Push

**IMPORTANTE:** Antes de fazer push para produção, muda TODOS os ficheiros `config.yml` de volta para `git-gateway`:

- `static/admin/config.yml`
- `config.yml` (raiz)
- `admin/config.yml`

Muda de:
```yaml
backend:
  name: file-system
```

Para:
```yaml
backend:
  name: git-gateway
```

## Como Testar Localmente

1. Usa `file-system` para ver e editar conteúdo local
2. As alterações são guardadas localmente
3. Para testar guardar no Git, usa `netlify dev` com `git-gateway`

