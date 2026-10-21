# Primeiros Passos

Esta página mostra como instalar o TS Typed, gerar a configuração e executar o primeiro build. O processo inteiro leva poucos minutos.

## Pré-requisitos

O TS Typed funciona sobre um projeto TypeScript comum. Você precisa de Node.js e de um projeto que já compile com `tsc`.

## Passo 1: instalar o compilador

Adicione `@ts-typed/core` como dependência de desenvolvimento:

```bash
npm install --save-dev @ts-typed/core
```

O compilador é uma ferramenta de build. Por causa dele, as dependências de execução da sua aplicação não mudam.

## Passo 2: inicializar a configuração

Execute o comando `init` na raiz do projeto:

```bash
npx ts-typed init
```

Isso cria o arquivo `typets.config.json` no projeto atual. Ele guarda as configurações usadas pelo compilador, como o diretório de saída e as flags descritas nas demais páginas da documentação.

## Passo 3: executar o build

Execute a transformação:

```bash
npx ts-typed build
```

O build percorre o seu projeto TypeScript com o verificador de tipos real, insere verificações em tempo de execução em cada typed boundary e emite o projeto instrumentado para `outDir`. A opção `outDir` do `typets.config.json` define para onde essa saída vai. Execute a aplicação a partir da saída gerada, e não dos arquivos-fonte originais, para que as verificações estejam ativas.

## Um exemplo mínimo

Escreva uma classe TypeScript comum. Nada mais é necessário:

```ts
// src/users/create-user.dto.ts
export class CreateUserDto {
  public name!: string;
  public age!: number;
  public isActive!: boolean;
}
```

Depois, use-a em uma função:

```ts
// src/users/users.service.ts
import { CreateUserDto } from './create-user.dto';

export function createUser(dto: CreateUserDto) {
  return { id: crypto.randomUUID(), ...dto };
}
```

### O que você escreve

Você escreve tipos. Esse é o contrato inteiro, e não há schema para manter sincronizado com ele.

### O que é verificado

Depois do `ts-typed build`, o parâmetro `dto` é um typed boundary. O compilador insere nesse ponto uma verificação construída a partir de `CreateUserDto`, então as chamadas se comportam assim:

```ts
createUser({ name: 'Ana', age: 30, isActive: true }); // passa

createUser({ name: 'Ana', age: '30', isActive: true });
// lança StrictTypeError: TYPE_MISMATCH em CreateUserDto.age
```

A verificação também rejeita propriedades extras. Um objeto com um campo que `CreateUserDto` não declara falha com `EXTRA_PROPERTY`. A página de Conceitos Centrais explica cada código de erro em detalhes.

## Próximos passos

- Leia [Conceitos Centrais](./core-concepts.md) para entender o que é um typed boundary e o que é verificado.
- Leia [Value Object](./value-object.md) para criar tipos de domínio validados que são construídos automaticamente.
