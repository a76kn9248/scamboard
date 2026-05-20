// Direction C — Hybrid: Reddit bones + MySpace soul (dark)
// Karma-arrow gutter, sort tabs, subscammer chips, sticker threat badges,
// user profileColor bleeds into card accents and user chips.
// Warm near-black, not the cold pure-black.

function HybridHome() {
  const css = `
    .hy-root { font-family: "Geist", "Inter", -apple-system, sans-serif; color: #ece6df; background: #14100f; font-size: 13px; }
    .hy-root, .hy-root * { box-sizing: border-box; }
    .hy-mono { font-family: "JetBrains Mono", "SF Mono", ui-monospace, monospace; }
    .hy-display { font-family: Tahoma, Verdana, sans-serif; letter-spacing: -0.01em; }

    .hy-nav { background: #1a1413; border-bottom: 1px solid #2c211f; padding: 10px 22px;
      display: flex; align-items: center; gap: 22px; position: relative; }
    .hy-logo { display: flex; align-items: baseline; gap: 8px; }
    .hy-logo .sk { color: #ff3b6c; font-size: 22px; }
    .hy-logo .wm { font-family: Tahoma, sans-serif; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #f5e7d8; }
    .hy-logo .wm .red { color: #ff3b6c; }
    .hy-tag { color: #8a7d72; font-size: 11px; font-style: italic; }
    .hy-nav .links { display: flex; gap: 18px; margin-left: 14px; }
    .hy-nav .links a { color: #c4b8aa; text-decoration: none; font-size: 13px; }
    .hy-nav .links a.cur { color: #ff3b6c; }
    .hy-search { margin-left: auto; background: #14100f; border: 1px solid #2c211f; border-radius: 6px;
      padding: 6px 10px; color: #c4b8aa; font: inherit; font-size: 12px; width: 320px; display: flex; align-items: center; gap: 8px; }
    .hy-search input { background: transparent; border: 0; outline: 0; color: inherit; font: inherit; flex: 1; }
    .hy-user-chip { background: #1f1817; border: 1px solid #ff3b9a44; padding: 5px 10px; border-radius: 6px;
      display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .hy-user-chip .dot { width: 8px; height: 8px; border-radius: 50%; background: #ff3b9a; box-shadow: 0 0 8px #ff3b9a; }

    .hy-subbar { background: #1a1413; border-bottom: 1px solid #2c211f; padding: 6px 22px;
      display: flex; gap: 6px; overflow-x: auto; }
    .hy-chip { background: #14100f; border: 1px solid #2c211f; border-radius: 999px; padding: 4px 12px;
      font-size: 11px; color: #c4b8aa; cursor: pointer; white-space: nowrap; }
    .hy-chip.cur { background: #ff3b6c; color: #fff; border-color: #ff3b6c; }
    .hy-chip:hover { border-color: #5a4540; }

    .hy-page { display: grid; grid-template-columns: 56px 1fr 320px; gap: 18px; padding: 20px 22px; max-width: 1280px; margin: 0 auto; }

    /* Left rail — quick actions */
    .hy-rail { display: flex; flex-direction: column; gap: 8px; }
    .hy-rail .btn { width: 56px; height: 56px; border-radius: 10px; background: #1a1413; border: 1px solid #2c211f;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
      cursor: pointer; color: #c4b8aa; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
    .hy-rail .btn.cta { background: linear-gradient(180deg,#ff3b6c,#c11a4c); color: #fff; border-color: #ff3b6c; box-shadow: 0 0 20px rgba(255,59,108,0.3); }
    .hy-rail .btn .ico { font-size: 18px; line-height: 1; }
    .hy-rail .btn:hover { border-color: #5a4540; }

    /* Hero strip */
    .hy-hero { display: flex; gap: 12px; margin-bottom: 16px; }
    .hy-hero .stat { flex: 1; background: linear-gradient(180deg,#1f1817,#1a1413); border: 1px solid #2c211f;
      border-radius: 10px; padding: 12px 14px; }
    .hy-hero .stat .lbl { color: #8a7d72; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; }
    .hy-hero .stat .val { font-family: Tahoma, sans-serif; font-size: 22px; font-weight: 900; margin-top: 4px; letter-spacing: -0.5px; }
    .hy-hero .stat.red .val { color: #ff3b6c; }
    .hy-hero .stat.green .val { color: #6ce28a; }
    .hy-hero .stat.gold .val { color: #ffc547; }
    .hy-hero .stat.cyan .val { color: #5cd0e2; }

    /* Top 8 wanted strip */
    .hy-section-h { display: flex; align-items: baseline; gap: 10px; margin: 4px 0 10px; }
    .hy-section-h .t { font-family: Tahoma, sans-serif; font-size: 17px; font-weight: 900; letter-spacing: -0.3px; color: #f5e7d8; }
    .hy-section-h .s { color: #8a7d72; font-size: 11px; }
    .hy-section-h .more { margin-left: auto; color: #8a7d72; font-size: 11px; cursor: pointer; }
    .hy-section-h .more:hover { color: #ff3b6c; }

    .hy-top8 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px; }
    .hy-wanted { background: #1a1413; border: 1px solid #2c211f; border-radius: 10px; padding: 12px;
      position: relative; overflow: hidden; cursor: pointer; transition: transform .15s, border-color .15s; }
    .hy-wanted:hover { transform: translateY(-2px); border-color: #5a4540; }
    .hy-wanted .accent { position: absolute; inset: 0 auto 0 0; width: 4px; }
    .hy-wanted .rank { font-family: Tahoma, sans-serif; font-size: 28px; font-weight: 900; line-height: 1; color: #ff3b6c; letter-spacing: -1px; }
    .hy-wanted.r1 .rank { color: #ffc547; }
    .hy-wanted.r2 .rank { color: #d0c8c0; }
    .hy-wanted.r3 .rank { color: #c98c52; }
    .hy-wanted .id { font-family: "JetBrains Mono", monospace; font-size: 12px; color: #ece6df; margin-top: 8px; }
    .hy-wanted .typ { font-size: 9px; text-transform: uppercase; color: #8a7d72; letter-spacing: 0.5px; }
    .hy-wanted .roast { color: #ffc547; font-style: italic; font-size: 11px; margin-top: 6px; line-height: 1.3; min-height: 28px; }
    .hy-wanted .foot { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; font-size: 11px; }
    .hy-wanted .conf { color: #ff3b6c; font-weight: bold; }

    /* Sort + post list */
    .hy-sort { display: flex; gap: 4px; margin-bottom: 10px; align-items: center; }
    .hy-sort .s { padding: 5px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; color: #8a7d72; }
    .hy-sort .s.cur { background: #2c211f; color: #f5e7d8; }
    .hy-sort .s:hover { color: #f5e7d8; }
    .hy-sort .view { margin-left: auto; font-size: 11px; color: #8a7d72; }

    .hy-post { background: #1a1413; border: 1px solid #2c211f; border-radius: 10px;
      display: grid; grid-template-columns: 48px 1fr; gap: 0; margin-bottom: 8px; position: relative; overflow: hidden; }
    .hy-post:hover { border-color: #3a2c29; }
    .hy-post .accent { position: absolute; inset: 0 auto 0 0; width: 3px; }
    .hy-post .gutter { background: #14100f; padding: 8px 0; display: flex; flex-direction: column;
      align-items: center; gap: 2px; border-right: 1px solid #2c211f; }
    .hy-arrow { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      border-radius: 4px; cursor: pointer; color: #5a4540; }
    .hy-arrow:hover { background: #2c211f; }
    .hy-arrow.voted-up { color: #ff3b6c; }
    .hy-arrow.voted-down { color: #5cd0e2; }
    .hy-arrow svg { display: block; }
    .hy-score { font-family: Tahoma, sans-serif; font-weight: 900; font-size: 13px; color: #f5e7d8; }
    .hy-score.up { color: #ff3b6c; }
    .hy-gutter-rank { font-family: Tahoma, sans-serif; font-size: 10px; color: #8a7d72; margin-top: 6px; font-weight: bold; }

    .hy-post-body { padding: 12px 14px; }
    .hy-post-head { display: flex; gap: 6px; align-items: center; font-size: 11px; color: #8a7d72; margin-bottom: 6px; flex-wrap: wrap; }
    .hy-sub { font-family: Tahoma, sans-serif; font-weight: bold; color: #c4b8aa; text-decoration: none; }
    .hy-sub:hover { color: #ff3b6c; }
    .hy-dot { color: #5a4540; }

    .hy-title { font-family: Tahoma, sans-serif; font-size: 17px; font-weight: 900; letter-spacing: -0.3px; color: #f5e7d8;
      display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; line-height: 1.2; }
    .hy-title .id { font-family: "JetBrains Mono", monospace; font-size: 14px; color: #ece6df; font-weight: 600; letter-spacing: 0; }
    .hy-title .dash { color: #5a4540; }
    .hy-title .roast { color: #ffc547; font-style: italic; font-family: "Tahoma", sans-serif; font-weight: 600; }
    .hy-reason { color: #c4b8aa; margin-top: 6px; line-height: 1.5; font-size: 12.5px; }
    .hy-meta { display: flex; gap: 12px; align-items: center; margin-top: 10px; font-size: 11px; color: #8a7d72; flex-wrap: wrap; }
    .hy-meta a, .hy-meta span.act { color: #8a7d72; cursor: pointer; }
    .hy-meta a:hover, .hy-meta span.act:hover { color: #f5e7d8; }
    .hy-author { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 999px;
      font-size: 11px; font-weight: bold; }
    .hy-author .moodot { width: 6px; height: 6px; border-radius: 50%; }

    /* Threat sticker badges — MySpace energy in a dark frame */
    .hy-sticker { display: inline-flex; align-items: center; gap: 4px;
      font-family: Tahoma, sans-serif; font-size: 10px; font-weight: 900; padding: 2px 8px;
      border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px; border: 1.5px solid currentColor;
      transform: rotate(-2deg); }
    .hy-sticker.LEGENDARY { color: #ff3b6c; background: #2c1418; border-color: #ff3b6c; box-shadow: 0 0 12px rgba(255,59,108,0.4); animation: hy-wiggle 1.8s ease-in-out infinite; }
    .hy-sticker.EXTREME { color: #ff7a3a; background: #2a1810; }
    .hy-sticker.HIGH { color: #ffc547; background: #2a2010; }
    .hy-sticker.MEDIUM { color: #6ce28a; background: #102a1c; }
    .hy-sticker.LOW { color: #5cd0e2; background: #0e2228; }
    @keyframes hy-wiggle { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(0deg); } }

    .hy-flair { font-size: 9.5px; font-weight: 900; padding: 1px 7px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.4px; }
    .hy-flair.deployer { background: #2a1a3a; color: #b58aff; }
    .hy-flair.twitter { background: #1a2638; color: #6cb3ff; }
    .hy-flair.bounty { background: #2a2010; color: #ffc547; }

    /* Sidebar */
    .hy-side { display: flex; flex-direction: column; gap: 16px; }
    .hy-card { background: linear-gradient(180deg,#1a1413,#161110); border: 1px solid #2c211f; border-radius: 10px; overflow: hidden; }
    .hy-card-h { padding: 10px 14px; border-bottom: 1px solid #2c211f; display: flex; align-items: center; gap: 8px;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 12px; color: #f5e7d8; letter-spacing: -0.2px; }
    .hy-card-h .live { width: 6px; height: 6px; border-radius: 50%; background: #6ce28a; box-shadow: 0 0 8px #6ce28a; animation: pulse-dot 1.5s ease-in-out infinite; }
    @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    .hy-card-b { padding: 12px 14px; font-size: 12px; }

    .hy-profile-banner { height: 56px;
      background:
        radial-gradient(circle at 20% 30%, #ff3b9a55 0%, transparent 40%),
        radial-gradient(circle at 80% 60%, #5cd0e255 0%, transparent 40%),
        linear-gradient(135deg,#ff3b6c33, #7c5cff33); }
    .hy-profile-row { padding: 14px; display: flex; align-items: center; gap: 12px; margin-top: -32px; }
    .hy-profile-av { width: 56px; height: 56px; border-radius: 50%; border: 3px solid #1a1413;
      background: #ff3b9a; color: #fff; display: flex; align-items: center; justify-content: center;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 24px; }
    .hy-profile-info .n { font-family: Tahoma, sans-serif; font-weight: 900; color: #f5e7d8; font-size: 14px; }
    .hy-profile-info .t { color: #ff3b9a; font-size: 11px; font-weight: bold; }
    .hy-xp-bar { height: 6px; background: #2c211f; border-radius: 99px; overflow: hidden; margin: 10px 14px; }
    .hy-xp-fill { height: 100%; background: linear-gradient(90deg,#6ce28a,#5cd0e2); width: 64%; }
    .hy-profile-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; padding: 0 14px 12px; text-align: center; }
    .hy-profile-stats .v { font-family: Tahoma, sans-serif; font-weight: 900; font-size: 16px; color: #f5e7d8; }
    .hy-profile-stats .l { font-size: 9px; color: #8a7d72; text-transform: uppercase; letter-spacing: 0.5px; }
    .hy-profile-mood { padding: 8px 14px; border-top: 1px dashed #2c211f; font-size: 11px; color: #c4b8aa; font-style: italic; }
    .hy-profile-mood b { color: #ff3b9a; font-style: normal; }

    .hy-feedrow { display: flex; align-items: baseline; gap: 6px; padding: 6px 0; border-bottom: 1px dashed #2c211f; font-size: 11.5px; line-height: 1.4; }
    .hy-feedrow:last-child { border-bottom: 0; }
    .hy-feedrow .who { font-weight: bold; flex: 0 0 auto; }
    .hy-feedrow .what { color: #8a7d72; }
    .hy-feedrow .tg { font-family: "JetBrains Mono", monospace; font-size: 10px; color: #c4b8aa; }
    .hy-feedrow .ago { margin-left: auto; color: #5a4540; font-size: 10px; flex: 0 0 auto; }

    .hy-watch-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px dashed #2c211f; }
    .hy-watch-row:last-child { border-bottom: 0; }
    .hy-watch-row .av { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: Tahoma, sans-serif; font-weight: 900; font-size: 12px; color: #fff; }
    .hy-watch-row .n { font-weight: bold; font-size: 12px; color: #f5e7d8; line-height: 1.2; }
    .hy-watch-row .t { font-size: 10px; color: #8a7d72; }
    .hy-watch-row .xp { margin-left: auto; font-family: Tahoma, sans-serif; font-weight: 900; font-size: 12px; color: #ffc547; }

    .hy-roast-card { padding: 18px; text-align: center; background:
      radial-gradient(circle at center, #ffc54718, transparent 60%); }
    .hy-roast-card .quote { font-family: Tahoma, sans-serif; font-style: italic; color: #ffc547; font-size: 18px; font-weight: 900; letter-spacing: -0.3px; line-height: 1.2; }
    .hy-roast-card .by { color: #8a7d72; font-size: 11px; margin-top: 8px; }
  `;

  const me = TOP_USERS[0];

  return (
    <div className="hy-root">
      <style>{css}</style>
      <div className="hy-nav">
        <div className="hy-logo">
          <span className="sk">☠</span>
          <span className="wm">scam<span className="red">board</span></span>
          <span className="hy-tag">— a community-verified wall of shame</span>
        </div>
        <div className="links">
          <a className="cur">Feed</a>
          <a>Hall of Infamy</a>
          <a>Watchdogs</a>
          <a>Bounties</a>
        </div>
        <div className="hy-search">
          <span style={{ color: '#5a4540' }}>⌕</span>
          <input defaultValue="paste a wallet, contract, or @handle" />
          <span style={{ color: '#5a4540', fontSize: 10 }}>⌘K</span>
        </div>
        <div className="hy-user-chip" style={{ borderColor: me.color + '66' }}>
          <span className="dot" style={{ background: me.color, boxShadow: `0 0 8px ${me.color}` }}></span>
          <span style={{ color: me.color, fontWeight: 'bold' }}>@{me.nick}</span>
          <span style={{ color: '#8a7d72' }}>·</span>
          <span style={{ color: '#ffc547', fontWeight: 'bold' }}>{me.xp.toLocaleString()}</span>
          <span style={{ color: '#8a7d72', fontSize: 10 }}>XP</span>
        </div>
      </div>

      <div className="hy-subbar">
        <span className="hy-chip cur">r/all</span>
        <span className="hy-chip">r/rugpulls · 1.2k</span>
        <span className="hy-chip">r/honeypots · 482</span>
        <span className="hy-chip">r/twitterscams · 891</span>
        <span className="hy-chip">r/alphafrauds · 214</span>
        <span className="hy-chip">r/bridgehacks · 67</span>
        <span className="hy-chip">r/discord_scams · 309</span>
        <span className="hy-chip">r/under_investigation · 41</span>
        <span className="hy-chip" style={{ color: '#5a4540' }}>+ new</span>
      </div>

      <div className="hy-page">
        {/* Left rail */}
        <div className="hy-rail">
          <div className="hy-btn-wrap">
            <div className="btn cta">
              <span className="ico">🚩</span>
              <span>Report</span>
            </div>
          </div>
          <div className="btn"><span className="ico">💰</span><span>Bounty</span></div>
          <div className="btn"><span className="ico">🔥</span><span>Roast</span></div>
          <div className="btn"><span className="ico">📡</span><span>Watch</span></div>
          <div className="btn"><span className="ico">⌥</span><span>Tools</span></div>
        </div>

        {/* Main */}
        <div>
          <div className="hy-hero">
            <div className="stat red"><div className="lbl">Scammers logged</div><div className="val">2,847</div></div>
            <div className="stat gold"><div className="lbl">Confirms / 24h</div><div className="val">193</div></div>
            <div className="stat green"><div className="lbl">LP saved (est.)</div><div className="val">$4.2M</div></div>
            <div className="stat cyan"><div className="lbl">Active watchdogs</div><div className="val">418</div></div>
          </div>

          <div className="hy-section-h">
            <span className="t">🚨 Top 8 Most Wanted</span>
            <span className="s">refreshed every confirm</span>
            <span className="more">see all 2,847 →</span>
          </div>
          <div className="hy-top8">
            {REPORTS.slice(0,8).map((r,i)=>{
              const t = THREAT_STYLE[r.threat];
              return (
                <div className={`hy-wanted r${r.rank<=3 ? r.rank : ''}`} key={r.id}>
                  <div className="accent" style={{ background: t.color, boxShadow: `0 0 16px ${t.color}66` }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="rank">#{r.rank}</div>
                    <span className={`hy-sticker ${r.threat}`}>{t.fire || '·'} {t.label}</span>
                  </div>
                  <div className="id">{shortId(r.identifier, r.type)}</div>
                  <div className="typ">{r.type} · {r.chain}</div>
                  {r.roastTitle && <div className="roast">"{r.roastTitle}"</div>}
                  {!r.roastTitle && <div className="roast" style={{ color: '#5a4540' }}>— no roast yet —</div>}
                  <div className="foot">
                    <span className="conf">{t.fire || '·'} {r.confirmCount}</span>
                    <span style={{ color: '#8a7d72' }}>💬 {r.commentCount}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hy-section-h">
            <span className="t">📋 All reports</span>
            <span className="s">filtered: r/all · 24h</span>
          </div>

          <div className="hy-sort">
            <span className="s cur">🔥 Hot</span>
            <span className="s">🆕 New</span>
            <span className="s">⬆ Top confirmed</span>
            <span className="s">😈 Controversial</span>
            <span className="s">💀 Most roasted</span>
            <span className="s">💰 Recently bountied</span>
            <span className="view">density: <u>compact</u> · card</span>
          </div>

          {REPORTS.slice(0,6).map(r=>{
            const t = THREAT_STYLE[r.threat];
            const author = TOP_USERS.find(u=>u.nick===r.authorNickname) || { mood: 'unknown', color: r.authorColor };
            return (
              <div className="hy-post" key={r.id}>
                <div className="accent" style={{ background: r.authorColor, boxShadow: `0 0 12px ${r.authorColor}88` }}></div>
                <div className="gutter">
                  <div className={`hy-arrow ${r.rank<=3?'voted-up':''}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 4 L16 12 H12 V16 H8 V12 H4 Z" fill="currentColor"/></svg>
                  </div>
                  <div className={`hy-score ${r.rank<=3?'up':''}`}>{r.confirmCount}</div>
                  <div className="hy-arrow">
                    <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 16 L4 8 H8 V4 H12 V8 H16 Z" fill="currentColor"/></svg>
                  </div>
                  <div className="hy-gutter-rank">#{r.rank}</div>
                </div>
                <div className="hy-post-body">
                  <div className="hy-post-head">
                    <a className="hy-sub">r/{r.type==='twitter' ? 'twitterscams' : (r.threat==='LEGENDARY'||r.threat==='EXTREME') ? 'rugpulls' : 'honeypots'}</a>
                    <span className="hy-dot">·</span>
                    <span>posted {r.createdAt} by</span>
                    <span className="hy-author" style={{ background: r.authorColor + '22', color: r.authorColor, border: `1px solid ${r.authorColor}44` }}>
                      <span className="moodot" style={{ background: r.authorColor }}></span>
                      @{r.authorNickname}
                      <span style={{ opacity: 0.7, fontWeight: 'normal' }}>· {r.authorTitle}</span>
                    </span>
                    <span className="hy-dot">·</span>
                    <span>chain {r.chain}</span>
                    <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      <span className={`hy-flair ${r.type}`}>{r.type}</span>
                      <span className={`hy-sticker ${r.threat}`}>{t.fire || '·'} {t.label}</span>
                      {r.bountyCount>0 && <span className="hy-flair bounty">💰 {r.bountyCount}</span>}
                    </span>
                  </div>
                  <div className="hy-title">
                    <span className="id">{r.identifier.length>20 ? r.identifier.slice(0,12)+'…'+r.identifier.slice(-8) : r.identifier.startsWith('0x')?r.identifier:'@'+r.identifier}</span>
                    {r.roastTitle && <><span className="dash">—</span><span className="roast">"{r.roastTitle}"</span></>}
                  </div>
                  <div className="hy-reason">{r.reason}</div>
                  <div className="hy-meta">
                    <a>💬 {r.commentCount} comments</a>
                    <a>📎 evidence (3)</a>
                    <a>💰 add bounty</a>
                    <a>🔥 roast it</a>
                    <a>🔗 linked wallets (4)</a>
                    <a>↗ share</a>
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ textAlign: 'center', marginTop: 14, padding: 12, color: '#8a7d72', fontSize: 12 }}>
            <span style={{ cursor: 'pointer' }}>← prev</span>
            <span style={{ margin: '0 14px' }}>page <b style={{ color: '#f5e7d8' }}>1</b> of 142</span>
            <span style={{ cursor: 'pointer', color: '#ff3b6c' }}>next →</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hy-side">
          {/* My profile MySpace-style */}
          <div className="hy-card" style={{ borderColor: me.color + '55' }}>
            <div className="hy-profile-banner" style={{
              background: `radial-gradient(circle at 25% 30%, ${me.color}66 0%, transparent 45%), radial-gradient(circle at 80% 70%, #5cd0e266 0%, transparent 50%), linear-gradient(135deg, ${me.color}22, #14100f)`
            }}></div>
            <div className="hy-profile-row">
              <div className="hy-profile-av" style={{ background: me.color, color: '#fff' }}>{me.nick[0].toUpperCase()}</div>
              <div className="hy-profile-info">
                <div className="n">@{me.nick}</div>
                <div className="t" style={{ color: me.color }}>{me.title}</div>
              </div>
            </div>
            <div className="hy-xp-bar"><div className="hy-xp-fill"></div></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 14px', fontSize: 10, color: '#8a7d72', marginTop: -6, marginBottom: 8 }}>
              <span>{me.xp.toLocaleString()} XP</span><span>next: Sentinel (5,000)</span>
            </div>
            <div className="hy-profile-stats">
              <div><div className="v" style={{ color: '#ff3b6c' }}>{me.reports}</div><div className="l">reports</div></div>
              <div><div className="v" style={{ color: '#ffc547' }}>1,204</div><div className="l">confirms</div></div>
              <div><div className="v" style={{ color: '#6ce28a' }}>17</div><div className="l">roasts won</div></div>
            </div>
            <div className="hy-profile-mood">
              <b>current mood:</b> {me.mood} 🗡 &nbsp; · &nbsp; <b>online:</b> now
            </div>
          </div>

          {/* Top 8 friends MySpace-style */}
          <div className="hy-card">
            <div className="hy-card-h">⭐ My Top 8 Watchdogs <span style={{ marginLeft: 'auto', color: '#8a7d72', fontWeight: 'normal', fontSize: 10 }}>edit</span></div>
            <div className="hy-card-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: 12 }}>
              {TOP_USERS.slice(0,8).map(u=>(
                <div key={u.nick} style={{ textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: u.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tahoma', fontWeight: 900, fontSize: 18, margin: '0 auto', boxShadow: `0 0 12px ${u.color}55` }}>{u.nick[0].toUpperCase()}</div>
                  <div style={{ fontSize: 9.5, color: '#c4b8aa', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{u.nick.split('.')[0]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live feed */}
          <div className="hy-card">
            <div className="hy-card-h"><span className="live"></span> Live feed</div>
            <div className="hy-card-b">
              {LIVE_FEED.map((f,i)=>(
                <div className="hy-feedrow" key={i}>
                  <span className="who" style={{ color: f.color }}>@{f.who.split('.')[0]}</span>
                  <span className="what">{f.what}</span>
                  <span className="tg">{f.target}</span>
                  <span className="ago">{f.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top watchdogs */}
          <div className="hy-card">
            <div className="hy-card-h">🛡 Top watchdogs · this week</div>
            <div className="hy-card-b">
              {TOP_USERS.slice(0,5).map((u,i)=>(
                <div key={u.nick} className="hy-watch-row">
                  <span style={{ color: '#8a7d72', fontFamily: 'Tahoma', fontWeight: 900, width: 14 }}>{i+1}</span>
                  <div className="av" style={{ background: u.color }}>{u.nick[0].toUpperCase()}</div>
                  <div>
                    <div className="n" style={{ color: u.color }}>@{u.nick}</div>
                    <div className="t">{u.title} · mood: <i>{u.mood}</i></div>
                  </div>
                  <div className="xp">{u.xp.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hy-card">
            <div className="hy-card-h">✨ Roast of the week</div>
            <div className="hy-roast-card">
              <div className="quote">"Schrödinger's Locked LP"</div>
              <div className="by">by <span style={{ color: '#7c5cff' }}>@etherdetective</span> · on 0x77ab…e211 · 412 ⭐</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.HybridHome = HybridHome;
