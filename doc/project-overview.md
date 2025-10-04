# Nuxt3 × microCMS プロジェクト解説

本ドキュメントは `/Users/nikeda/doc/projects/microcms` に配置された Nuxt3 アプリの構成と、microCMS API 呼び出しの流れを整理したものです。プロジェクトの全体像を掴みたい場合や、API 取得まわりの実装を追いかけたい場合に参照してください。

---

## 1. プロジェクト概要

- フロントエンド: **Nuxt3 (TypeScript)**
- 状態管理: **Pinia**
- コンテンツ管理: **microCMS** の `news` エンドポイント
- マークダウン描画: `markdown-it`
- CSS: 主要部分はコンポーネントスコープスタイル (Tailwind 等は未導入)

microCMS の認証情報が設定されていない場合でも、サーバ側で用意したサンプルデータにフォールバックして表示を継続できるようになっています。

---

## 2. ディレクトリ構成の要点

```
src/
├─ app.vue                 # ルートレイアウト
├─ components/             # UI・ブログ関連のVueコンポーネント
├─ composables/useSiteMeta.ts
├─ layouts/                # Nuxtのレイアウト (現状はデフォルト構成)
├─ pages/
│  ├─ index.vue            # トップページ (最新・人気記事表示)
│  ├─ blog/index.vue       # 記事一覧 + ページネーション
│  ├─ blog/[slug].vue      # 記事詳細 (Markdown を HTML に変換)
│  ├─ category/[slug].vue  # カテゴリ単位の記事一覧
│  └─ tag/[slug].vue       # タグ単位の記事一覧
├─ types/blog.ts           # 記事・カテゴリ・タグの型定義
└─ utils/
   └─ markdown.ts          # Markdown → HTML 変換ユーティリティ

src/server/
├─ api/news/index.get.ts   # microCMS 記事一覧 API へのプロキシ
├─ api/news/[slug].get.ts  # microCMS 記事詳細 API へのプロキシ
└─ utils/microcms-helpers.ts # サーバ側で使う共通ヘルパーとサンプルデータ
```

---

## 3. 環境変数と runtimeConfig

`nuxt.config.ts` では次の環境変数を `runtimeConfig` にマッピングしています。

| 変数名 | 用途 | 備考 |
| --- | --- | --- |
| `MICROCMS_SERVICE_DOMAIN` | microCMS サービスドメイン | **プロトコルなしのサブドメイン** (例: `api-test-in`) を指定 |
| `MICROCMS_API_KEY` | microCMS API キー | `X-MICROCMS-API-KEY` として利用 |

値はサーバサイドでのみ参照され、フロントに露出しません。サーバ側ヘルパー (`src/server/utils/microcms-helpers.ts`) で `useRuntimeConfig()` を呼び出し、API キーが未設定ならサンプルデータを返却します。
サービスドメインが `https://` 含みの形式で指定されていても自動的に正しい形式 (`api-test-in` など) に整形します。

---

## 4. サーバサイドの microCMS プロキシ

### 4.1 `src/server/utils/microcms-helpers.ts`

- `createClient` で microCMS クライアントを生成し、プロセス内でキャッシュ。
- 認証情報が無い場合は `null` を返し、同ファイルにある `sampleArticles` を利用。
- クエリパラメータを microCMS 用に整形する `buildMicroCMSQueries`、サンプルデータ用に整形する `buildSampleQueries` を提供。
- microCMS のレスポンスを `Article` 型に変換する `mapArticle` を共通化。

### 4.2 `src/server/api/news/index.get.ts`

- クライアントからのクエリ (`limit` / `offset` / `orders` / `category` / `tag` など) を受け取り、microCMS を呼び出す。
- 開発環境ではアクセス先の microCMS URL をサーバログに出力。
- 認証が無い場合はサンプルデータに対して同じ条件でフィルター・ソートした結果を返します。

### 4.3 `src/server/api/news/[slug].get.ts`

- `slug` (microCMS の `id` 相当) を受け取り、詳細情報を取得。
- `getListDetail` で見つからない場合は `slug` フィルターで再検索し、最終的に存在しなければ 404 を返却。
- 認証情報が無い場合はサンプル記事の中から一致するものを返します。

