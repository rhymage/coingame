// 차트만 보고 롱·숏 치는 - 코인선물 적성검사 — 게임 엔진
const $ = (s) => document.querySelector(s);
const gaEvent = (name, params = {}) => {
  if (typeof window.gtag === "function") window.gtag("event", name, params);
};
const N = 240;      // 게임 구간: 5분봉 240개 = 20시간
const PRE = 240;    // 사전 공개 구간: 직전 20시간
const START_ASSET = 10000000; // 가상자금 1,000만원
const FEE = 0.0005; // 테이커 수수료 0.05% (진입/종료 각각, 명목가 기준)
const MMR = 0.005;  // 유지증거금률 0.5% (격리마진 청산가 계산용)
const LEVS = [1, 2, 5, 10, 20, 50];

const TIER_EMOJI = { "메이저": "👑", "알트코인": "🌊", "밈코인": "🐶" };
const TIER_EN   = { "메이저": "Major", "알트코인": "Altcoin", "밈코인": "Meme Coin" };

// ── 다국어 (KO / EN) ──
const STRINGS = {
  ko: {
    h1sub:"차트만 보고 롱·숏 치는", h1main:"🚀 코인선물 적성검사",
    tagline:"실제 차트, 가상자금 1,000만원, 최대 50배 레버리지. 살아남을 수 있을까?",
    rule1:"🎲 <b>정체불명의 코인</b>이 랜덤으로 선택됩니다 (등급만 공개 · 가격은 100 기준 지수화)",
    rule2:"📜 먼저 <b>직전 20시간(5분봉 240개)</b>이 그려집니다. 흐름을 파악하세요",
    rule3:"📈 <b>▶ 시작</b>을 누르면 이어서 20시간(240봉)이 흘러가요 — <b>롱/숏</b> 전환 자유!",
    rule4:"⚡ 레버리지 <b>1~50배</b> · 진입은 전액 증거금 · 진입/종료마다 <b>수수료 0.05%</b>",
    rule5:"💀 증거금이 소진되면 <b>강제청산 = 즉시 게임 오버</b>. 50배는 단 <b>-1.5%</b>면 끝장",
    rule6:"🏁 종료 후 <b>코인 공개</b> + 현물 존버와 성적 비교",
    btnStart:"🚀 검사 시작", btnAgain:"🔄 한 판 더", btnCard:"📸 결과 공유", btnRestart:"🔄 다시시작",
    ma20:"― 20봉선", ma60:"― 60봉선", ma120:"― 120봉선",
    startHint:"📜 직전 20시간 차트입니다. <b>▶ 선물 매매 시작</b>을 누르면 이어서 그려져요 — 미리 진입해둬도 됩니다.",
    statEquityLabel:"총자산", statRetLabel:"수익률", levLabel:"레버리지",
    btnClose:"✅ 포지션 종료 (익절/손절)", roeLabel:"증거금 대비 손익 (ROE)",
    revealPre:"당신이 롱·숏 치던 코인은...", gradeLabel:"선물 적성",
    btnChallenge:"⚔️ 친구에게 도전장 보내기",
    challengeDesc:"내가 방금 플레이한 <b>똑같은 코인·똑같은 구간</b>으로 친구가 대결하는 링크를 보냅니다.<br>친구의 결과 화면에 승패가 자동으로 표시돼요. (친구에게도 코인은 비밀)",
    copyBtn:"복사",
    caveatTitle:"⚠️ 실제 선물 시장은 이 게임보다 훨씬 가혹합니다",
    caveat1:"이 게임엔 <b>펀딩비(보유 수수료)·슬리피지·호가 스프레드가 없고</b>, 청산 시 발생하는 <b>청산 수수료와 보험기금 차감</b>도 단순화되어 있습니다. 실제 고배율 선물에선 순간적인 꼬리(휩쏘) 한 번에 증거금 전체가 사라지며, 통계적으로 <b>선물 트레이더 대다수가 손실</b>로 끝납니다.",
    caveat2:"따라서 이 게임의 수익률은 <b>실제 투자 수익을 전혀 보장하지 않습니다.</b>",
    otherGame:"주식단타 적성검사 해보기",
    cardModalTitle:"📸 결과 카드", shareSave:"저장", shareCopy:"복사", shareNativeBtn:"공유", closeBtn:"닫기 ✕",
    footerDisclaimer:"본 게임은 재미를 위한 것으로 투자 권유가 아니며, 게임 성적은 실제 투자 실력을 보장하지 않습니다.",
    previewPhase:"직전 20시간",
    btnPlayLoading:"⏳ 차트 그리는 중", btnPlayStart:"▶ 선물 매매 시작",
    btnPlayPause:"⏸ 일시정지", btnPlayResume:"▶ 재개", btnStep:"⏭ +1봉",
    noPos:"현재 포지션 없음 — 방향을 정해 진입하세요",
    longHeld:"🔺 롱 보유 중", longEntry:"🔺 롱 진입", longSwitch:"🔺 롱 전환",
    shortHeld:"🔻 숏 보유 중", shortEntry:"🔻 숏 진입", shortSwitch:"🔻 숏 전환",
    hintOpposite:"반대 버튼 = 스위칭", hintFee:"종료+진입 수수료 2번",
    hintLong:"오를 것 같다", hintShort:"내릴 것 같다",
    toastNoPos:"종료할 포지션이 없어요 😅",
    toastAlreadyLong:"이미 롱 보유 중이에요", toastAlreadyShort:"이미 숏 보유 중이에요",
    toastLevLocked:"포지션 종료 후 레버리지를 바꿀 수 있어요",
    toastQueued:"다음 봉 시가 체결", toastFilled:"체결 (현재가)",
    toastLevWarn:(lev,pct)=>`⚠️ ${lev}배: 가격이 약 ${pct}% 반대로 가면 강제청산됩니다`,
    confirmRestart:"이 판을 버리고 다시 시작할까요?", confirmOk:"다시 시작", confirmCancel:"취소",
    chartRemain:(n)=>`⏳ 남은 ${n}봉`,
    chartStart:"▶ 시작", chartEntry:(px)=>`진입 ${px}`, chartLiq:(px)=>`💀 청산 ${px}`,
    chartPriceLine:"— 코인 가격", chartAssetLine:"— 내 자산",
    hiddenIcon:"❓", hiddenLabel1:"청산 이후 미공개", hiddenLabel2:"복수전에서 확인",
    hiddenLabelBig:"청산 이후 미공개",
    statTrades:"진입 횟수", statWinRate:"익절 승률", statMdd:"최대 낙폭",
    statFees:"총 수수료", statMaxLev:"최고 레버리지", statLongShort:"롱 : 숏",
    vsMyFutures:"🫵 나의 선물", vsSpot:"💎 현물로 존버했다면", vs10x:"🎰 10배 롱 존버였다면",
    vsLiqAfter:"❓ 미공개", vs10xLiqLabel:"💀 강제청산", vs10xAfter:"❓ 끝까지 살아남으면 공개",
    liqMark:"💀 청산 -100%",
    challengeArrived:(won)=>`⚔️ <b>도전장 도착!</b> 상대의 최종 자산은 <b>${won}</b>. 같은 차트로 이겨보세요.`,
    challengeArrivedNoScore:"⚔️ <b>도전장 도착!</b> 친구와 같은 차트로 대결합니다.",
    challengeWin:(me,them)=>`🏆 <b>승리!</b> 나 ${me} vs 상대 ${them}`,
    challengeLose:(me,them)=>`😭 <b>패배...</b> 나 ${me} vs 상대 ${them}`,
    challengeTie:(me)=>`🤝 무승부! 둘 다 ${me}`,
    challengeCopied:"✅ 복사됐어요! 카톡창에 붙여넣어 보내세요.<small>다시 누르면 재복사</small>",
    challengeManual:"아래 링크를 복사해서 친구에게 보내세요 👇",
    revengeAd:"📺 광고 보고 같은 차트로 복수전", revengeFree:"🔥 같은 차트로 복수전",
    revengeSub:"이번엔 앞 흐름을 알고 친다 — 설욕의 기회",
    cardSaved:"이미지를 저장했어요! 💾",
    cardCopied:"카드 이미지가 복사됐어요! 붙여넣기 하세요 📋",
    cardCopyFail:"이 브라우저는 이미지 복사가 안 돼요. '이미지 저장'을 이용해 주세요 🙏",
    shareTextLiq:"💀 코인선물 적성검사에서 강제청산당했다... 증거금 전액이 사라짐. 너는 살아남을 수 있냐? ⚔️",
    shareText:(grade,ret,bh)=>`🚀 코인선물 적성검사 ${grade}등급! ${ret} 달성 (현물 존버 ${bh}). 너도 한번 해봐 ⚔️`,
    shareNativeFallback:"텍스트와 링크를 복사했어요! 어디든 붙여넣기 해서 공유하세요 📋",
    shareNativeFail:"공유 기능이 지원되지 않아요. '복사' 버튼을 이용해 주세요 🙏",
    dashTitle:"📊 내 선물 기록",
    dashGames:"판수", dashBeats:"존버 이긴 비율", dashLiqs:"강제청산", dashBest:"최고 등급",
    dashLiqLabel:"💀 청산", dashGradeLabel:"등급",
    footerData:(date)=>`실제 과거 시세(바이낸스 5분봉, 시작가 100 지수화) 기반 모의투자 게임 · 펀딩비/슬리피지 미반영 · ${date} 데이터`,
    cardTitle:"🚀 차트만 보고 롱·숏 치는 - 코인선물 적성검사",
    cardLiqLine:"나의 선물 💀 강제청산 (-100%)",
    cardLiqSpotHidden:"청산 이후 시세는 미공개 — 복수전에서 확인",
    cardSpotLine:(ret)=>`현물 존버였다면 ${ret}`,
    cardMyLine:(ret,won)=>`나의 선물 ${ret}  (${won})`,
    cardFootnote:"너도 해봐 → 차트만 보고 롱·숏 치는 - 코인선물 적성검사",
    cardChallengeWin:(them)=>`🏆 도전 승리! 상대 ${them}`,
    cardChallengeWith:(them)=>`상대 ${them}와 대결`,
    cardStats:(t,w,m,l)=>`진입 ${t}회    익절 승률 ${w}    최대 낙폭 -${m}%    최고 ${l}배`,
    gradeLiqComment:(lev,day)=>`💀 ${lev?lev+"배 레버리지로 ":""}강제청산 — 증거금 1,000만원 전액이 사라졌습니다. 실제 선물 시장에서 매일 일어나는 일입니다.`,
    gradePosProfit:(ret,bh)=>`💰 ${ret} 익절 성공 — 익절은 언제나 옳습니다! 다만 현물로 들고만 있었어도 ${bh}였기에 선물 점수는 아쉬워요.`,
    gradeProfitC:(bh)=>`💰 익절은 옳다! 수익도 냈고 현물 존버(${bh})와 비슷한 성적. 나쁘지 않아요. 🙂`,
    gradeComment:{
      SSS:["존버를 60%p 넘게 압도했습니다. 차트가 미래를 속삭여주나요? 🏆","대폭락장을 숏으로 지배했습니다. 시장의 포식자. 🦈"],
      SS:["롱과 숏을 자유자재로. 거래소가 당신을 주시하기 시작했습니다. 🔥","폭락장에서 살아남는 걸 넘어 압승했습니다. 숏의 정석. 🛡️"],
      S:["당신... 혹시 청산당해 본 적이 없으신가요? 시장을 압살했습니다. 👑","무너지는 시장에서 이 방어력이라니. 도망과 숏은 실력입니다. 🏃"],
      A:["선물 적성 확실합니다. 실전엔 펀딩비와 슬리피지가 있다는 것만 기억하세요. 😎","시장은 무너졌지만 당신은 덜 무너졌습니다. 생존왕. 🪖"],
      B:["존버보다 잘했습니다. 청산도 안 당했고요. 소질이 보여요. 🙂","손실은 났지만 존버보단 나았어요. 위기 감지 능력 있음. 🦊"],
      C:["레버리지까지 쓰고 고생했는데 성적은 현물 존버와 비슷해요. 😴","이러나 저러나 비슷하게 잃었습니다. 수수료만 기부했네요. 😮‍💨"],
      D:["방향을 거꾸로 타는 재능이 있습니다. 손은 주머니에. 🫠","롱 잡으면 떨어지고 숏 잡으면 오르고. 시장이 당신을 보고 있어요. 👁️"],
      F:["축하합니다. 당신은 거래소의 우수 고객이었습니다. 선물 금지. 🚫","고점 롱 저점 숏의 정석. 교과서에 반면교사로 실립니다. 📚"],
      "?":["진입을 안 하면 적성을 알 수 없습니다. 다음 판엔 버튼을 눌러보세요. 👀","진입을 안 하면 적성을 알 수 없습니다. 다음 판엔 버튼을 눌러보세요. 👀"],
    },
    behaviorLiq:(lev,day)=>`💀 ${lev}배 진입 후 ${day}번째 봉에서 청산 — 보험기금에 기부 완료`,
    behaviorNoEntry:"👀 단 한 번도 진입하지 않은 관전형",
    behavior50x:"🎰 50배 풀레버 생존자 — 청산까지 1.5%였습니다. 간이 부었어요",
    behaviorHighLev:(lev)=>`🎰 ${lev}배 레버리지 생존자 — 간이 큽니다`,
    behaviorPingpong:(n,fee)=>`🔄 롱숏 핑퐁 ${n}회 — 수수료만 ${fee}`,
    behaviorOvertrading:(n)=>`🔥 뇌동매매 경보 — 20시간에 ${n}회 진입`,
    behaviorWinRate:(pct)=>`🎯 익절 승률 ${pct}% — 타이밍 감각 있음`,
    behaviorSummary:(n,lev)=>`✂️ 총 ${n}회 진입 (최고 ${lev}배)`,
    hudDay:(d,n,h)=>`${d}/${n}봉 · 남은 약 ${h}시간`,
    tierUnit:"5분봉",
    side1:"롱", sideN1:"숏",
    posEntry:(e,m)=>`· 진입 ${e} · 증거금 ${m}`,
    posLiqInfo:(p,d)=>`💀 청산가 ${p} (현재가 대비 ${d})`,
    posNoLiq:"💀 청산가 없음 (1배 롱)",
    cardFilename:"코인선물적성검사.png",
    statTradesVal:(n)=>`${n}회`,
    statMaxLevVal:(n)=>`${n}배`,
    dashGradeEntry:(g)=>`${g}등급`,
    dashRowSuffix:(me,hold)=>`나 ${me} / 존버 ${hold}`,
    cardPeriodLabel:"20시간 선물",
    vsMyFuturesFull:(won)=>`🫵 나의 선물 (최종 ${won})`,
  },
  en: {
    h1sub:"Long or Short on Charts —", h1main:"🚀 Crypto Futures Aptitude Test",
    tagline:"Real charts, virtual $10,000, up to 50× leverage. Can you survive?",
    rule1:"🎲 A <b>mystery coin</b> is randomly selected (tier shown · price indexed to 100)",
    rule2:"📜 First, the <b>past 20 hours (240 × 5-min candles)</b> are drawn. Read the flow.",
    rule3:"📈 Hit <b>▶ Start</b> and the next 20 hours unfold — switch <b>Long/Short</b> freely!",
    rule4:"⚡ Leverage <b>1–50×</b> · Full-margin entry · <b>0.05% fee</b> per open/close",
    rule5:"💀 If margin is wiped, <b>liquidation = instant game over</b>. At 50×, just <b>−1.5%</b> ends it.",
    rule6:"🏁 At the end, <b>coin revealed</b> + compared against spot buy-and-hold",
    btnStart:"🚀 Start Test", btnAgain:"🔄 Play Again", btnCard:"📸 Share Result", btnRestart:"🔄 Restart",
    ma20:"― MA20", ma60:"― MA60", ma120:"― MA120",
    startHint:"📜 Past 20-hour chart. Hit <b>▶ Start Futures Trading</b> to continue — you can enter a position now.",
    statEquityLabel:"Total Equity", statRetLabel:"Return", levLabel:"Leverage",
    btnClose:"✅ Close Position (TP/SL)", roeLabel:"Return on Margin (ROE)",
    revealPre:"The coin you traded was…", gradeLabel:"Futures Aptitude",
    btnChallenge:"⚔️ Challenge a Friend",
    challengeDesc:"Sends a link where your friend plays the <b>exact same coin &amp; time window</b>.<br>Win/loss appears automatically on their result. (Coin stays hidden from them too)",
    copyBtn:"Copy",
    caveatTitle:"⚠️ Real futures markets are far harsher than this game",
    caveat1:"This game has <b>no funding rates, slippage, or spread</b>, and <b>liquidation fees and insurance fund deductions</b> are simplified. In real high-leverage futures, a single wick can wipe your entire margin, and statistically <b>most futures traders end up losing</b>.",
    caveat2:"Therefore, this game's returns <b>do not guarantee real investment performance in any way.</b>",
    otherGame:"Try the Stock Day-Trading Test",
    cardModalTitle:"📸 Result Card", shareSave:"Save", shareCopy:"Copy", shareNativeBtn:"Share", closeBtn:"Close ✕",
    footerDisclaimer:"For entertainment only — not investment advice. Game results do not guarantee actual trading performance.",
    previewPhase:"Past 20 Hours",
    btnPlayLoading:"⏳ Drawing chart…", btnPlayStart:"▶ Start Futures Trading",
    btnPlayPause:"⏸ Pause", btnPlayResume:"▶ Resume", btnStep:"⏭ +1 Candle",
    noPos:"No position — choose a direction to enter",
    longHeld:"🔺 Long held", longEntry:"🔺 Long", longSwitch:"🔺 Switch to Long",
    shortHeld:"🔻 Short held", shortEntry:"🔻 Short", shortSwitch:"🔻 Switch to Short",
    hintOpposite:"Opposite = switch", hintFee:"Close + open (2× fee)",
    hintLong:"Bet it goes up", hintShort:"Bet it goes down",
    toastNoPos:"No position to close 😅",
    toastAlreadyLong:"Already holding Long", toastAlreadyShort:"Already holding Short",
    toastLevLocked:"Close position before changing leverage",
    toastQueued:"Queued — fills at next candle open", toastFilled:"Filled (current price)",
    toastLevWarn:(lev,pct)=>`⚠️ ${lev}×: Liquidated if price moves ~${pct}% against you`,
    confirmRestart:"Abandon this game and restart?", confirmOk:"Restart", confirmCancel:"Cancel",
    chartRemain:(n)=>`⏳ ${n} candles left`,
    chartStart:"▶ Start", chartEntry:(px)=>`Entry ${px}`, chartLiq:(px)=>`💀 Liq ${px}`,
    chartPriceLine:"— Coin Price", chartAssetLine:"— My Equity",
    hiddenIcon:"❓", hiddenLabel1:"Hidden after liquidation", hiddenLabel2:"Rematch to unlock",
    hiddenLabelBig:"Hidden after liquidation",
    statTrades:"Entries", statWinRate:"Win Rate", statMdd:"Max Drawdown",
    statFees:"Total Fees", statMaxLev:"Max Leverage", statLongShort:"Long : Short",
    vsMyFutures:"🫵 My Futures", vsSpot:"💎 Spot Buy-and-Hold", vs10x:"🎰 10× Long Buy-and-Hold",
    vsLiqAfter:"❓ Hidden", vs10xLiqLabel:"💀 Liquidated", vs10xAfter:"❓ Survive to unlock",
    liqMark:"💀 Liq −100%",
    challengeArrived:(won)=>`⚔️ <b>Challenge received!</b> Opponent's final equity: <b>${won}</b>. Beat them!`,
    challengeArrivedNoScore:"⚔️ <b>Challenge received!</b> Same chart as your friend.",
    challengeWin:(me,them)=>`🏆 <b>Victory!</b> You ${me} vs opponent ${them}`,
    challengeLose:(me,them)=>`😭 <b>Defeat...</b> You ${me} vs opponent ${them}`,
    challengeTie:(me)=>`🤝 Draw! Both ${me}`,
    challengeCopied:"✅ Copied! Paste it to your friend.<small>Click again to recopy</small>",
    challengeManual:"Copy the link below and send it to your friend 👇",
    revengeAd:"📺 Watch an ad · Rematch on same chart", revengeFree:"🔥 Rematch on same chart",
    revengeSub:"You know the lead-in this time — get your revenge",
    cardSaved:"Image saved! 💾",
    cardCopied:"Card image copied! Paste anywhere 📋",
    cardCopyFail:"This browser doesn't support image copy. Use 'Save' instead 🙏",
    shareTextLiq:"💀 Got liquidated in the Crypto Futures Test... Entire margin wiped. Can you survive? ⚔️",
    shareText:(grade,ret,bh)=>`🚀 Crypto Futures Test — Grade ${grade}! ${ret} (spot hold ${bh}). Try it! ⚔️`,
    shareNativeFallback:"Text and link copied! Paste anywhere to share 📋",
    shareNativeFail:"Sharing not supported. Use the 'Copy' button instead 🙏",
    dashTitle:"📊 My Futures Record",
    dashGames:"Games", dashBeats:"Beat buy-and-hold", dashLiqs:"Liquidations", dashBest:"Best grade",
    dashLiqLabel:"💀 Liq", dashGradeLabel:"Grade",
    footerData:(date)=>`Simulated trading on real historical prices (Binance 5-min, indexed to 100) · No funding/slippage · ${date} data`,
    cardTitle:"🚀 Long or Short on Charts — Crypto Futures Aptitude Test",
    cardLiqLine:"My Futures 💀 Liquidated (−100%)",
    cardLiqSpotHidden:"Price after liq hidden — play Rematch to see",
    cardSpotLine:(ret)=>`Spot hold: ${ret}`,
    cardMyLine:(ret,won)=>`My Futures ${ret}  (${won})`,
    cardFootnote:"Try it → Crypto Futures Aptitude Test",
    cardChallengeWin:(them)=>`🏆 Challenge won! Opponent: ${them}`,
    cardChallengeWith:(them)=>`vs opponent ${them}`,
    cardStats:(t,w,m,l)=>`${t} entries    Win rate ${w}    Max DD −${m}%    Max ${l}×`,
    gradeLiqComment:(lev,day)=>`💀 Liquidated ${lev?"at "+lev+"×":""} — your entire $10,000 margin is gone. This happens every day in real futures markets.`,
    gradePosProfit:(ret,bh)=>`💰 ${ret} profit taken — always right to take profit! But spot hold alone gave ${bh}, so futures score is lower.`,
    gradeProfitC:(bh)=>`💰 Profit is right! Made gains, matching spot hold (${bh}). Not bad. 🙂`,
    gradeComment:{
      SSS:["You crushed buy-and-hold by 60%+. Can you read the future? 🏆","You dominated the crash with shorts. Apex predator. 🦈"],
      SS:["Longs and shorts at will. The exchange is watching you now. 🔥","Not just survived the crash — you won big. Short mastery. 🛡️"],
      S:["...Have you ever been liquidated? You crushed the market. 👑","That defense in a falling market is elite. Running and shorting IS skill. 🏃"],
      A:["Clear futures aptitude. Just remember: real trading has funding fees. 😎","The market fell but you fell less. Survivor king. 🪖"],
      B:["Beat buy-and-hold. No liquidation either. Potential showing. 🙂","Losses, but less than hodling. Decent risk sense. 🦊"],
      C:["Used leverage, struggled — ended up same as spot hold. 😴","Either way, similar losses. You just donated fees. 😮‍💨"],
      D:["You have a talent for going the wrong direction. Hands in pockets. 🫠","Buy → drops, short → pumps. The market is watching you. 👁️"],
      F:["Congratulations — you were the exchange's VIP customer. Futures banned. 🚫","Top-buy, bottom-short. A textbook example of what not to do. 📚"],
      "?":["Can't measure aptitude without trading. Press some buttons next time. 👀","Can't measure aptitude without trading. Press some buttons next time. 👀"],
    },
    behaviorLiq:(lev,day)=>`💀 Liquidated at ${lev}× on candle ${day} — donated to the insurance fund`,
    behaviorNoEntry:"👀 Observer mode — never opened a position",
    behavior50x:"🎰 50× survivor — liquidation was 1.5% away. Bold.",
    behaviorHighLev:(lev)=>`🎰 ${lev}× leverage survivor — fearless`,
    behaviorPingpong:(n,fee)=>`🔄 Long-short flip-flop ${n}× — paid ${fee} in fees`,
    behaviorOvertrading:(n)=>`🔥 Overtrading alert — ${n} entries in 20 hours`,
    behaviorWinRate:(pct)=>`🎯 ${pct}% win rate — solid timing sense`,
    behaviorSummary:(n,lev)=>`✂️ ${n} total entries (max ${lev}×)`,
    hudDay:(d,n,h)=>`Candle ${d}/${n} · ~${h}h left`,
    tierUnit:"5-min",
    side1:"Long", sideN1:"Short",
    posEntry:(e,m)=>`· Entry ${e} · Margin ${m}`,
    posLiqInfo:(p,d)=>`💀 Liq ${p} (${d} from current)`,
    posNoLiq:"💀 No liq price (1× Long)",
    cardFilename:"crypto-futures-test.png",
    statTradesVal:(n)=>`${n}`,
    statMaxLevVal:(n)=>`${n}×`,
    dashGradeEntry:(g)=>`Grade ${g}`,
    dashRowSuffix:(me,hold)=>`Me ${me} / Hold ${hold}`,
    cardPeriodLabel:"20h Futures",
    vsMyFuturesFull:(won)=>`🫵 My Futures (final: ${won})`,
  },
};
let LOCALE = (() => {
  const s = localStorage.getItem("lang");
  if (s === "ko" || s === "en") return s;
  return navigator.language.startsWith("ko") ? "ko" : "en";
})();
const t = (key) => STRINGS[LOCALE][key];

