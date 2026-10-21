# NestJS: practices and examples

```ts
@Controller('users')
export class UsersController {
  @Get(':id')
  async get(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.service.find(id);
    if (!user) throw new NotFoundException();
    return { id: user.id, name: user.name };
  }
}
```

Use DTOs at controller boundaries, public projections in providers, pagination for collections, and one global filter. Test valid requests, malformed requests, and the exact safe HTTP error shape.
