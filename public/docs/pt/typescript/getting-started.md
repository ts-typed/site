# TypeScript: primeiros passos

Use este guia em bibliotecas, CLIs, workers e aplicações Node que compilam TypeScript sem um adaptador de framework. O `ts-typed` não substitui o TypeScript: ele lê o mesmo projeto, insere verificações nos limites tipados e emite o JavaScript que deve ser executado.

## 1. Instale o compilador

```bash
npm install --save-dev @ts-typed/core
```

Instale no pacote que contém o `tsconfig.json`. Em monorepos, execute o comando no workspace da aplicação, não na raiz que só coordena os workspaces.

## 2. Inicialize o projeto

```bash
npx ts-typed init
```

Sem NestJS ou Express detectados, o comando trata o projeto como TypeScript puro. Ele cria `typets.config.json` somente se o arquivo ainda não existir e prefere `tsconfig.build.json` a `tsconfig.json` quando ambos existem. Também acrescenta, sem sobrescrever scripts existentes, estes scripts:

```json
{
  "scripts": {
    "build": "ts-typed build",
    "start": "ts-typed start",
    "dev": "ts-typed start --watch",
    "start:prod": "node dist/index.js"
  }
}
```

No terminal interativo, o `init` pergunta se deve instalar `@ts-typed/validators`. Escolha **sim** quando CPF, e-mail e outros valores de domínio fizerem parte do projeto; a escolha instala o pacote, mas não altera suas classes. O comando é seguro para repetir: ele não recria a configuração nem troca um script personalizado.

## 3. Revise a configuração criada

```json
{
  "$schema": "./node_modules/@ts-typed/core/schema.json",
  "integration": "typescript",
  "entry": "src/main.ts",
  "tsconfig": "tsconfig.json",
  "outDir": "dist"
}
```

Altere `entry` para o bootstrap real. A [configuração](./configuration.md) cobre cada opção, incluindo bundling, diagnósticos e rigor de classes.

## 4. Crie uma primeira fronteira

```ts
export interface CreateUserInput {
  name: string;
  age: number;
}

export interface UserSummary {
  id: string;
  name: string;
}

export function createUser(input: CreateUserInput): UserSummary {
  return { id: crypto.randomUUID(), name: input.name };
}
```

Após o build, `createUser({ name: 'Ada', age: '36' } as unknown as CreateUserInput)` lança `StrictTypeError`. O cast só silencia o TypeScript; o contrato é verificado no JavaScript instrumentado.

## 5. Compile e execute a saída protegida

```bash
npm run build
npm run start:prod
```

Durante o desenvolvimento, `npm run dev` reconstrói e reinicia somente após um build bem-sucedido. Não execute o `.ts` original com `ts-node` ou `tsx` para testar as proteções: elas existem na saída de `ts-typed build`.

### Próximos passos

- Leia [Configuração](./configuration.md) antes de alterar bundling, mapas de fonte ou rigor de classes.
- Leia [Implementação](./implementation.md) para escolher fronteiras úteis.
- Leia [Conceitos centrais](../core-concepts.md) para entender o que é verificado e como os erros são reportados.
