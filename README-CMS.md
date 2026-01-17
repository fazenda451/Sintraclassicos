# CMS Setup - Sintra Clássicos

Este site está configurado com **Decap CMS** (anteriormente Netlify CMS) para permitir edição de conteúdo sem necessidade de alterar código.

## Como Aceder ao CMS

1. Aceda a `https://seu-site.netlify.app/admin`
2. Faça login com a sua conta GitHub (ou Netlify)
3. Comece a editar conteúdo!

## Estrutura do CMS

O CMS está organizado nas seguintes secções:

### 1. Hero Section
- Subtitle
- Botões (texto e links)

### 2. Próximos Eventos
- Criar, editar e eliminar eventos
- Campos: título, data, localização, imagem, descrição, preço, horários, limite

### 3. Agenda Anual
- Gerir eventos da timeline
- Campos: mês, título, descrição, tipo, localização, ordem

### 4. Galeria
- Adicionar e gerir imagens da galeria
- Campos: título, descrição, imagem, data, ordem

### 5. Loja - Produtos
- Gerir produtos da loja
- Campos: título, descrição, preço, imagem, disponibilidade

### 6. Comunidade
- Editar textos da secção comunidade
- Campos: título principal, descrição, textos para proprietários e entusiastas

### 7. Contactos
- Atualizar informações de contacto
- Campos: título, descrição, email, links sociais, lista de benefícios

### 8. Configurações Gerais
- Configurações do site
- Campos: título do site, descrição, texto do footer

## Configuração no Netlify

Para o CMS funcionar corretamente, é necessário:

1. **Ativar o Git Gateway** no Netlify:
   - Vá a Site settings > Identity
   - Ative o Identity service
   - Vá a Services > Git Gateway
   - Ative o Git Gateway

2. **Configurar permissões**:
   - Vá a Identity > Registration
   - Selecione "Invite only" ou "Open" conforme necessário
   - Convide utilizadores através de Identity > Invite users

## Estrutura de Ficheiros

```
├── admin/
│   ├── index.html          # Interface do CMS
│   └── config.yml          # Configuração do CMS
├── content/                # Dados editáveis
│   ├── hero/
│   ├── eventos/
│   ├── agenda/
│   ├── galeria/
│   ├── loja/
│   ├── comunidade/
│   ├── contactos/
│   └── config/
└── cms-loader.js           # Script que carrega os dados
```

## Como Funciona

1. O cliente edita conteúdo através da interface do CMS (`/admin`)
2. As alterações são guardadas como ficheiros JSON na pasta `content/`
3. O Netlify faz deploy automático das alterações
4. O site carrega os dados dinamicamente através do `cms-loader.js`

## Notas Importantes

- As imagens carregadas através do CMS são guardadas na pasta `img/`
- Todos os ficheiros JSON são versionados no Git
- O CMS funciona apenas em sites hospedados no Netlify (ou com Git Gateway configurado)
- Para desenvolvimento local, pode testar usando `netlify dev`

## Suporte

Para mais informações sobre o Decap CMS, consulte: https://decapcms.org/

