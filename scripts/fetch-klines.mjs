// 코인선물 적성검사 - 5분봉 데이터 베이킹
// 바이낸스 현물 API에서 코인별 "역사적 명장면" 10일치(2880봉) 5분봉 OHLC를 수집해
// 차트당 JSON으로 저장. 가격은 청크 시작가=100으로 지수화해 코인 정체를 숨긴다.
// 파일명은 인덱스(0.json...)로 심볼 비노출, manifest.json에는 등급 힌트만 포함.
// 실행: node scripts/fetch-klines.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STEP = 5 * 60 * 1000; // 5분
const BARS = 2880; // 10일치

// [심볼, 이름, 등급, 청크 시작일(UTC), 구간 별명]
// 등급은 플레이 중 유일한 힌트 — 코인을 특정하기 어려운 굵기로 유지
const CHARTS = [
  // 비트코인
  ["BTCUSDT", "비트코인", "메이저", "2020-03-06", "2020 코로나 대폭락"],
  ["BTCUSDT", "비트코인", "메이저", "2021-01-02", "2021 1월 불장"],
  ["BTCUSDT", "비트코인", "메이저", "2021-05-12", "2021 5·19 대폭락"],
  ["BTCUSDT", "비트코인", "메이저", "2021-11-04", "2021 사상 최고가 부근"],
  ["BTCUSDT", "비트코인", "메이저", "2022-06-10", "2022 셀시우스 사태"],
  ["BTCUSDT", "비트코인", "메이저", "2022-11-04", "2022 FTX 붕괴"],
  ["BTCUSDT", "비트코인", "메이저", "2024-02-23", "2024 신고가 랠리"],
  ["BTCUSDT", "비트코인", "메이저", "2024-07-29", "2024 8·5 글로벌 급락"],
  ["BTCUSDT", "비트코인", "메이저", "2024-11-01", "2024 미 대선 펌핑"],
  ["BTCUSDT", "비트코인", "메이저", "2026-05-25", "2026 최근 구간"],
  // 이더리움
  ["ETHUSDT", "이더리움", "메이저", "2020-03-06", "2020 코로나 대폭락"],
  ["ETHUSDT", "이더리움", "메이저", "2021-05-12", "2021 5·19 대폭락"],
  ["ETHUSDT", "이더리움", "메이저", "2021-08-01", "2021 여름 랠리"],
  ["ETHUSDT", "이더리움", "메이저", "2022-09-09", "2022 머지 전후"],
  ["ETHUSDT", "이더리움", "메이저", "2024-05-17", "2024 ETF 승인 전후"],
  ["ETHUSDT", "이더리움", "메이저", "2026-05-25", "2026 최근 구간"],
  // 알트코인
  ["SOLUSDT", "솔라나", "알트코인", "2021-08-25", "2021 솔라나 썸머"],
  ["SOLUSDT", "솔라나", "알트코인", "2021-09-03", "2021 9·7 급락"],
  ["SOLUSDT", "솔라나", "알트코인", "2022-11-04", "2022 FTX 붕괴 직격"],
  ["SOLUSDT", "솔라나", "알트코인", "2023-12-10", "2023 부활 랠리"],
  ["SOLUSDT", "솔라나", "알트코인", "2026-05-20", "2026 최근 구간"],
  ["XRPUSDT", "리플", "알트코인", "2021-04-08", "2021 봄 펌핑"],
  ["XRPUSDT", "리플", "알트코인", "2024-11-08", "2024 대선 후 폭등"],
  ["ADAUSDT", "에이다(카르다노)", "알트코인", "2021-08-27", "2021 스마트컨트랙트 펌핑"],
  ["AVAXUSDT", "아발란체", "알트코인", "2021-11-15", "2021 막판 불꽃"],
  ["DOTUSDT", "폴카닷", "알트코인", "2021-10-25", "2021 가을 랠리"],
  ["LINKUSDT", "체인링크", "알트코인", "2021-05-12", "2021 5·19 대폭락"],
  ["BNBUSDT", "BNB", "알트코인", "2021-05-12", "2021 5·19 대폭락"],
  // 밈코인
  ["DOGEUSDT", "도지코인", "밈코인", "2021-04-12", "2021 머스크 펌핑"],
  ["DOGEUSDT", "도지코인", "밈코인", "2021-05-04", "2021 SNL 전후"],
  ["DOGEUSDT", "도지코인", "밈코인", "2026-05-20", "2026 최근 구간"],
  ["SHIBUSDT", "시바이누", "밈코인", "2021-10-22", "2021 시바 광풍"],
  ["PEPEUSDT", "페페", "밈코인", "2023-05-06", "2023 밈코인 광풍"],
  ["WIFUSDT", "도그위프햇", "밈코인", "2024-03-06", "2024 밈 시즌"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchChunk(symbol, startMs) {
  const t = [], o = [], h = [], l = [], c = [];
  let cursor = startMs;
  while (o.length < BARS) {
    const limit = Math.min(1000, BARS - o.length);
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&startTime=${cursor}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("봉 없음");
    for (const r of rows) {
      t.push(r[0]); o.push(+r[1]); h.push(+r[2]); l.push(+r[3]); c.push(+r[4]);
    }
    cursor = rows[rows.length - 1][0] + STEP;
    await sleep(250);
  }
  return { t, o, h, l, c };
}

const dest = join(ROOT, "public", "data");
mkdirSync(dest, { recursive: true });

const manifest = [];
let idx = 0;

for (const [symbol, name, tier, startDate, era] of CHARTS) {
  process.stdout.write(`${name} ${startDate} (${era}) ... `);
  try {
    const raw = await fetchChunk(symbol, Date.parse(startDate + "T00:00:00Z"));
    if (raw.o.length < BARS) throw new Error(`봉 부족 (${raw.o.length})`);
    // 시작가 = 100 기준 지수화 (코인 정체 은닉 + 파일 정밀도 통일)
    const base = raw.o[0];
    const nd = (v) => Math.round((v / base) * 100 * 1000) / 1000;
    const data = {
      t: symbol, name, tier, era,
      t0: raw.t[0], step: STEP, base,
      o: raw.o.map(nd), h: raw.h.map(nd), l: raw.l.map(nd), c: raw.c.map(nd),
    };
    writeFileSync(join(dest, `${idx}.json`), JSON.stringify(data));
    manifest.push({ i: idx, tier, bars: data.o.length });
    console.log(`OK -> ${idx}.json (${data.o.length}봉)`);
    idx++;
  } catch (e) {
    console.log(`실패: ${e.message}`);
  }
  await sleep(300);
}

writeFileSync(
  join(dest, "manifest.json"),
  JSON.stringify({ updated: new Date().toISOString().slice(0, 10), charts: manifest })
);
console.log(`\nmanifest.json 저장 (차트 ${manifest.length}개)`);
