# Nuxt3 × microCMS プロジェクト解説

本ドキュメントは `/Users/nikeda/doc/projects/microcms` に配置された Nuxt3 アプリの構成と、microCMS API 呼び出しの流れを整理したものです。プロジェクトの全体像を掴みたい場合や、API 取得まわりの実装を追いかけたい場合に参照してください。

---

## 1. プロジェクト概要

- フロントエンド: **Nuxt3 (TypeScript)**
- 状態管理: **Pinia**
- コンテンツ管理: **microCMS** の `news` エンドポイント
- マークダウン描画: `markdown-it`
- CSS: 主要部分はコンポーネントスコープスタイル (Tailwind 等は未導入)

microCMS の認証情報が設定されていない場合でも、`src/utils/microcms.ts` 内のサンプルデータにフォールバックして表示を継続できるようになっています。

---

## 2. ディレクトリ構成の要点

```
src/
├─ app.vue                 # ルートレイアウト
├─ components/             # UI・ブログ関連のVueコンポーネント
├─ composables/useSiteMeta.ts
├─ layouts/                # Nuxtのレイアウト (現状はデフォルト構成)
├─ pages/
│  ├─ index.vue            # トップページ (最新/人気記事表示)
│  ├─ blog/index.vue       # 記事一覧 + ページネーション
│  ├─ blog/[slug].vue      # 記事詳細 (Markdown を HTML に変換)
│  ├─ category/[slug].vue  # カテゴリ単位の記事一覧
│  └─ tag/[slug].vue       # タグ単位の記事一覧
├─ plugins/microcms.ts     # microCMS クライアント注入とリクエストログ
├─ store/blog.ts           # 記事・人気記事を保持する Pinia ストア
├─ types/blog.ts           # 記事・カテゴリ・タグの型定義
└─ utils/
   ├─ microcms.ts          # microCMS 呼び出しユーティリティ
   └─ markdown.ts          # Markdown → HTML 変換ユーティリティ
```

---

## 3. 環境変数と runtimeConfig

`nuxt.config.ts` では次の環境変数を `runtimeConfig` にマッピングしています。

| 変数名 | 用途 | 備考 |
| --- | --- | --- |
| `MICROCMS_SERVICE_DOMAIN` | microCMS サービスドメイン | **プロトコルなしのサブドメイン** (例: `api-test-in`) を指定 |
| `MICROCMS_API_KEY` | microCMS API キー | `X-MICROCMS-API-KEY` として利用 |

値はサーバサイドでのみ参照され、フロントに露出しません。`src/plugins/microcms.ts` 内で `useRuntimeConfig()` を呼び出しており、`process.dev && process.server` の条件下では設定内容 (マスク済み) をログ出力します。

---

## 4. microCMS クライアント初期化フロー (`src/plugins/microcms.ts`)

1. Nuxt のプラグインとして実行され、`useRuntimeConfig()` からサービスドメインと API キーを取得。
2. 開発サーバかつサーバサイドの場合、`[microcms] runtimeConfig` として設定の有無をコンソール出力。
3. `createClient` を呼び、`customFetch` にロギング用ラッパー関数を指定。これにより開発時は microCMS への全リクエスト URL と HTTP メソッドがサーバコンソールに表示されます。
4. 生成したクライアントを `nuxtApp.provide('microcmsClient', client)` で注入し、同時に `microcms:client:ready` フックを発火。
5. プラグイン経由で注入されたクライアントは `useNuxtApp().$microcmsClient` から参照可能。

環境変数が未設定の場合は `console.warn` を出しつつ `null` を提供し、後述のユーティリティがローカルサンプルデータにフォールバックします。

---

## 5. データ取得ユーティリティ (`src/utils/microcms.ts`)

### 5.1 クライアント取得 (`getClient`)

- 既にキャッシュ済みのクライアントがあればそれを返却。
- プラグインから注入されていればそれを利用。
- 注入されていない場合は runtimeConfig から直接 `createClient` し直します (SSR の安全対策)。
- どのケースでもクライアントが得られない場合は `null` を返し、呼び出し側でサンプルデータのレスポンスを生成します。

### 5.2 レスポンスマッピング

- `mapArticle` で microCMS の `contents` をアプリ用 `Article` 型に変換。
- `slug` フィールドが存在しない場合は `id` を slug として扱い、`thumbnail` が存在すれば `eyecatch` の代替として利用。

### 5.3 主要な公開関数

