# TypeScript: requisições e DTOs

JSON, argumentos de CLI, mensagens de fila e configuração externa devem cruzar uma fronteira tipada antes de chegar ao domínio. Use interface quando só precisa de forma e classe quando precisa de defaults, decorators ou agregação.

```ts
interface ChangeEmailInput { userId: string; email: string }

export async function changeEmail(input: ChangeEmailInput): Promise<void> {
  await users.changeEmail(input.userId, input.email);
}
```

No código emitido, os dois campos precisam ser strings e uma chave como `isAdmin` é rejeitada. Objetos fechados previnem incompatibilidades e mass assignment. Para um mapa realmente aberto, declare `Record<string, string>`; para uma exceção localizada, use `@AllowExtraProperties()`.

## Formulários: `AggregateErrors`

O padrão é fail-fast. Para devolver todos os problemas estruturais de um formulário, importe o decorator pelo nome e use uma classe DTO:

```ts
import { AggregateErrors, AggregateStrictTypeError } from '@ts-typed/core';

@AggregateErrors()
class CreateAccountDto {
  public name: string = '';
  public age: number = 0;
  public marketingAccepted: boolean = false;
}

function createAccount(dto: CreateAccountDto): void {}

try {
  createAccount({ name: 42, age: 'old', marketingAccepted: 'yes' } as unknown as CreateAccountDto);
} catch (error) {
  if (error instanceof AggregateStrictTypeError) {
    console.log(error.errors.map((item) => item.toJSON()));
  }
}
```

O erro agregado também é `StrictTypeError`; handlers genéricos seguem funcionando. Ele percorre objetos e arrays aninhados quando há uma única forma estruturada inequívoca. Um parâmetro diretamente `Dto[]` continua fail-fast no primeiro item inválido; envolva a coleção em um DTO se precisar de relatório por campo.

Reserve o decorator para DTO recém-criado e imediatamente passado a uma fronteira. Uma instância agregada que só é mutada e nunca atravessa outro parâmetro tipado mantém uma janela de coleta aberta, portanto não deve ser objeto de domínio de longa vida.

## Valores de domínio

```ts
import { Email } from '@ts-typed/validators/global';

interface InviteInput { email: Email }
function invite(input: InviteInput): void { sendInvite(input.email); }
```

`Email` diferencia "uma string" de um e-mail aceito e materializa o value object na fronteira. Um value object inválido falha imediatamente, em vez de se juntar ao agregado. Leia [Validadores](../validators.md) e [ValueObject](../value-object.md).