let MANIFEST = null;

const G = {
  chart: null, chartIdx: 0, start: 0,
  phase: "intro", // intro | preview | playing | done
  day: 0, wallet: START_ASSET, lev: 5,
  pos: null, // {side ±1, lev, margin, qty, entry, liqPx}
  pending: [], trades: [], equityCurve: [],
  fees: 0, entries: 0, longs: 0, shorts: 0, switches: 0,
  closes: 0, wins: 0, maxLev: 0,
  liq: false, liqInfo: null, // {day, lev}
  speed: 1, timer: null, previewTimer: null, paused: false, started: false,
  challenge: null, // {g:"idx.start", r: 상대 최종자산|null}
  result: null,
};

// ── 유틸 ──
const pct = (v, digits = 1) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(digits)}%`;

// 원화 표기: 1,234만원 / 1억 2,345만원
function fmtWon(v) {
  const man = Math.round(v / 10000);
  if (Math.abs(man) >= 10000) {
    const eok = Math.floor(Math.abs(man) / 10000) * Math.sign(man);
    const rest = Math.abs(man) % 10000;
    return `${eok.toLocaleString("ko-KR")}억${rest ? " " + rest.toLocaleString("ko-KR") + "만원" : "원"}`;
  }
  return `${man.toLocaleString("ko-KR")}만원`;
}
function fmtMoney(v) {
  if (LOCALE === "en") return "$" + Math.round(v / 1000).toLocaleString("en-US");
  return fmtWon(v);
}
const fmtPx = (v) => v.toFixed(1);
const bar = (i) => G.start + i; // window 인덱스(음수 = 사전 구간) → 전체 인덱스

// 봉 시각 (KST 표기)
function barTime(d) {
  return new Date(G.chart.t0 + bar(d) * G.chart.step);
}
function fmtKST(date, withYear = true) {
  const p = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(date).reduce((a, x) => ((a[x.type] = x.value), a), {});
  return `${withYear ? p.year.replace("년", "") + "." : ""}${p.month}.${p.day} ${p.hour}:${p.minute}`;
}

// n봉 이동평균 (전체 인덱스 기준, 데이터 부족 시 null)
function ma(i, n) {
  if (i - n + 1 < 0) return null;
  let sum = 0;
  for (let k = i - n + 1; k <= i; k++) sum += G.chart.c[k];
  return sum / n;
}

function show(id) {
  ["scr-intro", "scr-game", "scr-result"].forEach((s) => $("#" + s).classList.add("hidden"));
  $("#" + id).classList.remove("hidden");
  window.scrollTo(0, 0);
}

// ── 광고 (Ad Placement API: 전면 + 리워드) ──
const ADS = { gamesFinished: 0, lastInterstitial: 0, misses: 0, rewardShowFn: null, rewardViewed: false };
let REVENGE = null; // {idx, start} — 리워드 광고 시청 후 같은 차트 재도전

// adsbygoogle.js가 실제로 로드됐는지 (애드블록/오프라인이면 push가 순정 배열 그대로)
const adsLibReady = () => window.adsbygoogle && window.adsbygoogle.push !== Array.prototype.push;

function initAds() {
  adConfig({ preloadAdBreaks: "on", sound: "off" });
}

// "한 판 더" 전면광고: 3판째부터, 최소 90초 간격. 광고가 안 떠도 게임은 반드시 진행된다.
// H5 미승인 등으로 광고가 2번 연속 안 나오면 그 세션에선 더 시도하지 않는다 (폴백 대기 지연 방지).
function maybeInterstitial(then) {
  const now = Date.now();
  if (!adsLibReady() || ADS.misses >= 2 || ADS.gamesFinished < 2 || now - ADS.lastInterstitial < 90000) return then();
  let proceeded = false, shown = false;
  const go = () => { if (!proceeded) { proceeded = true; then(); } };
  adBreak({
    type: "next", name: "play_again",
    beforeAd: () => { shown = true; ADS.misses = 0; ADS.lastInterstitial = Date.now(); gaEvent("ad_interstitial", { placement: "play_again" }); },
    adBreakDone: go,
  });
  // 콜백이 영영 안 오는 경우 대비한 폴백
  setTimeout(() => { if (!shown) { ADS.misses++; go(); } }, 1500);
}

// 복수전 버튼: 손실/청산 결과일 때 항상 노출.
// 리워드 광고가 준비되면 '광고 보고' 모드, 아니면(H5 미승인 등) 무료 복수전으로 동작.
function setRevengeLabel() {
  const label = ADS.rewardShowFn ? t("revengeAd") : t("revengeFree");
  $("#btn-revenge").innerHTML = `${label}<span>${t("revengeSub")}</span>`;
}
function plantRevengeAd() {
  $("#btn-revenge").classList.remove("hidden");
  setRevengeLabel();
  if (!adsLibReady() || ADS.rewardShowFn) return;
  adBreak({
    type: "reward", name: "revenge_match",
    beforeReward: (showAdFn) => { ADS.rewardShowFn = showAdFn; setRevengeLabel(); },
    adViewed: () => { ADS.rewardViewed = true; gaEvent("ad_reward_viewed", { placement: "revenge" }); },
    adDismissed: () => { ADS.rewardViewed = false; },
    adBreakDone: () => {
      ADS.rewardShowFn = null;
      if (ADS.rewardViewed) { ADS.rewardViewed = false; startRevenge(); }
    },
  });
}

function startRevenge() {
  REVENGE = { idx: G.chartIdx, start: G.start };
  gaEvent("revenge_start", { chart: G.chartIdx });
  startGame();
}

let toastTimer = null;
function toast(msg) {
  $("#g-toast").textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("#g-toast").textContent = ""), 1800);
}

// ── 선물 회계 (격리마진 · 전액 증거금) ──
const upnl = (px) => (G.pos ? G.pos.qty * (px - G.pos.entry) * G.pos.side : 0);
const equityAt = (px) => G.wallet + (G.pos ? G.pos.margin + upnl(px) : 0);

// 격리마진 청산가: 증거금 + 미실현손익 = 유지증거금(명목가×MMR)이 되는 가격
function liqPrice(side, entry, lev) {
  return side === 1 ? (entry * (1 - 1 / lev)) / (1 - MMR) : (entry * (1 + 1 / lev)) / (1 + MMR);
}

function openPos(side, lev, px, dayIdx) {
  // 지갑 전액을 증거금으로: 수수료(명목가×FEE)를 선차감해 margin×lev×FEE + margin = wallet
  const margin = G.wallet / (1 + lev * FEE);
  const fee = G.wallet - margin;
  if (margin < 1) return;
  G.fees += fee;
  G.wallet = 0;
  G.pos = { side, lev, margin, qty: (margin * lev) / px, entry: px, liqPx: liqPrice(side, px, lev) };
  G.entries++;
  if (side === 1) G.longs++; else G.shorts++;
  G.maxLev = Math.max(G.maxLev, lev);
  G.trades.push({ day: dayIdx, k: side === 1 ? "L" : "S", px, lev });
}

function closePos(px, dayIdx) {
  if (!G.pos) return;
  const pnl = upnl(px);
  const exitFee = G.pos.qty * px * FEE;
  G.fees += exitFee;
  const net = G.pos.margin + pnl - exitFee;
  G.wallet += Math.max(0, net);
  G.closes++;
  if (net > G.pos.margin) G.wins++;
  G.trades.push({ day: dayIdx, k: "C", px });
  G.pos = null;
}

function liquidate(dayIdx) {
  // 격리마진 전액 소실 (전액 증거금이므로 = 파산)
  G.liqInfo = { day: dayIdx, lev: G.pos.lev };
  G.trades.push({ day: dayIdx, k: "X", px: G.pos.liqPx });
  G.pos = null;
  G.liq = true;
}

// 주문 실행 (act: long | short | close)
function execute(act, lev, px, dayIdx) {
  if (act === "close") { closePos(px, dayIdx); return; }
  const side = act === "long" ? 1 : -1;
  if (G.pos && G.pos.side === side) return; // 동일 방향 보유 중
  if (G.pos) { closePos(px, dayIdx); G.switches++; }
  openPos(side, lev, px, dayIdx);
}

// ── 주문 (재생 중 = 다음 봉 시가 체결 / 일시정지 중 = 현재 봉 종가 즉시 체결) ──
function order(act) {
  if (G.phase !== "playing") return;
  if (act === "close" && !G.pos) return toast(t("toastNoPos"));
  if (act !== "close" && G.pos && G.pos.side === (act === "long" ? 1 : -1))
    return toast(act === "long" ? t("toastAlreadyLong") : t("toastAlreadyShort"));
  if (G.paused) {
    execute(act, G.lev, G.chart.c[bar(G.day)], G.day);
    updateHud();
    drawGameChart();
    toast(t("toastFilled"));
    return;
  }
  G.pending.push({ act, lev: G.lev });
  toast(t("toastQueued"));
}

// ── 게임 루프 ──
function tick() {
  G.day++;
  const i = bar(G.day);
  const s = G.chart;

  for (const od of G.pending) execute(od.act, od.lev, s.o[i], G.day);
  G.pending = [];

  // 강제청산 체크: 봉의 저가(롱)/고가(숏)가 청산가를 건드리면 그 봉에서 사망
  if (G.pos) {
    const hit = G.pos.side === 1 ? s.l[i] <= G.pos.liqPx : s.h[i] >= G.pos.liqPx;
    if (hit) {
      liquidate(G.day);
      G.equityCurve.push(0);
      updateHud();
      drawGameChart();
      endGame();
      return;
    }
  }

  G.equityCurve.push(equityAt(s.c[i]));

  updateHud();
  drawGameChart();

  if (G.day >= N - 1) endGame();
}

function updateHud() {
  const i = bar(G.day);
  const px = G.chart.c[i];
  const equity = equityAt(px);
  const ret = equity / START_ASSET - 1;
  const remainH = ((N - 1 - G.day) * 5) / 60;
  $("#g-day").textContent = t("hudDay")(G.day + 1, N, remainH.toFixed(1));
  $("#g-equity").textContent = fmtMoney(equity);
  const r = $("#g-ret");
  r.textContent = pct(ret);
  r.className = ret >= 0 ? "plus" : "minus";

  // 포지션 패널 (청산가는 항상 노출 — 위험을 체감시키는 핵심 정보)
  const posEl = $("#g-pos");
  if (G.pos) {
    const sideName = G.pos.side === 1 ? t("side1") : t("sideN1");
    const liqDist = G.pos.liqPx / px - 1;
    posEl.className = "pos-panel " + (G.pos.side === 1 ? "long" : "short");
    posEl.innerHTML =
      `<b class="side-${G.pos.side === 1 ? "long" : "short"}">${G.pos.side === 1 ? "🔺" : "🔻"} ${sideName} ${G.pos.lev}x</b>` +
      ` ${t("posEntry")(fmtPx(G.pos.entry), fmtMoney(G.pos.margin))}<br>` +
      (G.pos.liqPx > 0.01
        ? `<span class="liq-info">${t("posLiqInfo")(fmtPx(G.pos.liqPx), pct(liqDist))}</span>`
        : `<span class="liq-info">${t("posNoLiq")}</span>`);
  } else {
    posEl.className = "pos-panel";
    posEl.textContent = t("noPos");
  }

  // 진입 버튼 라벨/상태 — 포지션 상태가 바뀔 때만 다시 그린다.
  // 매 틱 innerHTML을 갈아끼우면 누르는 도중 내부 노드가 교체되어 click이 씹힌다.
  const btnState = `${G.pos ? G.pos.side : 0}:${G.lev}`;
  if (btnState !== updateHud.lastBtnState) {
    updateHud.lastBtnState = btnState;
    const longBtn = $("#btn-long"), shortBtn = $("#btn-short");
    const mkLabel = (isLong) => {
      const side = isLong ? 1 : -1;
      const [held, entry, sw, hint] = isLong
        ? [t("longHeld"), t("longEntry"), t("longSwitch"), t("hintLong")]
        : [t("shortHeld"), t("shortEntry"), t("shortSwitch"), t("hintShort")];
      if (G.pos && G.pos.side === side) return `${held}<span class="sub-label">${t("hintOpposite")}</span>`;
      if (G.pos) return `${sw}<span class="sub-label">${t("hintFee")}</span>`;
      return `${entry}<span class="sub-label">${hint}</span>`;
    };
    longBtn.innerHTML = mkLabel(true);
    shortBtn.innerHTML = mkLabel(false);
    longBtn.disabled = !!(G.pos && G.pos.side === 1);
    shortBtn.disabled = !!(G.pos && G.pos.side === -1);
    $("#btn-close").disabled = !G.pos;

    // 레버리지는 포지션이 없을 때만 변경 가능
    document.querySelectorAll("#lev-row button").forEach((b) => {
      b.disabled = !!G.pos;
      b.classList.toggle("on", +b.dataset.lev === G.lev);
    });
  }

  // 보유 중엔 증거금 대비 손익(ROE) 크게 — 레버리지의 맛
  const big = $("#g-bigret");
  if (G.pos) {
    const roe = upnl(px) / G.pos.margin;
    big.classList.remove("hidden");
    big.className = "big-ret " + (roe >= 0 ? "plus" : "minus");
    big.querySelector("b").textContent = pct(roe);
  } else {
    big.classList.add("hidden");
  }
}

// ── 다국어 적용 ──
function applyLocale() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = t(el.dataset.i18n);
    if (v !== undefined) el.innerHTML = v;
  });
  if (MANIFEST) $("#f-data").textContent = t("footerData")(MANIFEST.updated);
  const langBtn = $("#btn-lang");
  if (langBtn) langBtn.textContent = LOCALE === "ko" ? "EN" : "KO";
  document.documentElement.lang = LOCALE;
  // 티어 chip (게임 중에도 즉시 반영)
  if (G.chart && G.phase !== "intro") {
    const tier = G.chart.tier;
    const tierName = LOCALE === "en" ? (TIER_EN[tier] || tier) : tier;
    $("#g-tier").textContent = `${TIER_EMOJI[tier] || "🪙"} ${tierName}`;
  }
  // 플레이 버튼 텍스트 (동적 상태)
  if (G.phase === "playing") {
    const btn = $("#btn-pause");
    if (btn && !btn.disabled) {
      if (!G.started) btn.textContent = t("btnPlayStart");
      else if (G.paused) btn.textContent = t("btnPlayResume");
      else btn.textContent = t("btnPlayPause");
    }
  }
}

function setLocale(lang) {
  LOCALE = lang;
  try { localStorage.setItem("lang", lang); } catch {}
  applyLocale();
  // 게임 중이면 동적 UI도 갱신
  if (G.phase === "playing" || G.phase === "preview") {
    updateHud();
    if (G.phase === "playing") drawGameChart();
  }
  if (G.phase === "done" && G.result) {
    renderResult();
    drawResultChart();
  }
}

// ── 초기화 ──
async function init() {
  MANIFEST = await (await fetch("data/manifest.json")).json();
  applyLocale();

  const p = new URLSearchParams(location.search);
  if (p.get("g")) {
    G.challenge = { g: p.get("g"), r: p.get("r") ? parseFloat(p.get("r")) : null };
    const b = $("#challenge-banner");
    b.classList.remove("hidden");
    b.innerHTML = G.challenge.r != null
      ? t("challengeArrived")(fmtMoney(G.challenge.r))
      : t("challengeArrivedNoScore");
  }

  renderDash();
  const langBtn = $("#btn-lang");
  if (langBtn) langBtn.onclick = () => setLocale(LOCALE === "ko" ? "en" : "ko");
  $("#btn-start").onclick = startGame;
  $("#btn-restart").onclick = async () => {
    const wasRunning = G.phase === "playing" && !G.paused && G.timer;
    if (wasRunning) { clearInterval(G.timer); G.timer = null; }
    const ok = await askConfirm(t("confirmRestart"), t("confirmOk"));
    if (ok) { startGame(); return; }
    if (wasRunning) { G.timer = setInterval(tick, 250 / G.speed); }
  };
  $("#btn-again").onclick = () => {
    G.challenge = null;
    history.replaceState(null, "", location.pathname);
    maybeInterstitial(startGame);
  };
  $("#btn-revenge").onclick = () => {
    if (ADS.rewardShowFn) ADS.rewardShowFn(); // 광고 시청 후 adViewed → 복수전
    else startRevenge(); // 광고 미가용(승인 전 등): 무료 복수전
  };
  initAds();
  $("#btn-card").onclick = saveCard;
  $("#btn-card-save").onclick = downloadCard;
  $("#btn-card-copy").onclick = copyCard;
  $("#btn-share-native").onclick = shareNative;
  $("#btn-card-close").onclick = closeCardModal;
  $("#card-modal").addEventListener("click", (e) => {
    if (e.target === $("#card-modal")) closeCardModal();
  });
  $("#btn-challenge").onclick = shareChallenge;
  document.querySelectorAll(".speed button").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll(".speed button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      G.speed = parseFloat(b.dataset.sp);
      if (G.timer) { clearInterval(G.timer); G.timer = setInterval(tick, 250 / G.speed); }
    };
  });
  document.querySelectorAll("#lev-row button").forEach((b) => {
    b.onclick = () => {
      if (G.pos) return toast(t("toastLevLocked"));
      G.lev = +b.dataset.lev;
      document.querySelectorAll("#lev-row button").forEach((x) => x.classList.toggle("on", x === b));
      if (G.lev >= 10) {
        const dist = 1 - (1 - 1 / G.lev) / (1 - MMR);
        toast(t("toastLevWarn")(G.lev, (dist * 100).toFixed(1)));
      }
    };
  });
  $("#btn-long").onclick = () => order("long");
  $("#btn-short").onclick = () => order("short");
  $("#btn-close").onclick = () => order("close");
  $("#btn-pause").onclick = togglePause;
  $("#btn-step").onclick = stepDay;
  $("#btn-copyurl").onclick = () => {
    const inp = $("#challenge-url");
    inp.focus(); inp.select();
    try { document.execCommand("copy"); challengeMsg(t("challengeCopied")); } catch {}
  };
}

function challengeMsg(text) {
  const m = $("#challenge-msg");
  m.textContent = text;
  m.classList.remove("hidden");
}

// 내부 확인 팝업 (window.confirm 대체) → Promise<boolean>
function askConfirm(msg, okLabel = "확인") {
  return new Promise((resolve) => {
    const modal = $("#confirm-modal"), ok = $("#confirm-ok"), cancel = $("#confirm-cancel");
    $("#confirm-msg").textContent = msg;
    ok.textContent = okLabel;
    modal.classList.remove("hidden");
    const done = (v) => {
      modal.classList.add("hidden");
      ok.onclick = cancel.onclick = modal.onclick = null;
      resolve(v);
    };
    ok.onclick = () => done(true);
    cancel.onclick = () => done(false);
    modal.onclick = (e) => { if (e.target === modal) done(false); };
  });
}

// 일시정지 중 한 봉씩 진행 (게임이 시작된 이후에만)
function stepDay() {
  if (G.phase !== "playing" || !G.paused || !G.started) return;
  tick();
}

function togglePause() {
  if (G.phase !== "playing") return;
  const btn = $("#btn-pause");
  // 최초 재생 = 선물 매매 시작
  if (!G.started) {
    G.started = true;
    G.paused = false;
    gaEvent("game_start", { challenge_mode: G.challenge ? "challenge" : "standard" });
    $("#start-hint").classList.add("hidden");
    btn.textContent = t("btnPlayPause");
    btn.className = "";
    $("#btn-step").disabled = true;
    G.timer = setInterval(tick, 250 / G.speed);
    return;
  }
  if (G.paused) {
    G.paused = false;
    btn.textContent = t("btnPlayPause");
    btn.classList.remove("paused");
    G.timer = setInterval(tick, 250 / G.speed);
  } else {
    G.paused = true;
    btn.textContent = t("btnPlayResume");
    btn.classList.add("paused");
    clearInterval(G.timer); G.timer = null;
  }
  $("#btn-step").disabled = !G.paused;
}

// ── 게임 시작 (사전 차트 공개 단계) ──
async function startGame() {
  clearInterval(G.timer); G.timer = null;
  clearInterval(G.previewTimer); G.previewTimer = null;

  let idx, start;
  if (REVENGE) {
    ({ idx, start } = REVENGE);
    REVENGE = null;
  } else if (G.challenge) {
    [idx, start] = G.challenge.g.split(".").map(Number);
  } else {
    idx = Math.floor(Math.random() * MANIFEST.charts.length);
  }
  const chart = await (await fetch(`data/${idx}.json`)).json();
  const minStart = PRE + 120; // 사전 구간 전체에서 120봉선까지 그려지도록
  const maxStart = chart.o.length - N - 1;
  if (start == null || isNaN(start) || start < minStart || start > maxStart) {
    start = minStart + Math.floor(Math.random() * (maxStart - minStart + 1));
  }

  Object.assign(G, {
    chart, chartIdx: idx, start, phase: "preview", paused: false, started: false,
    day: 0, wallet: START_ASSET, lev: 5, pos: null,
    pending: [], trades: [], equityCurve: [START_ASSET],
    fees: 0, entries: 0, longs: 0, shorts: 0, switches: 0,
    closes: 0, wins: 0, maxLev: 0, liq: false, liqInfo: null, result: null,
  });

  const tierName = LOCALE === "en" ? (TIER_EN[chart.tier] || chart.tier) : chart.tier;
  $("#g-tier").textContent = `${TIER_EMOJI[chart.tier] || "🪙"} ${tierName} · ${t("tierUnit")}`;
  $("#g-day").textContent = t("previewPhase");
  // 미리보기 단계에서도 본게임 UI를 그대로 노출 (버튼은 사전 차트 그리는 동안만 잠금)
  $("#play-ui").classList.remove("hidden");
  $("#start-hint").classList.remove("hidden");
  const pBtn = $("#btn-pause");
  pBtn.textContent = t("btnPlayLoading");
  pBtn.className = "start";
  pBtn.disabled = true;
  $("#btn-step").disabled = true;
  ["#btn-long", "#btn-short", "#btn-close"].forEach((s) => ($(s).disabled = true));
  updateHud.lastBtnState = null; // 버튼 강제 잠금 후엔 캐시를 비워 ready에서 반드시 다시 그리게
  show("scr-game");

  // 직전 20시간 차트 빠른 스윕 (약 1초)
  let k = 0;
  G.previewTimer = setInterval(() => {
    k = Math.min(k + 10, PRE);
    drawPreviewChart(k);
    if (k >= PRE) {
      clearInterval(G.previewTimer); G.previewTimer = null;
      enterReady();
    }
  }, 30);
}

// ── 사전 차트 완성 → 매매 가능한 일시정지 상태로 대기 ──
function enterReady() {
  G.phase = "playing"; // 매매 허용 (단, 시계는 멈춰 있음)
  G.paused = true;
  G.started = false;
  const pBtn = $("#btn-pause");
  pBtn.textContent = t("btnPlayStart");
  pBtn.className = "start";
  pBtn.disabled = false;
  $("#btn-step").disabled = true;
  drawGameChart(); // 첫 봉 공개
  updateHud();     // 진입 버튼 활성화
}

// ── 차트 공통 그리기 ──
// days: 표시할 window 인덱스 배열(음수 = 사전 구간)
// 옵션: markers 매매 마커 / totalSlots 가로축 고정 봉 수(빈 오른쪽 = 남은 시간)
//       mini 오버뷰 모드(라벨 생략) / showRemain 남은 봉 수 표시 / zoomWin [d0,d1] 확대 구간 하이라이트
function drawCandles(cv, days, { markers = true, totalSlots = null, mini = false, showRemain = false, zoomWin = null } = {}) {
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  const s = G.chart;
  const slots = totalSlots || days.length;

  let lo = Infinity, hi = -Infinity;
  for (const d of days) {
    lo = Math.min(lo, s.l[bar(d)]); hi = Math.max(hi, s.h[bar(d)]);
    for (const n of [20, 60, 120]) {
      const m = ma(bar(d), n);
      if (m != null) { lo = Math.min(lo, m); hi = Math.max(hi, m); }
    }
  }
  // 보유 중엔 진입가/청산가 라인도 스케일에 포함 (청산가가 화면 밖으로 너무 멀면 제외)
  if (!mini && G.pos) {
    const span0 = hi - lo;
    lo = Math.min(lo, G.pos.entry); hi = Math.max(hi, G.pos.entry);
    if (G.pos.liqPx > lo - span0 * 1.5 && G.pos.liqPx < hi + span0 * 1.5) {
      lo = Math.min(lo, G.pos.liqPx); hi = Math.max(hi, G.pos.liqPx);
    }
  }
  const padY = (hi - lo) * 0.08 || 1;
  lo -= padY; hi += padY;

  const padL = 8, padR = mini ? 10 : 64, padT = mini ? 8 : 26, padB = mini ? 12 : 10;
  const cw = (W - padL - padR) / slots;
  const x = (k) => padL + k * cw + cw / 2;
  const y = (v) => padT + (H - padT - padB) * (1 - (v - lo) / (hi - lo));

  // 확대 구간 하이라이트 (오버뷰)
  if (zoomWin) {
    const k0 = days.indexOf(zoomWin[0]), k1 = days.indexOf(zoomWin[1]);
    if (k0 >= 0 && k1 >= 0) {
      ctx.fillStyle = "#ffd84d14";
      ctx.fillRect(x(k0) - cw / 2, padT, x(k1) - x(k0) + cw, H - padT - padB);
      ctx.strokeStyle = "#ffd84d33"; ctx.lineWidth = 1;
      ctx.strokeRect(x(k0) - cw / 2, padT, x(k1) - x(k0) + cw, H - padT - padB);
    }
  }

  // 그리드
  ctx.strokeStyle = "#1e2447"; ctx.lineWidth = 1;
  for (let g = 1; g <= 3; g++) {
    const gy = padT + ((H - padT - padB) * g) / 4;
    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();
  }

  // 사전/게임 구간 경계선
  const zeroK = days.indexOf(0);
  if (zeroK > 0) {
    ctx.strokeStyle = "#ffd84d44"; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x(zeroK) - cw / 2, padT); ctx.lineTo(x(zeroK) - cw / 2, H - padB); ctx.stroke();
    ctx.setLineDash([]);
    if (mini) {
      ctx.fillStyle = "#ffd84d66"; ctx.font = "10px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(t("chartStart"), x(zeroK) + 3, padT + 9);
    }
  }

  // 진행 바 (오버뷰 하단)
  if (mini && totalSlots && G.phase === "playing") {
    const gx0 = zeroK >= 0 ? x(zeroK) - cw / 2 : padL;
    const gx1 = W - padR;
    const prog = (G.day + 1) / N;
    ctx.fillStyle = "#1e2447";
    ctx.fillRect(gx0, H - 7, gx1 - gx0, 4);
    ctx.fillStyle = "#ffd84d";
    ctx.fillRect(gx0, H - 7, (gx1 - gx0) * prog, 4);
  }

  // 남은 봉 수 (확대 차트 상단) — 축소 렌더링을 감안해 크게
  if (showRemain && G.phase === "playing") {
    ctx.save();
    ctx.font = "800 30px sans-serif"; ctx.textAlign = "right";
    ctx.shadowColor = "#0a0d18"; ctx.shadowBlur = 6;
    ctx.fillStyle = "#ffd84d";
    ctx.fillText(t("chartRemain")(N - 1 - G.day), W - 12, 34);
    ctx.restore();
  }

  // 캔들
  days.forEach((d, k) => {
    const i = bar(d);
    const up = s.c[i] >= s.o[i];
    ctx.strokeStyle = ctx.fillStyle = up ? "#ff4d4d" : "#4d7fff";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x(k), y(s.h[i])); ctx.lineTo(x(k), y(s.l[i])); ctx.stroke();
    const bodyTop = y(Math.max(s.o[i], s.c[i])), bodyBot = y(Math.min(s.o[i], s.c[i]));
    const bw = Math.max(cw * 0.64, 0.9);
    ctx.fillRect(x(k) - bw / 2, bodyTop, bw, Math.max(1, bodyBot - bodyTop));
  });

  // 이동평균선
  const drawMa = (n, color) => {
    ctx.beginPath();
    let started = false;
    days.forEach((d, k) => {
      const v = ma(bar(d), n);
      if (v == null) return;
      if (!started) { ctx.moveTo(x(k), y(v)); started = true; }
      else ctx.lineTo(x(k), y(v));
    });
    ctx.strokeStyle = color; ctx.lineWidth = mini ? 1 : 1.5; ctx.stroke();
  };
  drawMa(20, "#ffd84d");
  drawMa(60, "#b86bff");
  drawMa(120, "#2ec8a6");

  // 매매 마커 (L 롱진입 ▲ / S 숏진입 ▼ / C 종료 ✕ / X 청산 💀)
  if (markers) {
    ctx.textAlign = "center";
    for (const t of G.trades) {
      const k = days.indexOf(t.day);
      if (k < 0) continue;
      const i = bar(t.day);
      const sym = { L: "▲", S: "▼", C: "✕", X: "💀" }[t.k];
      const color = { L: "#ff4d4d", S: "#4d7fff", C: "#9aa3c8", X: "#ff7847" }[t.k];
      const below = t.k === "L" || t.k === "X"; // 아래쪽 표시
      const mx = x(k);
      const my = below ? y(s.l[i]) + (mini ? 9 : 20) : y(s.h[i]) - (mini ? 3 : 8);
      ctx.fillStyle = color;
      if (mini) {
        ctx.font = "9px sans-serif";
        ctx.fillText(sym, mx, my);
      } else {
        ctx.save();
        ctx.font = "900 19px sans-serif";
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillText(sym, mx, my);
        ctx.shadowBlur = 0;
        if (t.k === "L" || t.k === "S") {
          ctx.strokeStyle = "#ffffffcc"; ctx.lineWidth = 1;
          ctx.strokeText(sym, mx, my);
        }
        ctx.restore();
      }
    }
  }

  // 현재가 라벨 + 진입가/청산가 라인 (확대 차트만)
  if (!mini) {
    const lastD = days[days.length - 1];
    const cur = s.c[bar(lastD)];
    ctx.fillStyle = "#ffd84d"; ctx.font = "700 13px sans-serif"; ctx.textAlign = "left";
    ctx.fillText(fmtPx(cur), W - padR + 6, y(cur) + 4);
    ctx.strokeStyle = "#ffd84d33";
    ctx.beginPath(); ctx.moveTo(padL, y(cur)); ctx.lineTo(W - padR, y(cur)); ctx.stroke();

    if (G.pos) {
      const lineWithBadge = (v, color, label) => {
        const yy = y(v);
        if (yy < padT - 8 || yy > H - padB + 8) return;
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([7, 5]);
        ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();
        ctx.setLineDash([]); ctx.lineWidth = 1;
        // 캔버스(1080px)가 화면에선 절반 이하로 축소되므로 라벨은 크게
        ctx.font = "800 24px sans-serif"; ctx.textAlign = "left";
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = "#0a0d18e6";
        ctx.fillRect(padL + 2, yy - 32, tw + 16, 32);
        ctx.fillStyle = color;
        ctx.fillText(label, padL + 10, yy - 8);
      };
      lineWithBadge(G.pos.entry, "#ffffffdd", t("chartEntry")(fmtPx(G.pos.entry)));
      if (G.pos.liqPx > 0.01) lineWithBadge(G.pos.liqPx, "#ff7847", t("chartLiq")(fmtPx(G.pos.liqPx)));
    }
  }
}

// 사전 20시간 + 게임 20시간 = 고정축
const TOTAL_SLOTS = PRE + N;
const ZOOM = 60; // 확대 차트에 보여줄 최근 봉 수

// 듀얼뷰: 위 = 전체 오버뷰, 아래 = 최근 60봉 확대
function drawDual(endDay, { sweep = false } = {}) {
  const full = [];
  for (let d = -PRE; d <= endDay; d++) full.push(d);
  if (full.length < 2) return;
  const zoom = full.slice(-ZOOM);
  drawCandles($("#g-chart-full"), full, {
    markers: !sweep, totalSlots: TOTAL_SLOTS, mini: true,
    zoomWin: [zoom[0], zoom[zoom.length - 1]],
  });
  drawCandles($("#g-chart"), zoom, { markers: !sweep, showRemain: true });
}

// 사전 구간 스윕 (진행도 k)
function drawPreviewChart(k) {
  drawDual(-PRE + k - 1, { sweep: true });
}

// 플레이 중
function drawGameChart() {
  drawDual(G.day);
}

// ── 종료 ──
function endGame() {
  clearInterval(G.timer); G.timer = null;
  G.phase = "done";
  const s = G.chart;
  const lastC = s.c[bar(N - 1)];

  if (G.pos) closePos(lastC, G.day); // 잔여 포지션 자동 정산

  const equity = G.liq ? 0 : G.wallet;
  const myRet = equity / START_ASSET - 1;
  const startPx = s.o[bar(0)];
  const bhRet = lastC / startPx - 1; // 현물(1배) 존버
  const alpha = myRet - bhRet;

  // 교육용 벤치마크: 게임 시작과 동시에 10배 롱 존버였다면?
  const liq10 = liqPrice(1, startPx, 10);
  let lev10Liq = false;
  for (let d = 0; d < N; d++) if (s.l[bar(d)] <= liq10) { lev10Liq = true; break; }

  let peak = -Infinity, mdd = 0;
  for (const v of G.equityCurve) {
    peak = Math.max(peak, v);
    mdd = Math.max(mdd, 1 - v / peak);
  }

  const grade =
    G.liq ? "💀" :
    G.entries === 0 ? "?" :
    alpha >= 0.60 ? "SSS" : alpha >= 0.40 ? "SS" : alpha >= 0.25 ? "S" :
    alpha >= 0.12 ? "A" : alpha >= 0.04 ? "B" :
    alpha > -0.04 ? "C" : alpha > -0.20 ? "D" : "F";

  G.result = {
    equity, myRet, bhRet, alpha, mdd, grade,
    nTrades: G.entries, winRate: G.closes ? G.wins / G.closes : null,
    fees: G.fees, maxLev: G.maxLev, lev10Liq,
    lev10Ret: lev10Liq ? null : bhRet * 10,
  };

  ADS.gamesFinished++;
  gaEvent("game_complete", {
    grade,
    liquidated: G.liq,
    return_pct: Number((myRet * 100).toFixed(2)),
    benchmark_return_pct: Number((bhRet * 100).toFixed(2)),
    alpha_pct: Number((alpha * 100).toFixed(2)),
    trade_count: G.entries,
    max_leverage: G.maxLev,
  });
  saveHistory();
  renderResult();
}

function gradeComment(r) {
  if (r.grade === "💀") {
    const li = G.liqInfo;
    return t("gradeLiqComment")(li ? li.lev : null, li ? li.day + 1 : null);
  }
  if (r.myRet > 0 && (r.grade === "D" || r.grade === "F")) {
    return t("gradePosProfit")(pct(r.myRet), pct(r.bhRet));
  }
  if (r.myRet > 0 && r.grade === "C") {
    return t("gradeProfitC")(pct(r.bhRet));
  }
  return t("gradeComment")[r.grade][r.myRet < 0 ? 1 : 0];
}

function behaviorTag() {
  const r = G.result;
  if (G.liq && G.liqInfo) return t("behaviorLiq")(G.liqInfo.lev, G.liqInfo.day + 1);
  if (r.nTrades === 0) return t("behaviorNoEntry");
  if (r.maxLev >= 50) return t("behavior50x");
  if (r.maxLev >= 10) return t("behaviorHighLev")(r.maxLev);
  if (G.switches >= 8) return t("behaviorPingpong")(G.switches, fmtMoney(r.fees));
  if (r.nTrades >= 25) return t("behaviorOvertrading")(r.nTrades);
  if (r.winRate != null && r.winRate >= 0.6 && G.closes >= 3) return t("behaviorWinRate")((r.winRate * 100).toFixed(0));
  return t("behaviorSummary")(r.nTrades, r.maxLev);
}

function renderResult() {
  const s = G.chart, r = G.result;
  show("scr-result");
  $("#challenge-msg").classList.add("hidden");
  $("#challenge-copy").classList.add("hidden");
  $("#btn-challenge").innerHTML = t("btnChallenge");

  $("#r-name").textContent = `${TIER_EMOJI[s.tier] || "🪙"} ${s.name} (${s.t.replace("USDT", "")}/USDT)`;
  $("#r-period").textContent = `${s.era} · ${fmtKST(barTime(0))} ~ ${fmtKST(barTime(N - 1), false)} (KST)`;
  $("#r-grade").textContent = r.grade;
  document.querySelector(".grade-box").classList.toggle("liq", r.grade === "💀");
  $("#r-comment").innerHTML = gradeComment(r) + '<br><span class="r-behavior">' + behaviorTag() + "</span>";

  const row = (label, html, me) =>
    `<div class="row${me ? " me" : ""}"><span>${label}</span><b>${html}</b></div>`;
  const retHtml = (v) => `<span class="${v >= 0 ? "plus" : "minus"}">${pct(v)}</span>`;
  // 청산 판은 이후 시세를 못 본 상태 — 벤치마크 수익률도 숨겨 복수전의 공정성을 지킨다
  $("#r-vs").innerHTML = G.liq
    ? row(t("vsMyFuturesFull")(fmtMoney(r.equity)), `<span class="liq-mark">${t("liqMark")}</span>`, true) +
      row(t("vsSpot"), `<span class="liq-mark">${t("vsLiqAfter")}</span>`) +
      row(t("vs10x"), `<span class="liq-mark">${t("vs10xAfter")}</span>`)
    : row(t("vsMyFuturesFull")(fmtMoney(r.equity)), retHtml(r.myRet), true) +
      row(t("vsSpot"), retHtml(r.bhRet)) +
      row(t("vs10x"), r.lev10Liq ? `<span class="liq-mark">${t("vs10xLiqLabel")}</span>` : retHtml(r.lev10Ret));

  const winTxt = r.winRate == null ? "-" : (r.winRate * 100).toFixed(0) + "%";
  $("#r-stats").innerHTML = `
    <div class="stat"><span>${t("statTrades")}</span><b>${t("statTradesVal")(r.nTrades)}</b></div>
    <div class="stat"><span>${t("statWinRate")}</span><b>${winTxt}</b></div>
    <div class="stat"><span>${t("statMdd")}</span><b>-${(r.mdd * 100).toFixed(1)}%</b></div>
    <div class="stat"><span>${t("statFees")}</span><b>${fmtMoney(r.fees)}</b></div>
    <div class="stat"><span>${t("statMaxLev")}</span><b>${r.maxLev ? t("statMaxLevVal")(r.maxLev) : "-"}</b></div>
    <div class="stat"><span>${t("statLongShort")}</span><b>${G.longs} : ${G.shorts}</b></div>`;

  const cEl = $("#r-challenge");
  if (G.challenge && G.challenge.r != null) {
    const mine = r.equity, theirs = G.challenge.r;
    cEl.classList.remove("hidden");
    cEl.innerHTML = mine > theirs
      ? t("challengeWin")(fmtMoney(mine), fmtMoney(theirs))
      : mine < theirs
      ? t("challengeLose")(fmtMoney(mine), fmtMoney(theirs))
      : t("challengeTie")(fmtMoney(mine));
  } else cEl.classList.add("hidden");

  // 손실/청산으로 끝났으면 복수전 리워드 광고 기회 제공
  if (G.liq || r.myRet < 0) plantRevengeAd();
  else $("#btn-revenge").classList.add("hidden");

  drawResultChart();
}

// 결과 곡선(코인 가격 vs 내 자산) — 화면/카드 공용.
// 청산으로 일찍 끝난 판은 청산 시점 이후를 미공개 처리 — 같은 차트 복수전의 공정성을 지킨다.
function paintResultCurves(ctx, ox, oy, w, h, big = false) {
  const s = G.chart;
  const endIdx = G.liq && G.liqInfo ? G.liqInfo.day : N - 1;
  const closes = [];
  for (let d = 0; d <= endIdx; d++) closes.push(s.c[bar(d)]);
  const eq = G.equityCurve.map((v) => (v / START_ASSET) * s.o[bar(0)]);
  let lo = Math.min(Math.min(...closes), Math.min(...eq));
  let hi = Math.max(Math.max(...closes), Math.max(...eq));
  const span = (hi - lo) || 1;
  lo -= span * 0.08; hi += span * 0.08;
  const pad = big ? 24 : 14;
  const x = (d) => ox + pad + (d / (N - 1)) * (w - pad * 2);
  const y = (v) => oy + pad + (h - pad * 2) * (1 - (v - lo) / (hi - lo));

  // 청산 이후 구간: 가림막 + 안내 (실제로 보지 못한 구간)
  if (endIdx < N - 1) {
    const hx = x(endIdx);
    ctx.fillStyle = "#0a0d18";
    ctx.fillRect(hx, oy + 2, ox + w - hx - 2, h - 4);
    ctx.strokeStyle = "#ff784755"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(hx, oy + pad); ctx.lineTo(hx, oy + h - pad); ctx.stroke();
    ctx.setLineDash([]);
    // 가림 구간이 텍스트를 담기에 충분히 넓을 때만 안내 문구 표시
    const zoneW = ox + w - hx;
    if (zoneW > (big ? 300 : 150)) {
      ctx.fillStyle = "#7b86ad"; ctx.textAlign = "center";
      ctx.font = `${big ? 56 : 28}px sans-serif`;
      ctx.fillText("❓", (hx + ox + w) / 2, oy + h / 2 - (big ? 26 : 14));
      ctx.font = `700 ${big ? 32 : 17}px sans-serif`;
      ctx.fillText(big ? t("hiddenLabelBig") : t("hiddenLabel1"), (hx + ox + w) / 2, oy + h / 2 + (big ? 30 : 14));
      if (!big) ctx.fillText(t("hiddenLabel2"), (hx + ox + w) / 2, oy + h / 2 + 34);
    }
  }

  ctx.beginPath();
  closes.forEach((v, d) => (d ? ctx.lineTo(x(d), y(v)) : ctx.moveTo(x(d), y(v))));
  ctx.strokeStyle = "#8b93b8"; ctx.lineWidth = big ? 2.5 : 2; ctx.stroke();

  ctx.beginPath();
  eq.forEach((v, d) => (d ? ctx.lineTo(x(d), y(v)) : ctx.moveTo(x(d), y(v))));
  ctx.strokeStyle = "#ffd84d"; ctx.lineWidth = big ? 3.5 : 2.5; ctx.stroke();

  ctx.font = `${big ? 19 : 13}px sans-serif`; ctx.textAlign = "center";
  for (const t of G.trades) {
    const sym = { L: "▲", S: "▼", C: "✕", X: "💀" }[t.k];
    ctx.fillStyle = { L: "#ff4d4d", S: "#4d7fff", C: "#9aa3c8", X: "#ff7847" }[t.k];
    const below = t.k === "L" || t.k === "X";
    const off = below ? (big ? 24 : 16) : (big ? -12 : -8);
    ctx.fillText(sym, x(t.day), y(closes[t.day]) + off);
  }

  ctx.textAlign = "left"; ctx.font = `${big ? 20 : 12}px sans-serif`;
  ctx.fillStyle = "#8b93b8"; ctx.fillText(t("chartPriceLine"), ox + pad + 4, oy + (big ? 30 : 18));
  ctx.fillStyle = "#ffd84d"; ctx.fillText(t("chartAssetLine"), ox + pad + (big ? 160 : 90), oy + (big ? 30 : 18));
}

function drawResultChart() {
  const cv = $("#r-chart"), ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, cv.width, cv.height);
  paintResultCurves(ctx, 0, 0, cv.width, cv.height, false);
}

// ── 기록 (localStorage) ──
function saveHistory() {
  try {
    const h = JSON.parse(localStorage.getItem("cf_history") || "[]");
    h.unshift({
      ts: Date.now(), name: G.chart.name, t: G.chart.t, era: G.chart.era,
      ret: G.result.myRet, bh: G.result.bhRet, grade: G.result.grade, liq: G.liq,
    });
    localStorage.setItem("cf_history", JSON.stringify(h.slice(0, 50)));
  } catch {}
}

function renderDash() {
  let h = [];
  try { h = JSON.parse(localStorage.getItem("cf_history") || "[]"); } catch {}
  if (!h.length) return;
  const dash = $("#dash");
  dash.classList.remove("hidden");
  const beats = h.filter((x) => x.ret > x.bh).length;
  const liqs = h.filter((x) => x.liq).length;
  const order = ["SSS", "SS", "S", "A", "B", "C", "D", "F", "💀"];
  const best = order.find((g) => h.some((x) => x.grade === g)) || "-";
  dash.innerHTML = `
    <h3>${t("dashTitle")}</h3>
    <div class="sum">
      <span>${t("dashGames")} <b>${h.length}</b></span>
      <span>${t("dashBeats")} <b>${((beats / h.length) * 100).toFixed(0)}%</b></span>
      <span>${t("dashLiqs")} <b>${liqs}</b></span>
      <span>${t("dashBest")} <b>${best}</b></span>
    </div>
    ${h.slice(0, 5).map((x) =>
      `<div class="hist"><span>${x.grade === "💀" ? t("dashLiqLabel") : t("dashGradeEntry")(x.grade)} · ${x.name}</span><span>${t("dashRowSuffix")(x.liq ? "-100%" : pct(x.ret), x.liq ? "❓" : pct(x.bh))}</span></div>`
    ).join("")}`;
}

// ── 공유 ──
function challengeUrl() {
  return `${location.origin}${location.pathname}?g=${G.chartIdx}.${G.start}&r=${Math.round(G.result.equity)}`;
}

async function shareChallenge() {
  const r = G.result;
  const text = G.liq
    ? t("shareTextLiq")
    : t("shareText")(r.grade, pct(r.myRet), pct(r.bhRet));
  const url = challengeUrl();
  const btn = $("#btn-challenge");
  const COPIED = t("challengeCopied");
  try {
    await navigator.clipboard.writeText(text + "\n" + url);
    btn.innerHTML = COPIED;
    gaEvent("challenge_copy", { grade: r.grade });
    return;
  } catch {}
  const box = $("#challenge-copy");
  box.classList.remove("hidden");
  const inp = $("#challenge-url");
  inp.value = url;
  inp.focus(); inp.select();
  try {
    document.execCommand("copy");
    btn.innerHTML = COPIED;
    gaEvent("challenge_copy", { grade: r.grade });
  } catch {
    challengeMsg(t("challengeManual"));
  }
}

function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(" ");
  let line = "", yy = y;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy); line = w; yy += lh;
    } else line = test;
  }
  ctx.fillText(line, x, yy);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function saveCard() {
  const r = G.result, s = G.chart;
  const cv = $("#card-canvas"), ctx = cv.getContext("2d");
  const W = 1080, H = 1480;
  cv.width = W; cv.height = H;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#131830"); bg.addColorStop(1, "#0a0d18");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd84d"; ctx.font = "700 36px Pretendard, sans-serif";
  ctx.fillText(t("cardTitle"), W / 2, 90);

  // 등급 배지
  const liq = r.grade === "💀";
  ctx.strokeStyle = liq ? "#ff7847" : "#ffd84d"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(W / 2, 250, 118, 0, Math.PI * 2); ctx.stroke();
  const gradeFontSize = r.grade.length >= 3 ? 105 : r.grade.length === 2 ? 130 : 150;
  ctx.fillStyle = liq ? "#ff7847" : "#ffd84d"; ctx.font = `900 ${gradeFontSize}px Pretendard, sans-serif`;
  ctx.fillText(r.grade, W / 2, 303);

  // 코인 공개
  ctx.fillStyle = "#eef1ff"; ctx.font = "700 46px Pretendard, sans-serif";
  ctx.fillText(`${s.name} (${s.t.replace("USDT", "")}) ${t("cardPeriodLabel")}`, W / 2, 452);
  ctx.fillStyle = "#8b93b8"; ctx.font = "400 32px Pretendard, sans-serif";
  ctx.fillText(`${s.era} · ${fmtKST(barTime(0))} ~ ${fmtKST(barTime(N - 1), false)} (KST)`, W / 2, 506);

  ctx.font = "700 50px Pretendard, sans-serif";
  if (liq) {
    ctx.fillStyle = "#ff7847";
    ctx.fillText(t("cardLiqLine"), W / 2, 592);
  } else {
    ctx.fillStyle = r.myRet >= 0 ? "#ff4d4d" : "#4d7fff";
    ctx.fillText(t("cardMyLine")(pct(r.myRet), fmtMoney(r.equity)), W / 2, 592);
  }
  ctx.fillStyle = "#8b93b8"; ctx.font = "400 38px Pretendard, sans-serif";
  ctx.fillText(liq ? t("cardLiqSpotHidden") : t("cardSpotLine")(pct(r.bhRet)), W / 2, 646);

  // 코멘트
  ctx.fillStyle = "#ffd84d"; ctx.font = "400 32px Pretendard, sans-serif";
  wrapText(ctx, gradeComment(r), W / 2, 714, W - 130, 44);

  // 매매 마커가 찍힌 차트 (코인 가격 vs 내 자산)
  const cx = 70, cy = 800, cwd = W - 140, chh = 420;
  ctx.fillStyle = "#0f1430";
  roundRect(ctx, cx, cy, cwd, chh, 18); ctx.fill();
  paintResultCurves(ctx, cx, cy, cwd, chh, true);

  // 통계
  ctx.textAlign = "center"; ctx.fillStyle = "#8b93b8"; ctx.font = "400 30px Pretendard, sans-serif";
  const winTxt = r.winRate == null ? "-" : (r.winRate * 100).toFixed(0) + "%";
  ctx.fillText(t("cardStats")(r.nTrades, winTxt, (r.mdd * 100).toFixed(1), r.maxLev || "-"), W / 2, 1300);

  if (G.challenge && G.challenge.r != null) {
    const win = r.equity > G.challenge.r;
    ctx.fillStyle = win ? "#ff4d4d" : "#4d7fff";
    ctx.font = "700 34px Pretendard, sans-serif";
    ctx.fillText(win ? t("cardChallengeWin")(fmtMoney(G.challenge.r)) : t("cardChallengeWith")(fmtMoney(G.challenge.r)), W / 2, 1360);
  }

  ctx.fillStyle = "#4a5278"; ctx.font = "400 26px Pretendard, sans-serif";
  ctx.fillText(t("cardFootnote"), W / 2, 1430);

  const blob = await new Promise((res) => cv.toBlob(res, "image/png"));
  openCardModal(blob);
}

// ── 결과 카드 팝업 (시스템 창 대신 내부 팝업) ──
let CARD_BLOB = null, CARD_URL = null;

function cardModalMsg(text) {
  $("#card-modal-msg").textContent = text || "";
}

function openCardModal(blob) {
  CARD_BLOB = blob;
  if (CARD_URL) URL.revokeObjectURL(CARD_URL);
  CARD_URL = URL.createObjectURL(blob);
  $("#card-preview").src = CARD_URL;
  cardModalMsg("");
  $("#card-modal").classList.remove("hidden");
}

function closeCardModal() {
  $("#card-modal").classList.add("hidden");
}

function downloadCard() {
  if (!CARD_BLOB) return;
  const a = document.createElement("a");
  a.href = CARD_URL;
  a.download = t("cardFilename");
  a.click();
  gaEvent("card_save", { grade: G.result?.grade || "unknown" });
  cardModalMsg(t("cardSaved"));
}

async function shareNative() {
  const r = G.result;
  if (!r) return;
  const url = location.origin + location.pathname;
  const liq = r.grade === "💀";
  const text = liq ? t("shareTextLiq") : t("shareText")(r.grade, pct(r.myRet), pct(r.bhRet));
  try {
    if (navigator.share) {
      const shareData = { text, url };
      if (CARD_BLOB && navigator.canShare) {
        const file = new File([CARD_BLOB], t("cardFilename"), { type: "image/png" });
        if (navigator.canShare({ files: [file] })) shareData.files = [file];
      }
      await navigator.share(shareData);
      gaEvent("card_share", { platform: "native", grade: r.grade });
      return;
    }
  } catch (e) {
    if (e.name === "AbortError") return; // 유저가 취소
  }
  // 데스크탑 폴백: 텍스트+링크 클립보드 복사
  try {
    await navigator.clipboard.writeText(text + "\n" + url);
    cardModalMsg(t("shareNativeFallback"));
  } catch {
    cardModalMsg(t("shareNativeFail"));
  }
  gaEvent("card_share", { platform: "clipboard_fallback", grade: r.grade });
}

async function copyCard() {
  if (!CARD_BLOB) return;
  try {
    if (!navigator.clipboard || !window.ClipboardItem) throw new Error("unsupported");
    await navigator.clipboard.write([new ClipboardItem({ "image/png": CARD_BLOB })]);
    gaEvent("card_copy", { grade: G.result?.grade || "unknown" });
    cardModalMsg(t("cardCopied"));
  } catch {
    cardModalMsg(t("cardCopyFail"));
  }
}

init().catch(() => {
  document.body.innerHTML = "<p style='padding:40px;text-align:center'>데이터를 불러오지 못했어요 😢</p>";
});
