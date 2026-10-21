# Express: implementation

Install the adapter when you want standard error serialization:

```bash
npm install @ts-typed/express
```

```ts
import express from 'express';
import { typedErrorHandler } from '@ts-typed/express';

const app = express();
app.use(express.json());
app.post('/users', (request, response) => {
  const body: CreateUserRequest = request.body;
  const result: UserResponse = createUser(body);
  response.status(201).json(result);
});
app.use(typedErrorHandler());
```

Register the middleware after routes. Build with TS Typed and run the emitted server.
