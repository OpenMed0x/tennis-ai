// 板块与记录项都在这里配置：增删改一行即可，页面和后端不用动
// kind: check=打卡完成 | number=填数值 | count=点一次 +1 | time_count=分钟+次数 | text=写文字 | text_score=1-10评分+一句话
export type Kind = "check" | "number" | "count" | "time_count" | "text" | "text_score";
export type Item = { key: string; label: string; kind: Kind; unit?: string; group?: string; hint?: string };
export type Module = { slug: string; title: string; desc: string; items: Item[] };

export const MODULES: Module[] = [
  {
    slug: "nutrition",
    title: "运动膳食",
    desc: "吃饱、补水、体重",
    items: [
      { key: "eat_full", label: "吃饱", kind: "check" },
      { key: "water", label: "冰水", kind: "number", unit: "升", hint: "目标 1.5 升" },
      { key: "weight", label: "体重", kind: "number", unit: "公斤" },
    ],
  },
  {
    slug: "prep",
    title: "运动准备",
    desc: "装备与热身",
    items: [
      { key: "wristband", label: "护腕", kind: "check", group: "装备" },
      { key: "hat", label: "帽子", kind: "check", group: "装备" },
      { key: "clothes_shoes", label: "运动衣物 / 鞋子", kind: "check", group: "装备" },
      { key: "warm_wrist", label: "手腕热身", kind: "check", group: "热身" },
      { key: "warm_band", label: "弹力带训练", kind: "check", group: "热身" },
      { key: "warm_legs", label: "双腿步伐训练", kind: "check", group: "热身" },
    ],
  },
  {
    slug: "skills",
    title: "网球技能",
    desc: "每项技术的练习时长与次数",
    items: [
      { key: "steady_rally", label: "稳定对拉", kind: "time_count", unit: "分钟" },
      { key: "forehand", label: "正手", kind: "time_count", unit: "分钟" },
      { key: "two_hand_bh", label: "双反", kind: "time_count", unit: "分钟" },
      { key: "one_hand_bh", label: "单反", kind: "time_count", unit: "分钟" },
      { key: "serve", label: "发球", kind: "time_count", unit: "分钟" },
      { key: "volley", label: "截击", kind: "time_count", unit: "分钟" },
      { key: "slice", label: "切削", kind: "time_count", unit: "分钟" },
      { key: "find_point", label: "寻找击球点", kind: "time_count", unit: "分钟" },
      { key: "swing_volley", label: "凌空击球", kind: "time_count", unit: "分钟" },
      { key: "juggle", label: "颠球", kind: "time_count", unit: "分钟" },
      { key: "eye_on_ball", label: "盯球训练", kind: "time_count", unit: "分钟" },
    ],
  },
  {
    slug: "mind",
    title: "心理建设",
    desc: "压力、切换恢复、正念",
    items: [
      { key: "stress", label: "压力监测", kind: "number", unit: "/ 10", hint: "1 很放松，10 很紧绷" },
      { key: "recover", label: "有效 / 无效击球之间的切换恢复", kind: "count", unit: "次", hint: "不需要时刻最佳，回得来就算" },
      { key: "mindful", label: "“太好了，我又完成一次击球”", kind: "count", unit: "次" },
    ],
  },
  {
    slug: "summary",
    title: "运动总结",
    desc: "成本与结果",
    items: [
      { key: "time_min", label: "投入时间", kind: "number", unit: "分钟", group: "成本" },
      { key: "money", label: "投入金钱", kind: "number", unit: "元", group: "成本" },
      { key: "result_skill", label: "技能", kind: "text_score", unit: "/ 10", group: "结果（自评 1–10 分，可附一句话）" },
      { key: "result_mind", label: "心理", kind: "text_score", unit: "/ 10", group: "结果（自评 1–10 分，可附一句话）" },
      { key: "result_other", label: "其他", kind: "text_score", unit: "/ 10", group: "结果（自评 1–10 分，可附一句话）" },
    ],
  },
];