| 関数 | 概要 | 呼び出し先 |
| --- | --- | --- |
| `fetchArticles(queries)` | 記事一覧 (`GET /news`) を取得 | トップページ、記事一覧、Pinia ストア |
| `fetchArticleBySlug(slug)` | 詳細記事を取得。まず `getListDetail(contentId=slug)` を試し、失敗したら `filters=slug[equals]{slug}` で再取得 | `pages/blog/[slug].vue` |
| `fetchArticlesByCategory(categorySlug, queries)` | カテゴリ別の記事一覧。`filters=category[equals]{slug}` | `pages/category/[slug].vue` |
| `fetchArticlesByTag(tagSlug, queries)` | タグ別の記事一覧。`filters=tags[contains]{slug}` | `pages/tag/[slug].vue` |
| `fetchPopularArticles(queries)` | 人気記事 (現状は `orders` 未指定時に `-publishedAt` でソート) | トップページの人気記事枠 |

`client` が `null` の場合、いずれの関数もサンプル記事 (`sampleArticles`) を返すため、開発初期でも画面確認が可能です。

---

## 6. ページとストアの連携

### 6.1 Pinia ストア (`src/store/blog.ts`)

- `articles` と `popularArticles` を保持し、`loadArticles` / `loadPopularArticles` で microCMS ユーティリティを呼び出します。
- API エラーは `error` ステートに格納し、画面でメッセージ表示。

### 6.2 ページのデータフェッチ

- `pages/index.vue` では `useAsyncData` により初回レンダリングでストアのロードアクションを並列実行。
- `pages/blog/index.vue` ではクエリパラメータ `page` から `offset` を計算し、`loadArticles` を発火。ページネーションはクエリリンクで制御。
- `pages/blog/[slug].vue` は `fetchArticleBySlug` を呼び出して記事を取得し、`renderMarkdown` を通じて HTML 変換した本文 (`v-html`) を表示。
- カテゴリ/タグページでは `fetchArticlesByCategory` / `fetchArticlesByTag` を直接呼び、取得結果からヘッダー用のタイトルと説明を生成しています。

### 6.3 メタ情報の設定

- `useSiteMeta` コンポーザブルで `<head>` タイトルと description を簡潔に設定。
- 記事詳細やカテゴリ/タグページでは `watchEffect` によりデータ取得後にタイトルを更新。

---

## 7. コンポーネントと補助ユーティリティ

- `components/blog/BlogList.vue` と `BlogCard.vue` が記事リスト表示の中心。
- `components/blog/ArticleMeta.vue` (省略) が公開日やカテゴリ・タグを表示。
- `utils/markdown.ts` は `markdown-it` のインスタンスを共有し、HTML (リンク自動化、改行保持、HTML 許可) へ変換します。

---

## 8. API 呼び出しの実際の流れ

1. `.env` などで `MICROCMS_SERVICE_DOMAIN=api-test-in` と `MICROCMS_API_KEY=...` を設定。
2. Nuxt 起動時に `plugins/microcms.ts` が実行され、microCMS クライアントを作成。
3. 画面アクセスに応じてページやストアから `utils/microcms.ts` の関数が呼ばれ、SDK 経由で `https://api-test-in.microcms.io/api/v1/news` へリクエスト。
4. サーバコンソールには `[microcms] request GET https://api-test-in.microcms.io/api/v1/news?...` の形式でログが表示され、レスポンスは `mapArticle` で型を整えて Vue 側に渡されます。
5. ページ側で取得データを描画し、必要に応じて `useSiteMeta` でメタ情報を更新。

---

## 9. デバッグのヒント

- サーバログ: `customFetch` により開発時はすべてのリクエスト URL が自動で出力されます。
- ブラウザ: DevTools の Network タブでリクエストとレスポンス本文を確認可能。
- 追加ログ: `utils/microcms.ts` 内に一時的に `console.log` を挟むと、受け取った `contents` の実際の構造を把握できます。
- フォールバック確認: 環境変数を未設定にするとサンプル記事が利用されるため、API 接続前の UI テストに役立ちます。

---

## 10. 参考

- `nuxt3_microcms_spec.md`: プロジェクト仕様の元資料
- [microCMS 公式ドキュメント](https://document.microcms.io/) (API エンドポイント仕様)
- [microcms-js-sdk](https://github.com/microcmsio/microcms-js-sdk) (クライアント設定オプション)

このドキュメントは開発者向けの導線として随時加筆していく想定です。新たなユースケースや検証手順を追加する場合は、本ファイルに追記してください。
