import { defineConfig } from 'orval';

export default defineConfig({
  airangHome: {
    input: { target: './src/shared/api/openapi/airang-home.yaml' },
    output: {
      mode: 'tags-split', // tag "Home" → generated/home/
      target: './src/shared/api/generated',
      schemas: './src/shared/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: {
          path: './src/shared/api/mutator.ts',
          name: 'customInstance',
        },
        query: { useQuery: true },
      },
    },
  },
});
