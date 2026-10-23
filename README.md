# 带派桌宠 (dsh-yujie-pet)

DeepSeek Harness 的桌面宠物插件：右下角一只抠好背景的小人，每次回复结束蹦一下并喊一句「带派不，老铁」；点它也会立刻出声。

- 挂载点：`shell.overlay`（桌宠）+ `conversation.composer.dock`（监听轮次结束）
- 声音：Host 端常驻播放进程，点击到出声约几十毫秒
- 形象：用户提供的照片抠图 + 白色贴纸描边 + 圆形图标

## 安装

```sh
dsh plugin --profile <profile> add dsh-yujie-pet
```

或在 DSH 的插件市场里搜索 `dsh-yujie-pet`。

安装后刷新页面，右下角出现小人即可。

## 素材声明

- 人物形象来自插件作者提供的照片，经抠图处理。
- 音频来自爱给网（`带派不老铁——雨姐`），版权归原权利人。

**这两项素材不是 MIT 许可内容**，代码以 MIT 发布，素材随包分发仅限个人使用场景。若你要二次分发或商用，请自行取得授权。

## 配置

没有可视化设置页。要改声音，替换 `assets/voice-source.wav`（16-bit PCM WAV）后重启宿主；要改形象，替换 `assets/pet.webp` 并重新构建 `client.js`。

## License

代码 MIT。素材见上。
