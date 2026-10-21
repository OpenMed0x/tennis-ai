# Tennis 网站（Next.js + FastAPI + Supabase Auth）

## 1. Supabase
新建项目 → Authentication → Providers 开启 Email。
URL Configuration 里把 Site URL 设为 http://localhost:3000，Redirect URLs 加 http://localhost:3000/auth/callback。
（开发时想跳过邮箱验证：Providers → Email 关闭 "Confirm email"。）

## 1.5 建表
在 SQL Editor 运行 supabase/schema.sql（创建 logs 表并开启行级安全）。

## 2. 前端
npx create-next-app@latest frontend --ts --tailwind --app --eslint
然后把本目录的 frontend/ 文件复制覆盖进去（layout.tsx 会覆盖默认的，保留 globals.css）。
cd frontend && npm i @supabase/ssr @supabase/supabase-js recharts
复制 .env.local.example 为 .env.local 并填值，然后 npm run dev

## 3. 后端
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
复制 .env.example 为 .env 并填值
uvicorn main:app --reload --port 8000

## 流程
浏览器登录 → Supabase 发 token → Next 服务端带 token 请求 FastAPI → FastAPI 向 Supabase 校验后返回数据。

## 访问规则
- 未登录：可浏览所有板块，字段完整但为空白只读预览。
- 已登录：记录和查看自己的数据。
- 隔离：后端带用户 token 访问数据库，logs 表开启了行级安全（user_id = auth.uid()），即使绕过页面也读不到别人的数据。

## 管理员与登录时长
- 指定管理员：在 SQL Editor 运行 supabase/schema.sql 末尾那段 update（换成你的邮箱），然后该账号退出再重新登录。
- 管理员只能"读"所有人的记录（页面 /admin），不能改别人的；普通用户只能读写自己的。
- 登录状态 30 天：每次访问都会续期，即"最后一次访问后 30 天内免登录"。若要"无论是否访问，满 30 天强制重新登录"，需在 Supabase 控制台 Authentication → Sessions 里设置 Time-box（付费计划功能）。

## 数据看板（/dashboard）
累计次数、投入时长、投入资金、收益回报（运动总结里"结果"的 1–10 自评均分）。管理员在 /admin 可切换到任意用户或全部用户。

## 验证码登录（邮箱 / 手机）
登录和注册是同一个流程：输入邮箱或手机号 → 收到验证码 → 输入验证码。第一次使用的邮箱或手机号会自动创建账号，没有密码。

**邮箱验证码**（Supabase 控制台 → Authentication → Email Templates）
- 默认邮件发的是登录链接，不是验证码。把 "Confirm signup" 和 "Magic Link" 两个模板都改成包含 `{{ .Token }}`，例如：`<p>Your code: {{ .Token }}</p>`。新用户收的是前者，老用户收的是后者。
- Supabase 自带的邮件服务每小时只能发很少几封，正式使用前请在 Authentication 的 SMTP 设置里接入自己的邮件服务。

**手机验证码**（Authentication → Providers → Phone）
- 开启 Phone，并配置一个短信服务商（如 Twilio）。短信按条收费。
- 中国大陆号码能否收到取决于服务商，必要时可以用 Supabase 的 Send SMS hook 接入本地短信服务。
- 手机号会按"区号 + 数字"提交，页面里已经带了常用区号，可以在 `app/login/page.tsx` 的 `COUNTRY_CODES` 里增减。

## 中英文切换
- 顶部有 EN / 中文 按钮，点一下立即切换，选择会记在浏览器里（默认中文）。
- 界面文字在 `frontend/lib/i18n.ts` 的 `T` 表里，板块和记录项的英文名在同一文件下半部分。新增记录项时，在 `EN_ITEM` 里补一行英文。
