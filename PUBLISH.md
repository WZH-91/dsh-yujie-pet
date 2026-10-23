# 发布步骤

## 1. 建仓库

```powershell
cd C:\Users\Police\Downloads\dsh-yujie-pet-publish
git init
git add .
git commit -m "feat: daipai desktop pet plugin"
gh repo create dsh-yujie-pet --public --source=. --push
```

没有 `gh` 就手动在 GitHub 建空仓库，然后 `git remote add origin ...` + `git push -u origin main`。

## 2. 发 npm

先改 `package.json` 里的 `repository.url` 为你的仓库地址，然后：

```powershell
npm login
npm publish --access public
```

包名 `dsh-yujie-pet` 目前没被占用（2026-10 查过）。

## 3. 进市场目录

市场列表来自 https://github.com/awesome-dsh-plugin/awesome-dsh-plugin

1. Fork 该仓库
2. 按仓库 README 的列表格式加一条（条目信息直接用 `registry-entry.json` 里的字段）
3. 提 PR，通常一天内站点与 dshmarket 自动收录

## 4. 自检

```powershell
dsh plugin --profile <profile> add dsh-yujie-pet
```

装完刷新页面，点小人应立刻出声，回复结束应自动出声。

## 注意

- `index.js` 里的调试日志默认关闭，需要时设环境变量 `DSH_PET_DEBUG=1`。
- 素材（照片、音频）不是 MIT 内容，发布即公开分发，版权与肖像权风险由发布者承担。
