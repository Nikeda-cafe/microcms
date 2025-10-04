export const useSiteMeta = (title: string, description?: string) => {
  useHead({
    title,
    meta: [
      { name: 'description', content: description || '' }
    ]
  });
};
