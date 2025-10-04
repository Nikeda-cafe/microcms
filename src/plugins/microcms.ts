import { createClient } from 'microcms-js-sdk';

type MicroCMSClient = ReturnType<typeof createClient> | null;

const createLoggingFetch = () => {
  if (!process.dev || !process.server) {
    return fetch;
  }

  const prefix = '[microcms] request';

  const loggingFetch: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method ?? 'GET';
    console.log(prefix, method, url);
    return fetch(input, init);
  };

  return loggingFetch;
};

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();
  let client: MicroCMSClient = null;
  const customFetch = createLoggingFetch();

  if (!config.microcmsServiceDomain || !config.microcmsApiKey) {
    if (process.dev) {
      console.warn('microCMS credentials are not set. Falling back to sample data.');
    }
  } else {
    if (process.dev && process.server) {
      console.log('[microcms] runtimeConfig', {
        serviceDomain: config.microcmsServiceDomain,
        hasApiKey: Boolean(config.microcmsApiKey)
      });
    }

    client = createClient({
      serviceDomain: config.microcmsServiceDomain,
      apiKey: config.microcmsApiKey,
      customFetch
    });
  }

  await nuxtApp.callHook('microcms:client:ready', client);

  return {
    provide: {
      microcmsClient: client
    }
  };
});

declare module '#app' {
  interface NuxtApp {
    $microcmsClient: MicroCMSClient;
  }
}

declare module 'nuxt/schema' {
  interface RuntimeNuxtHooks {
    'microcms:client:ready': (client: MicroCMSClient) => void;
  }
}
