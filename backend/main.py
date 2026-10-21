import os
import uuid
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
MODULES = {"nutrition", "prep", "skills", "mind", "summary"}

app = FastAPI(title="Tennis API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- 身份 ----------
def bearer(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "缺少登录凭证")
    return authorization



async def current_user(auth: str = Depends(bearer)) -> dict:
    print(
        "Auth diagnostic:",
        "length =", len(auth),
        "is_ascii =", auth.isascii(),
        "has_bearer_prefix =", auth.startswith("Bearer "),
        "has_chinese =", any("\u4e00" <= ch <= "\u9fff" for ch in auth),
    )
    """向 Supabase 校验令牌，拿到用户 id 和 app_metadata（含管理员标记）。"""
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"Authorization": auth, "apikey": SUPABASE_ANON_KEY},
        )
    if r.status_code != 200:
        raise HTTPException(401, "登录已过期，请重新登录")
    u = r.json()
    u["_auth"] = auth
    return u


def is_admin(u: dict) -> bool:
    return (u.get("app_metadata") or {}).get("role") == "admin"


def require_admin(u: dict):
    if not is_admin(u):
        raise HTTPException(403, "仅管理员可访问")


async def db(method: str, u: dict, table: str = "logs", params=None, json=None, extra=None):
    # 带着用户自己的令牌访问数据库：最终由数据库的行级安全(RLS)兜底
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": u["_auth"],
        "Content-Type": "application/json",
        **(extra or {}),
    }
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.request(method, f"{SUPABASE_URL}/rest/v1/{table}", headers=headers, params=params, json=json)
    if r.status_code in (401, 403):
        raise HTTPException(401, "登录已过期，请重新登录")
    if r.status_code >= 400:
        raise HTTPException(502, f"数据库错误：{r.text}")
    return r.json() if r.content else None


def resolve_target(u: dict, user_id: str | None) -> str | None:
    """返回要查询的用户 id；None 表示所有人（仅管理员）。"""
    if user_id in (None, "", u["id"]):
        return u["id"]
    require_admin(u)
    if user_id == "all":
        return None
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(400, "user_id 无效")
    return user_id


# ---------- 记录 ----------
class LogIn(BaseModel):
    module: str
    item: str
    value: float | None = None
    count: float | None = None
    note: str | None = None


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/api/me")
async def me(u: dict = Depends(current_user)):
    return {"id": u["id"], "email": u.get("email"), "is_admin": is_admin(u)}


@app.post("/api/logs")
async def add_log(body: LogIn, u: dict = Depends(current_user)):
    if body.module not in MODULES:
        raise HTTPException(400, "未知板块")
    rows = await db("POST", u, json={**body.model_dump(), "user_id": u["id"]},
                    extra={"Prefer": "return=representation"})
    return rows[0]


@app.get("/api/logs")
async def list_logs(module: str, days: int = 14, u: dict = Depends(current_user)):
    if module not in MODULES:
        raise HTTPException(400, "未知板块")
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    # 一定带 user_id 过滤：管理员账号在自己的页面上也只看到自己的数据
    return await db("GET", u, params={
        "user_id": f"eq.{u['id']}", "module": f"eq.{module}",
        "created_at": f"gte.{since}", "order": "created_at.desc", "limit": "300",
    })


@app.delete("/api/logs/{log_id}")
async def delete_log(log_id: int, u: dict = Depends(current_user)):
    await db("DELETE", u, params={"id": f"eq.{log_id}", "user_id": f"eq.{u['id']}"})
    return {"ok": True}


@app.get("/api/summary")
async def summary(u: dict = Depends(current_user)):
    rows = await db("GET", u, params={
        "user_id": f"eq.{u['id']}", "module": "eq.summary", "item": "in.(time_min,money)",
        "select": "item,value", "limit": "5000",
    })
    total = {"time_min": 0.0, "money": 0.0}
    for r in rows:
        total[r["item"]] += r["value"] or 0
    return total


# ---------- 可视化统计 ----------
def week_start(ts: str) -> str:
    d = date.fromisoformat(ts[:10])
    return (d - timedelta(days=d.weekday())).isoformat()


def build_stats(rows: list[dict]) -> dict:
    totals = {"reps": 0.0, "skill_minutes": 0.0, "time_min": 0.0, "money": 0.0,
              "recover": 0.0, "mindful": 0.0}
    by_item = defaultdict(lambda: {"count": 0.0, "minutes": 0.0})
    weekly = defaultdict(lambda: {"time_min": 0.0, "money": 0.0, "reps": 0.0, "skill_minutes": 0.0})
    rating = defaultdict(lambda: defaultdict(list))

    for r in rows:
        wk, m, it = week_start(r["created_at"]), r["module"], r["item"]
        v, c = r.get("value") or 0, r.get("count") or 0
        if m == "skills":
            totals["reps"] += c
            totals["skill_minutes"] += v
            by_item[it]["count"] += c
            by_item[it]["minutes"] += v
            weekly[wk]["reps"] += c
            weekly[wk]["skill_minutes"] += v
        elif m == "mind" and it in ("recover", "mindful"):
            totals[it] += v
        elif m == "summary":
            if it in ("time_min", "money"):
                totals[it] += v
                weekly[wk][it] += v
            elif it.startswith("result_") and r.get("value") is not None:
                rating[wk][it].append(r["value"])

    scores = [x for d in rating.values() for lst in d.values() for x in lst]
    totals["avg_rating"] = round(sum(scores) / len(scores), 1) if scores else None
    return {
        "totals": totals,
        "reps_by_item": sorted(
            [{"item": k, **v} for k, v in by_item.items()], key=lambda x: -x["count"]),
        "weekly": [{"week": k, **v} for k, v in sorted(weekly.items())],
        "results": [
            {"week": wk, **{k.replace("result_", ""): round(sum(l) / len(l), 1) for k, l in d.items()}}
            for wk, d in sorted(rating.items())
        ],
    }


@app.get("/api/stats")
async def stats(user_id: str | None = None, u: dict = Depends(current_user)):
    """默认返回自己的统计；管理员可传 user_id=某用户 或 all。"""
    target = resolve_target(u, user_id)
    params = {"select": "module,item,value,count,created_at", "order": "created_at.asc", "limit": "20000"}
    if target:
        params["user_id"] = f"eq.{target}"
    return build_stats(await db("GET", u, params=params))


# ---------- 管理员 ----------
@app.get("/api/admin/users")
async def admin_users(u: dict = Depends(current_user)):
    require_admin(u)
    return await db("GET", u, table="profiles",
                    params={"select": "id,email,phone", "order": "email.asc", "limit": "1000"})


@app.get("/api/admin/logs")
async def admin_logs(user_id: str = "all", days: int = 14, u: dict = Depends(current_user)):
    require_admin(u)
    target = resolve_target(u, user_id)
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    params = {"created_at": f"gte.{since}", "order": "created_at.desc", "limit": "500"}
    if target:
        params["user_id"] = f"eq.{target}"
    return await db("GET", u, params=params)
