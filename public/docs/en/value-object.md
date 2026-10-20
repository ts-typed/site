# Value Object

A **value object** is a type that represents a domain concept, such as an email address, a document number, or a money amount. It is defined by its value rather than by identity, and it should always be valid.

TS Typed provides `ValueObject`, an abstract base class that lets you write these types with custom validation and custom methods. Combined with the compiler's auto-construction, it removes most of the boilerplate that usually separates a DTO from its domain model.

## The `ValueObject` base class

`ValueObject` is exported from `@ts-typed/compiler`. It extends the boxed `String` object, so a value object behaves like a string in everyday use:

- `console.log` shows the raw value.
- Template literals and string concatenation use the raw value.
- `JSON.stringify` serializes the raw value.

At the same time, it carries your own validation rules and your own methods.

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

A subclass does two things:

1. It implements `protected isValid(raw: string): boolean`. The constructor calls this method after `super(raw)`. If it returns `false`, the constructor throws a `StrictTypeError` with `contractKind: 'construction'`.
2. It adds its own public methods, such as `domain()` above.

Using the class directly looks like this:

```ts
const email = new Email('ana@example.com');

console.log(email);            // "ana@example.com"
console.log(`${email}`);       // "ana@example.com"
console.log(email.domain());   // "example.com"

new Email('not-an-email');     // throws StrictTypeError (contractKind: 'construction')
```

### Inherited string methods

Because a subclass extends `String`, it inherits every `String.prototype` method for free:

```ts
const email = new Email('Ana@Example.com');

email.toLowerCase();   // "ana@example.com"
email.includes('@');   // true
```

### Domain methods

Your own methods sit on top of the inherited ones. A document value object, for example, might add `.masked()` to hide most of its digits and `.numbers()` to return only the digit characters. The class stays a string at heart, and its methods express the domain rules.

## Auto-construction

Creating a value object by hand with `new Email(...)` at every entry point is tedious and easy to forget. The key feature of `ValueObject` is that you do not have to.

When the compiler recognizes that a declared type is a class extending `ValueObject`, it **auto-constructs** a raw value into that type at every typed boundary. Application code receives a validated instance, and you never call the constructor yourself.

```ts
import { Email } from '@ts-typed/validators/global';

export class CreateUserDto {
  public readonly email!: Email; // declared as Email, populated from JSON as a plain string
}

class UserService {
  public create(dto: CreateUserDto) {
    console.log(dto.email);           // "ana@example.com" - auto-constructed from the raw string, already validated
    console.log(dto.email.domain());  // "example.com"
  }
}
```

The client sends JSON such as `{ "email": "ana@example.com" }`. When that value is assigned to the `email` field of `CreateUserDto`, the compiler constructs an `Email` from the raw string. The result is a validated instance, so `dto.email.domain()` is available immediately.

If the client sends `{ "email": "not-an-email" }`, the construction fails and a `StrictTypeError` is thrown before `create()` runs.

The same conversion applies inside typed objects, arrays, and tuples. For example, a parameter declared as `{ primary: Email; recipients: Email[] }` receives an `Email` instance for `primary` and for every `recipients` item when the request supplies raw strings.

This replaces several pieces you would normally write:

- No `class-validator` decorators on the DTO.
- No manual `new Email(...)` calls in controllers, services, or mappers.
- No separate DTO class alongside a separate domain class that copies the same fields.

### Validation happens once, at the boundary

Once the value is constructed, it is already valid. Code downstream of the boundary can rely on that without re-checking it:

```ts
class BillingService {
  public sendReceipt(email: Email) {
    // email is already valid here: no re-validation needed.
    return this.mailer.send(email.domain(), email.toString());
  }
}
```

### Detection rules

The compiler detects a `ValueObject` subclass by walking its full base-class chain. A class that extends an intermediate subclass of `ValueObject` is still recognized. The compiler also verifies that the matched ancestor is genuinely the `ValueObject` exported by `@ts-typed/compiler`, by checking its declaration file path. A coincidentally named class from another library does not count.

## Writing your own value objects

Any domain concept with a string representation can follow the same pattern. Here is a value object for a Brazilian CPF number that strips formatting and exposes a masked form:

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

Used in a DTO, the raw input is constructed automatically:

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

A real CPF validator would also check the two verification digits. The example keeps the rule short to show the structure. Put the full rule inside `isValid`, and the rest of your code stays the same.

Because `CPF` inherits the `String` methods, you can also write `dto.document.length` or `dto.document.startsWith('123')` without any extra code.

## Limitations

Auto-construction works for the common cases. A few situations are not detected:

- A `ValueObject` subclass reached only through type inference is not detected. Declare the type explicitly on the boundary.
- A `ValueObject` subclass reached through a namespace import is not detected. Import the class by name instead.
- A `ValueObject` subclass is not detected when the file resolving the type does not import it by name.
- A union that includes a `ValueObject` type does not auto-construct. For example, `CPF | undefined` is not converted. Only a direct, non-union reference is constructed.
- A class reached through a symlinked or workspace `node_modules` install is not detected.
