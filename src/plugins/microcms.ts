import { createClient } from 'microcms-js-sdk';

type MicroCMSClient = ReturnType<typeof createClient> | null;

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();
  let client: MicroCMSClient = null;

  if (!config.microcmsServiceDomain || !config.microcmsApiKey) {
    if (process.dev) {
      console.warn('microCMS credentials are not set. Falling back to sample data.');
    }
  } else {
    client = createClient({
      serviceDomain: config.microcmsServiceDomain,
      apiKey: config.microcmsApiKey
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
