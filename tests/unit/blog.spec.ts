import { render } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import BlogCard from '~/components/blog/BlogCard.vue';

describe('BlogCard', () => {
  it('renders the provided title', () => {
    const title = 'Test Title';
    const { getByText } = render(BlogCard, {
      props: {
        title,
        href: '/blog/test-title',
        tags: []
      }
    });

    expect(getByText(title)).toBeTruthy();
  });

  it('shows formatted published date', () => {
    const { getByText } = render(BlogCard, {
      props: {
        title: 'Published article',
        href: '/blog/published-article',
        publishedAt: '2024-02-01T00:00:00.000Z',
        tags: []
      }
    });

    expect(getByText(/2024/)).toBeTruthy();
  });
});
