# Value Object

Um **value object** é um tipo que representa um conceito de domínio, como um endereço de e-mail, um número de documento ou um valor monetário. Ele é definido pelo seu valor e não pela sua identidade, e deve estar sempre válido.

O TS Typed oferece `ValueObject`, uma classe base abstrata que permite escrever esses tipos com validação e métodos próprios. Combinada com a auto-construção do compilador, ela elimina a maior parte do código repetitivo que normalmente separa um DTO do seu modelo de domínio.

## A classe base `ValueObject`

`ValueObject` é exportada por `@ts-typed/compiler`. Ela estende o objeto `String` empacotado, então um value object se comporta como uma string no uso do dia a dia:

- `console.log` mostra o valor bruto.
- Template literals e concatenação de strings usam o valor bruto.
- `JSON.stringify` serializa o valor bruto.

Ao mesmo tempo, ele carrega as suas regras de validação e os seus próprios métodos.

```ts
import { ValueObject } from '@ts-typed/compiler';

export class Email extends ValueObject {
  public constructor(raw: string) {
    super(raw);
  }

  protected isValid(raw: string): boolean {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(raw);
  }

  public domain(): string {
    return this.toString().slice(this.toString().indexOf('@') + 1);
  }
}
```

Uma subclasse faz duas coisas:

1. Implementa `protected isValid(raw: string): boolean`. O construtor chama esse método depois de `super(raw)`. Se ele retornar `false`, o construtor lança um `StrictTypeError` com `contractKind: 'construction'`.
2. Adiciona os seus próprios métodos públicos, como o `domain()` acima.

Usar a classe diretamente fica assim:

```ts
const email = new Email('ana@example.com');

console.log(email);            // "ana@example.com"
console.log(`${email}`);       // "ana@example.com"
console.log(email.domain());   // "example.com"

new Email('nao-e-um-email');   // lança StrictTypeError (contractKind: 'construction')
```

### Métodos de string herdados

Como a subclasse estende `String`, ela herda automaticamente todos os métodos de `String.prototype`:

```ts
const email = new Email('Ana@Example.com');

email.toLowerCase();   // "ana@example.com"
email.includes('@');   // true
```

### Métodos de domínio

Os seus métodos se somam aos herdados. Um value object de documento, por exemplo, pode adicionar `.masked()` para ocultar a maior parte dos dígitos e `.numbers()` para retornar apenas os caracteres numéricos. A classe continua sendo uma string no fundo, e os seus métodos expressam as regras do domínio.

## Auto-construção

Criar um value object à mão, com `new Email(...)` em cada ponto de entrada, é trabalhoso e fácil de esquecer. O recurso mais importante do `ValueObject` é que você não precisa fazer isso.

Quando o compilador reconhece que um tipo declarado é uma classe que estende `ValueObject`, ele **auto-constrói** um valor bruto nesse tipo em cada typed boundary. O código da aplicação recebe uma instância validada, e você nunca chama o construtor manualmente.

```ts
import { Email } from '@ts-typed/validators/global';

export class CreateUserDto {
  public readonly email!: Email; // declarado como Email, preenchido a partir do JSON como string simples
}

class UserService {
  public create(dto: CreateUserDto) {
    console.log(dto.email);           // "ana@example.com" - auto-construído a partir da string bruta, já validado
    console.log(dto.email.domain());  // "example.com"
  }
}
```

O cliente envia um JSON como `{ "email": "ana@example.com" }`. Quando esse valor é atribuído ao campo `email` de `CreateUserDto`, o compilador constrói um `Email` a partir da string bruta. O resultado é uma instância validada, então `dto.email.domain()` já está disponível.

Se o cliente enviar `{ "email": "nao-e-um-email" }`, a construção falha e um `StrictTypeError` é lançado antes de `create()` executar.

A mesma conversão vale dentro de objetos, arrays e tuplas tipados. Por exemplo, um parâmetro declarado como `{ primary: Email; recipients: Email[] }` recebe uma instância de `Email` em `primary` e em cada item de `recipients` quando a requisição fornece strings brutas.

Isso substitui várias peças que você normalmente escreveria:

- Nenhum decorator do `class-validator` no DTO.
- Nenhuma chamada manual a `new Email(...)` em controllers, services ou mappers.
- Nenhuma classe de DTO separada ao lado de uma classe de domínio separada que copia os mesmos campos.

### A validação acontece uma vez, no boundary

Depois de construído, o valor já é válido. O código posterior ao boundary pode confiar nisso sem validar de novo:

```ts
class BillingService {
  public sendReceipt(email: Email) {
    // email já é válido aqui: não é preciso validar novamente.
    return this.mailer.send(email.domain(), email.toString());
  }
}
```

### Regras de detecção

O compilador detecta uma subclasse de `ValueObject` percorrendo toda a cadeia de classes base. Uma classe que estende uma subclasse intermediária de `ValueObject` continua sendo reconhecida. O compilador também verifica se o ancestral encontrado é de fato o `ValueObject` exportado por `@ts-typed/compiler`, comparando o caminho do arquivo de declaração. Uma classe de mesmo nome vinda de outra biblioteca não conta.

## Criando os seus próprios value objects

Qualquer conceito de domínio com representação em string pode seguir o mesmo padrão. Veja um value object para um número de CPF brasileiro que remove a formatação e expõe uma forma mascarada:

```ts
import { ValueObject } from '@ts-typed/compiler';

export class CPF extends ValueObject {
  public constructor(raw: string) {
    super(raw);
  }

  protected isValid(raw: string): boolean {
    const digits = raw.replace(/\D/g, '');
    return digits.length === 11 && !/^(\d)\1{10}$/.test(digits);
  }

  public numbers(): string {
    return this.toString().replace(/\D/g, '');
  }

  public masked(): string {
    const digits = this.numbers();
    return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  }
}
```

Usado em um DTO, o valor bruto é construído automaticamente:

```ts
export class RegisterPayerDto {
  public name!: string;
  public document!: CPF;
}

class PayerService {
  public register(dto: RegisterPayerDto) {
    console.log(dto.document.masked()); // "***.456.789-**"
    return { name: dto.name, document: dto.document.numbers() };
  }
}
```

Uma validação real de CPF também conferiria os dois dígitos verificadores. O exemplo mantém a regra curta para mostrar a estrutura. Coloque a regra completa dentro de `isValid`, e o restante do código continua igual.

Como `CPF` herda os métodos de `String`, você também pode escrever `dto.document.length` ou `dto.document.startsWith('123')` sem nenhum código extra.

## Limitações

A auto-construção funciona nos casos comuns. Algumas situações não são detectadas:

- Uma subclasse de `ValueObject` alcançada apenas por inferência de tipos não é detectada. Declare o tipo explicitamente no boundary.
- Uma subclasse de `ValueObject` alcançada por um namespace import não é detectada. Importe a classe pelo nome.
- Uma subclasse de `ValueObject` não é detectada quando o arquivo que resolve o tipo não a importa pelo nome.
- Uma união que inclui um tipo `ValueObject` não é auto-construída. Por exemplo, `CPF | undefined` não é convertido. Apenas uma referência direta, sem união, é construída.
- Uma classe alcançada por uma instalação em `node_modules` via link simbólico ou workspace não é detectada.