---

## 5. クライアントサイドからの呼び出し方

- フロントエンドではすべて `useFetch('/api/news', { query })` もしくは `useFetch('/api/news/{slug}')` を直接呼び出します。
- `useFetch` は Nuxt 標準のデータ取得関数で、SSR 時にも CSR 時にも同じ記述で動作します。
- 返却値は `ArticleListResponse` または `Article` なので、`ref.value?.contents ?? []` のように安全に参照できます。
- 画面は常に自前サーバ (`/api/news`) を経由するため、microCMS の API キーがブラウザへ露出することはありません。

---

## 6. ページでのデータ取得

- すべてのページで `useFetch('/api/news', { query: ... })` を使い、必要なクエリパラメータだけを指定して記事を取得します。
- トップページ (`pages/index.vue`)
  - 最新記事と人気記事を 2 本の `useFetch` で読み込みます。
  - 取得結果の `contents` をそのまま `BlogList` に渡すシンプルな構造です。
- 記事一覧 (`pages/blog/index.vue`)
  - クエリパラメータ `page` から `offset` を計算し、`useFetch` の `query` で渡します。
  - ページ番号が変わったら `refresh()` で再取得するだけです。
- 記事詳細 (`pages/blog/[slug].vue`)
  - `/api/news/{slug}` を `useFetch` で取得し、404 の場合は `createError` を投げて Nuxt のエラーページへ委譲します。
  - 本文は `renderMarkdown` を通して HTML に変換して表示します。
- カテゴリ／タグページ
  - `category` または `tag` クエリを渡して再利用しています。
  - 取得結果に含まれる先頭記事からタイトル・説明文を組み立て、`useSiteMeta` で反映します。

## 7. メタ情報の設定

- `useSiteMeta` コンポーザブルで `<head>` タイトルと description を簡潔に設定。
- 記事詳細やカテゴリ/タグページでは `watchEffect` によりデータ取得後にタイトルを更新。

---

## 8. コンポーネントと補助ユーティリティ

- `components/blog/BlogList.vue` と `BlogCard.vue` が記事リスト表示の中心。
- `components/blog/ArticleMeta.vue` (省略) が公開日やカテゴリ・タグを表示。
- `utils/markdown.ts` は `markdown-it` のインスタンスを共有し、HTML (リンク自動化、改行保持、HTML 許可) へ変換します。

---

## 9. API 呼び出しの実際の流れ

1. `.env` などで `MICROCMS_SERVICE_DOMAIN=api-test-in` と `MICROCMS_API_KEY=...` を設定。
2. 画面からは各ページで `useFetch('/api/news', { query })` を呼び、自前の API を利用。
3. `/api/news` が microCMS の `news` エンドポイントへリクエストを行い、開発時はその URL をサーバログに出力。
4. レスポンスは `ArticleListResponse` / `Article` に整形されてクライアントへ返却。
5. ページ側で取得データを描画し、必要に応じて `useSiteMeta` でメタ情報を更新。

---

## 10. デバッグのヒント

- サーバログ: `/api/news` が microCMS 呼び出し前にアクセス先 URL を標準出力へ記録します。
- ブラウザ: DevTools の Network タブでリクエストとレスポンス本文を確認可能。
- 追加ログ: 必要であればページやサーバ API で `console.log` を挟み、受け取った `contents` の実際の構造を把握できます。
- フォールバック確認: 環境変数を未設定にするとサンプル記事が利用されるため、API 接続前の UI テストに役立ちます。

---

## 11. 参考

- `nuxt3_microcms_spec.md`: プロジェクト仕様の元資料
- [microCMS 公式ドキュメント](https://document.microcms.io/) (API エンドポイント仕様)
- [microcms-js-sdk](https://github.com/microcmsio/microcms-js-sdk) (クライアント設定オプション)

このドキュメントは開発者向けの導線として随時加筆していく想定です。新たなユースケースや検証手順を追加する場合は、本ファイルに追記してください。
