# NestJS: primeiros passos

No NestJS, o compilador cria os contratos e `@ts-typed/nestjs` transforma suas violações em respostas HTTP. A partir da raiz da aplicação Nest:

```bash
npm install --save-dev @ts-typed/core @ts-typed/nestjs
npx ts-typed init
```

O `init` reconhece Nest por `nest-cli.json` ou `@nestjs/core`, instala o adaptador, cria `typets.config.json` com integração Nest e oferece instalar `@ts-typed/validators`. Em terminal interativo, ele também oferece registrar `StrictTypeErrorFilter` globalmente.

Em um bootstrap convencional com `const app = await NestFactory.create(...)`, a automação inclui:

```ts
import { StrictTypeErrorFilter } from '@ts-typed/nestjs';

const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new StrictTypeErrorFilter());
```

Se não localizar um bootstrap inequívoco em `sourceRoot/main.ts` (ou se já houver o filtro), não altera o arquivo e informa o motivo. Você pode aplicar o filtro manualmente, globalmente como acima ou no controlador/método com `@UseFilters(StrictTypeErrorFilter)`.

Use os comandos preservados/adicionados pelo projeto: `npm run build`, `npm run start:dev` e `npm run start:prod`. O caminho Nest exige o builder `tsc`: SWC, Rspack e webpack não executam transformers TypeScript e são rejeitados para impedir uma saída sem proteção. Defina `"compilerOptions": { "builder": "tsc" }` em `nest-cli.json` quando necessário.
