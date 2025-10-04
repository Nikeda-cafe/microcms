import MarkdownIt from 'markdown-it';

const renderer = new MarkdownIt({ html: true, linkify: true, breaks: true });

export const renderMarkdown = (content: string): string => {
  if (!content) {
    return '';
  }

  return renderer.render(content);
};
