# Quadratic Voting サイト構築

## 計画

- [x] Next.js プロジェクト初期化 (App Router + Tailwind CSS)
- [x] Cloudflare D1 データベースセットアップ (sessions, options, ballots, ballot_items)
- [x] API ルート実装 (セッション作成, 投票, 投票済みチェック)
- [x] トップページ (セッション作成フォーム)
- [x] 投票ページ (Quadratic Voting UI)
- [x] 結果ページ (投票結果表示)
- [x] 動作確認 (E2E: 作成 → 投票 → 結果 → 再投票防止)

## デプロイ手順

1. `wrangler d1 create quadratic-voting-db` で D1 データベース作成
2. `wrangler.jsonc` の `database_id` を更新
3. `npm run db:migrate:remote` でリモート DB にマイグレーション適用
4. `npm run cf:build && npm run cf:deploy` でデプロイ
