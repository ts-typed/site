# Introdução

O TS Typed transforma os tipos que você já escreve em TypeScript em garantias de execução. As suas declarações deixam de ser apenas anotações que o compilador apaga e passam a ser verificações que rodam enquanto o programa executa.

## O que é o TS Typed?

O TS Typed é um conjunto de pacotes que trabalham juntos:

- **@ts-typed/compiler** instrumenta o seu projeto TypeScript para que os valores em tempo de execução sejam verificados contra os tipos que o compilador já conhece.
- **@ts-typed/nestjs** integra essas verificações em aplicações NestJS.
- **@ts-typed/validators** oferece value objects prontos para uso, como `Email`, que você pode usar diretamente nos seus tipos.

Você escreve TypeScript normal. Não há definições de schema para manter e nenhum decorator é necessário para o básico. Uma etapa de transformação insere as verificações em tempo de execução para você, construídas a partir do tipo exato declarado em cada ponto do código.

## A ideia central

Na maioria dos projetos, o mesmo contrato é escrito duas vezes: uma como tipo TypeScript para o compilador e outra como schema de validação em tempo de execução. Com o tempo, as duas versões se desalinham.

O TS Typed elimina a segunda cópia. **O tipo que você escreveu é o contrato.** Se um valor atravessa um ponto onde esse tipo é declarado e não corresponde a ele, o programa lança um erro em vez de deixar que um valor malformado se propague silenciosamente pelo resto do código.

## Por que não usar uma biblioteca de schema?

Considere um DTO típico validado por uma biblioteca baseada em decorators:

```ts
// Duplicado: o tipo e as regras de validação descrevem a mesma forma.
class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  age!: number;
}
```

Com o TS Typed, a declaração é a história completa:

```ts
export class CreateUserDto {
  public name!: string;
  public age!: number;
}
```

O compilador lê esses tipos e insere as verificações correspondentes. Ao adicionar um campo, você altera um único lugar. Ao renomear um campo, o verificador de tipos e a checagem em tempo de execução continuam de acordo, porque ambos vêm da mesma declaração.

## Próximos passos

- Comece por [Primeiros Passos](./getting-started.md) para instalar o compilador e executar o primeiro build.
- Leia [Conceitos Centrais](./core-concepts.md) para entender os typed boundaries, o que é verificado e como os erros são reportados.
- Leia [Value Object](./value-object.md) para ver como os tipos `ValueObject` são construídos automaticamente a partir de entradas brutas.
