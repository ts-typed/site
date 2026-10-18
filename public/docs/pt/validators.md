# Validadores

O pacote **`@ts-typed/validators`** oferece validadores de documentos e dados construídos sobre o `ValueObject` do [`@ts-typed/compiler`](./core-concepts.md). Você declara um tipo, e o compilador o constrói e valida automaticamente em cada fronteira tipada. Não é preciso usar decorator nem chamar `new` manualmente.

## Instalação

```bash
npm install @ts-typed/validators
```

## Uso

```ts
import { CPF } from '@ts-typed/validators/br';
import { Email } from '@ts-typed/validators/global';

export class CreateUserDto {
  public readonly cpf!: CPF;     // específico do Brasil
  public readonly email!: Email; // global
}

class UserService {
  public create(dto: CreateUserDto) {
    console.log(dto.cpf);            // "12345678909"
    console.log(dto.cpf.masked());   // "123.456.789-09"
    console.log(dto.email.domain()); // "example.com"
  }
}
```

Com a etapa de build do `@ts-typed/compiler` ativa, a string bruta enviada pelo cliente é convertida em uma instância validada assim que é atribuída. O código da aplicação nunca chama `new` diretamente. Se o valor for inválido, um erro é lançado antes de `create()` ser executado.

Cada classe se comporta como uma string nos pontos em que isso importa, como `console.log`, template literals, `JSON.stringify` e todos os métodos nativos de `String.prototype`. Além disso, cada classe adiciona seus próprios métodos de validação e formatação.

## Estrutura do pacote

O pacote tem dois entry points, além de uma raiz que reexporta ambos:

- **`@ts-typed/validators/br`**: validadores de documentos específicos do Brasil.
- **`@ts-typed/validators/global`**: validadores pensados para uso universal e internacional.
- **`@ts-typed/validators`** (a raiz do pacote): reexporta tudo o que está nos dois entry points.

Importe do entry point que corresponde ao seu caso de uso. Importar de `/br` mantém o código específico do Brasil fora de uma aplicação que não precisa dele.

## Validadores específicos do Brasil

Importe estes validadores de `@ts-typed/validators/br`.

| Classe | Documento | Dígito verificador | Aceita |
|---|---|---|---|
| `CPF` | Cadastro de Pessoa Física | Módulo 11 | `"123.456.789-09"` ou `"12345678909"` |
| `CNPJ` | Cadastro Nacional da Pessoa Jurídica | Módulo 11 | Formato numérico legado (`"11.222.333/0001-81"`) e o formato alfanumérico em vigor a partir de julho de 2026 (`"12.ABC.345/01DE-35"`) |
| `PIS` (aliases `Pasep`, `Nis`, `Nit`) | PIS/PASEP/NIS/NIT: o mesmo número de 11 dígitos e o mesmo dígito verificador, sob quatro nomes de programas governamentais | Módulo 11 | `"120.65328.70-5"` ou `"12065328705"` |
| `CEP` | Código de endereçamento postal | Apenas formato. Não existe dígito verificador. | `"01310-100"` ou `"01310100"` |
| `Placa` | Placa de veículo | Apenas formato. Não existe dígito verificador. | Padrão antigo (`"ABC1234"`) ou Mercosul (`"ABC1D23"`) |
| `CNH` | Número da Carteira Nacional de Habilitação | Módulo 11 | `"03215478120"` |

Todas as classes de documento expõem `.numbers()`, que retorna o valor normalizado, sem formatação. Quando existe um formato natural de exibição, a classe também expõe `.masked()`. A `CNH` não tem um formato padrão de exibição, por isso expõe apenas `.numbers()`.

> **Atenção:** `CEP` e `Placa` validam **apenas o formato**. Nenhum dos dois documentos tem dígito verificador padronizado em nível nacional, então essas classes confirmam a forma do valor (tamanho e padrão), mas não conseguem confirmar que um número específico foi realmente emitido.

### Por que não existe `RG`

O RG (Registro Geral) não tem dígito verificador padronizado em nível nacional. O formato e a existência de um dígito verificador variam conforme o estado emissor, e muitos estados não têm nenhum. Incluir uma classe `RG` significaria fingir que se valida algo que não pode ser validado em todo o país. Por isso ela foi deliberadamente deixada de fora.

## Validadores globais

Importe estes validadores de `@ts-typed/validators/global`.

| Classe | O que valida | Observações |
|---|---|---|
| `FullName` | Um nome completo plausível (primeiro nome e sobrenome, em qualquer idioma ou escrita) | Sem dígito verificador. Valida apenas a plausibilidade. Antes restrito ao Brasil, agora independente de localidade. |
| `Email` | Um endereço de e-mail no formato `parte-local@dominio.tld` | Verificação de formato pragmática, não a RFC 5322 completa. A parte local aceita letras, dígitos e `._%+-`. O domínio aceita letras, dígitos, hífens e pontos, e deve terminar em um TLD de pelo menos duas letras. Métodos: `.localPart()`, `.domain()`. |
| `CreditCard` | Um número de cartão de pagamento | Validado pelo checksum de Luhn, que não depende da bandeira e funciona com Visa, Mastercard e outras bandeiras no mundo todo. Espaços ou hífens são aceitos como separadores. Após a limpeza, o valor deve ter de 12 a 19 dígitos e passar no Luhn. Métodos: `.numbers()`, `.masked()`. O `.masked()` mostra apenas os últimos quatro dígitos, agrupados de quatro em quatro: `"4532015112830366"` vira `"**** **** **** 0366"`. |

Exemplo:

```ts
import { Email, CreditCard, FullName } from '@ts-typed/validators/global';

new Email('ana@example.com').domain();             // "example.com"
new CreditCard('4532 0151 1283 0366').masked();    // "**** **** **** 0366"
new FullName('Ana Maria Silva Santos').firstName(); // "Ana"
```

## Mascaramento para privacidade com `.redact()`

Todas as classes, tanto em `/br` quanto em `/global`, expõem `.redact()`. Use-o para exibir um valor em um contexto onde o valor completo não deve aparecer, como logs, listagens públicas ou ferramentas de suporte:

```ts
new CPF('123.456.789-09').redact();             // "***.456.789-**"
new CEP('12345-678').redact();                  // "*****-678" (os cinco primeiros dígitos são ocultados, antes do hífen)
new FullName('João dos Santos Silva').redact(); // "J*** d** S***** S*****" (cada palavra mantém a primeira letra, o restante é mascarado)
new Email('ana@example.com').redact();          // "a**@example.com" (o primeiro caractere da parte local é mantido, o domínio aparece por completo)
new CreditCard('4532015112830366').redact();    // "**** **** **** 0366" (igual ao .masked())
```

O Brasil não tem um padrão federal único para a ocultação de documentos. Há uma proposta legislativa em discussão para criar um, justamente porque máscaras diferentes usadas por instituições diferentes facilitam a reconstrução de um número ao cruzar essas informações. O formato de ocultação do CPF segue uma convenção documentada, usada por um portal estadual de transparência. As demais classes seguem o mesmo princípio por consistência, sem uma fonte independente para cada tipo de documento.

O CNPJ identifica uma pessoa jurídica, e não uma pessoa natural, então as regras de dados pessoais da LGPD não se aplicam a ele da mesma forma que se aplicam aos outros documentos. O método `.redact()` existe por consistência da API. Ocultar um CNPJ não é, em geral, uma exigência comum.
