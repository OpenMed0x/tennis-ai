// 登录状态保存 30 天：每次访问页面，中间件都会刷新并重新写入这个有效期
// （即"最后一次访问后 30 天内免登录"）
export const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30,
  sameSite: "lax" as const,
  path: "/",
};
