Backendはサブツリーとして管理されています。バックエンドの変更をメインリポジトリに取り込むには、以下のコマンドを実行してください。

```bash
git fetch backend
git subtree pull --prefix backend backend master -m "Sync backend"
```

また、以下のようにして

```bash
git config alias.sync-backend '!git fetch backend && git subtree pull --prefix backend backend master -m "Sync backend"'
git sync-backend
```

でエイリアスも可能です。
