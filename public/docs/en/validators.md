# Validators

The **`@ts-typed/validators`** package provides document and data validators built on the `ValueObject` from [`@ts-typed/core`](./core-concepts.md). You declare a type, and the compiler automatically constructs and validates it at every typed boundary. You don't need a decorator or a manual `new`.

## Installation

```bash
npm install @ts-typed/validators
```

## Usage

```ts
import { CPF } from '@ts-typed/validators/br';
import { Email } from '@ts-typed/validators/global';

export class CreateUserDto {
  public readonly cpf!: CPF;     // Brazil-specific
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

With the `@ts-typed/core` build step enabled, the raw string sent by the client is converted into a validated instance as soon as it is assigned. Application code never calls `new` directly. If the value is invalid, an error is thrown before `create()` runs.

Each class behaves like a string in the places where that matters, such as `console.log`, template literals, `JSON.stringify`, and every native `String.prototype` method. Each class also adds its own validation and formatting methods.

## Package structure

The package has two entry points, plus a root that re-exports both:

- **`@ts-typed/validators/br`**: Brazil-specific document validators.
- **`@ts-typed/validators/global`**: validators intended for universal and international use.
- **`@ts-typed/validators`** (the bare package root): re-exports everything from both entry points.

Import from the entry point that matches your use case. Importing from `/br` keeps Brazil-specific code out of an application that doesn't need it.

## Brazil-specific validators

Import these from `@ts-typed/validators/br`.

| Class | Document | Check digit | Accepts |
|---|---|---|---|
| `CPF` | Cadastro de Pessoa Física | Modulus 11 | `"123.456.789-09"` or `"12345678909"` |
| `CNPJ` | Cadastro Nacional da Pessoa Jurídica | Modulus 11 | Legacy numeric (`"11.222.333/0001-81"`) and the alphanumeric format in effect from July 2026 (`"12.ABC.345/01DE-35"`) |
| `PIS` (aliases `Pasep`, `Nis`, `Nit`) | PIS/PASEP/NIS/NIT: the same 11-digit number and check digit, under four government program names | Modulus 11 | `"120.65328.70-5"` or `"12065328705"` |
| `CEP` | Postal code | Format only. No check digit exists. | `"01310-100"` or `"01310100"` |
| `Placa` | Vehicle plate | Format only. No check digit exists. | Legacy (`"ABC1234"`) or Mercosul (`"ABC1D23"`) |
| `CNH` | Driver's license number | Modulus 11 | `"03215478120"` |

Every document class exposes `.numbers()`, which returns the normalized, unformatted value. Where a natural display format exists, the class also exposes `.masked()`. `CNH` has no standard formatted display form, so it only exposes `.numbers()`.

> **Note:** `CEP` and `Placa` validate **format only**. Neither document has a nationally standardized check digit, so these classes confirm the shape (length and pattern) of the value. They cannot confirm that a specific number was actually issued.

### Why there is no `RG`

An RG (Registro Geral) has no nationally standardized check digit. Its format, and whether it has a check digit at all, varies by issuing state, and many states have none. Shipping an `RG` class would mean claiming to validate something that cannot be validated nationwide, so it is deliberately not included.

## Global validators

Import these from `@ts-typed/validators/global`.

| Class | What it validates | Notes |
|---|---|---|
| `FullName` | A plausible full name (first name and surname, in any locale or script) | No check digit. Validates plausibility only. Previously Brazil-only, now locale-agnostic. |
| `Email` | An email address in the form `local-part@domain.tld` | A pragmatic format check, not full RFC 5322. The local part allows letters, digits, and `._%+-`. The domain allows letters, digits, hyphens, and dots, and must end in a TLD of two or more letters. Methods: `.localPart()`, `.domain()`. |
| `CreditCard` | A payment card number | Validated with the Luhn checksum, which is network-agnostic and works across Visa, Mastercard, and other networks worldwide. Spaces or hyphens are accepted as separators. After cleaning, the value must have 12 to 19 digits and pass the Luhn check. Methods: `.numbers()`, `.masked()`. `.masked()` shows only the last four digits, grouped in fours: `"4532015112830366"` becomes `"**** **** **** 0366"`. |

Example:

```ts
import { Email, CreditCard, FullName } from '@ts-typed/validators/global';

new Email('ana@example.com').domain();             // "example.com"
new CreditCard('4532 0151 1283 0366').masked();    // "**** **** **** 0366"
new FullName('Ana Maria Silva Santos').firstName(); // "Ana"
```

## Privacy masking with `.redact()`

Every class in both `/br` and `/global` exposes `.redact()`. Use it to display a value in a context where the full value should not appear, such as logs, public listings, or support tooling:

```ts
new CPF('123.456.789-09').redact();          // "***.456.789-**"
new CEP('12345-678').redact();               // "*****-678" (the first five digits are hidden, before the hyphen)
new FullName('João dos Santos Silva').redact(); // "J*** d** S***** S*****" (each word keeps its first letter, the rest is masked)
new Email('ana@example.com').redact();       // "a**@example.com" (the first character of the local part is kept, the domain is shown in full)
new CreditCard('4532015112830366').redact(); // "**** **** **** 0366" (same as .masked())
```

Brazil has no single federal standard for redacting documents. A legislative proposal to create one is under discussion, largely because different institutions using different masks make a number easier to reconstruct by cross-referencing them. The CPF redaction format matches a documented convention used by a state transparency portal. The other classes follow the same principle for consistency. They were not sourced independently for each document type.

CNPJ identifies a legal entity, not a natural person, so Brazil's LGPD personal-data rules do not apply to it the way they apply to the other documents. Its `.redact()` method exists for API consistency. Redacting a CNPJ is not commonly required.
