# Express: primeiros passos

No Express, `@ts-typed/core` instrumenta contratos e `@ts-typed/express` converte uma violação em resposta HTTP segura. Instale ambos no projeto da API:

```bash
npm install --save-dev @ts-typed/core @ts-typed/express
npx ts-typed init
```

O `init` detecta `express` nas dependências, instala `@ts-typed/express`, cria `typets.config.json` com `integration: "@ts-typed/express"`, preserva scripts já existentes e pergunta se deve instalar `@ts-typed/validators`. Em terminal interativo, também oferece registrar o handler global.

Quando aceito, ele modifica somente um bootstrap convencional com exatamente uma chamada de nível superior `app.listen(...)`, em uma app criada diretamente por `express()`. Ele importa `typedErrorHandler` e insere `app.use(typedErrorHandler())` antes do `listen`. Se não encontrar exatamente esse formato — mais de um `listen`, bootstrap encapsulado, arquivo inexistente — deixa o fonte intacto e informa como configurar manualmente.

```ts
import express from 'express';
import { typedErrorHandler } from '@ts-typed/express';

const app = express();
app.use(express.json());
app.use(routes);
app.use(typedErrorHandler()); // depois das rotas, antes do fallback
app.listen(3000);
```

Compile e execute a saída protegida:

```bash
npm run build
npm run dev
```

`typedErrorHandler` não substitui parsing de body, rotas ou autenticação. Ele só adapta `StrictTypeError` que já foi lançado por um contrato instrumentado. Continue em [Configuração](./configuration.md).
