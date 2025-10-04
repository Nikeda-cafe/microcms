# Nuxt3 + MicroCMS ブログコンテンツサイト 仕様書

## 概要

本システムは **Nuxt3** をフロントエンドフレームワークとし、**microCMS**
をヘッドレスCMSとして利用してブログコンテンツを管理する。\
フロントエンドでは **Pinia** による状態管理を導入し、テストは
**Vitest**、静的解析は **ESLint** を利用する。

------------------------------------------------------------------------

## 使用技術・ライブラリ

-   **Nuxt3**: フロントエンドフレームワーク
-   **Pinia**: 状態管理ライブラリ
-   **microCMS**: コンテンツ管理（ブログ記事、カテゴリ、タグなど）
-   **Vitest**: テストフレームワーク
-   **ESLint**: コード品質維持
-   **TypeScript**: 型安全の担保

------------------------------------------------------------------------

## 機能一覧

### 1. 公開機能

-   トップページ
    -   このサイトの概要
    -   最新記事一覧（取得できれば表示）
    -   人気記事（microCMS または DB によるカウント）（取得できれば表示）
-   記事一覧ページ
-   記事詳細ページ
    -   タイトル、本文（Markdownレンダリング）
    -   投稿日、更新日
    -   カテゴリ、タグ表示

### 2. 管理機能（microCMS 側）

-   記事のCRUD
-   メタデータ管理（SEO情報）

------------------------------------------------------------------------

## データ構造

### microCMS モデル例

#### 記事 (articles)

-   id: string
-   title: string
-   body: markdown
-   category: reference(category)
-   tags: reference(tags)\[\]
-   publishedAt: datetime
-   updatedAt: datetime
-   eyecatch: image

------------------------------------------------------------------------

## ディレクトリ構成例

    project-root/
    ├─ .eslintrc.js
    ├─ src/
    │   ├─ components/
    │   │   ├─ ui/
    │   │   └─ blog/
    │   ├─ composables/
    │   ├─ layouts/
    │   ├─ pages/
    │   │   ├─ index.vue
    │   │   ├─ blog/[slug].vue
    │   │   ├─ category/[slug].vue
    │   │   └─ tag/[slug].vue
    │   ├─ plugins/
    │   │   └─ microcms.ts
    │   ├─ store/
    │   │   └─ blog.ts
    │   └─ utils/
    │       └─ markdown.ts
    ├─ tests/
    │   └─ unit/
    │       └─ blog.spec.ts
    └─ vitest.config.ts

------------------------------------------------------------------------

## 状態管理（Pinia）

``` ts
// store/blog.ts
import { defineStore } from 'pinia'
import { fetchArticles } from '~/utils/microcms'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    articles: [] as Article[],
    loading: false,
  }),
  actions: {
    async loadArticles() {
      this.loading = true
      this.articles = await fetchArticles()
      this.loading = false
    }
  }
})
```

------------------------------------------------------------------------

## テスト (Vitest)

``` ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import BlogCard from '~/components/blog/BlogCard.vue'

describe('BlogCard', () => {
  it('renders title', () => {
    const { getByText } = render(BlogCard, {
      props: { title: 'Test Title' }
    })
    expect(getByText('Test Title')).toBeTruthy()
  })
})
```

------------------------------------------------------------------------

## ESLint 設定例

``` js
module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@nuxtjs/eslint-config-typescript'
  ],
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single']
  }
}
```

------------------------------------------------------------------------

## 開発・運用フロー

1.  microCMS 上で記事・カテゴリ・タグを管理
2.  Nuxt3 アプリで API を呼び出しフロント表示
3.  Pinia で状態を管理し、ページ間で共有
4.  Vitest によるユニットテスト
5.  GitHub Actions 等による CI/CD（ESLint → テスト → デプロイ）
