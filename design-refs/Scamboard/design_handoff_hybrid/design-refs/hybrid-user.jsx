// Hybrid direction — user profile page (the MySpace-iest page).
// User's chosen profileColor washes the page; mood widget, top-8 allies,
// theme-song slot, customizable bio block, achievement stickers.

function HybridUser() {
  const u = TOP_USERS[0]; // rugslayer.eth
  const color = u.color;

  const css = `
    .up-root { font-family: "Geist", "Inter", -apple-system, sans-serif; color: #ece6df; background: #14100f; font-size: 13px; --usercolor: ${color}; }
    .up-root, .up-root * { box-sizing: border-box; }
    .up-mono { font-family: "JetBrains Mono", "SF Mono", monospace; }

    .up-nav { background: #1a1413; border-bottom: 1px solid #2c211f; padding: 10px 22px; display: flex; align-items: center; gap: 14px; font-size: 12px; color: #8a7d72; }
    .up-nav a { color: var(--usercolor); text-decoration: none; }

    /* Banner — uses user's color */
    .up-banner { height: 220px; position: relative; overflow: hidden;
      background:
        radial-gradient(circle at 15% 20%, ${color}66 0%, transparent 50%),
        radial-gradient(circle at 85% 80%, #ffc54744 0%, transparent 45%),
        repeating-linear-gradient(45deg, #1a1413 0 14px, #14100f 14px 28px); }
    .up-banner::after { content: ''; position: absolute; inset: 0;
      background: linear-gradient(180deg, transparent 60%, #14100f); }
    .up-banner-deco { position: absolute; top: 30px; right: 40px;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 140px; line-height: 1; color: ${color}11; letter-spacing: -6px; transform: rotate(-6deg); }

    .up-page { max-width: 1280px; margin: -90px auto 0; padding: 0 22px 32px; position: relative; z-index: 1;
      display: grid; grid-template-columns: 280px 1fr; gap: 22px; align-items: flex-start; }

    /* Identity card (left) */
    .up-id { background: linear-gradient(180deg, #1a1413, #14100f); border: 2px solid ${color}; border-radius: 12px; overflow: hidden;
      box-shadow: 0 0 30px ${color}33; }
    .up-id-top { padding: 22px 18px 14px; text-align: center; }
    .up-avatar { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto;
      background: ${color}; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 56px;
      border: 3px solid #14100f; box-shadow: 0 0 0 3px ${color}, 0 0 40px ${color}99; }
    .up-name { font-family: Tahoma, sans-serif; font-weight: 900; font-size: 22px; margin-top: 12px; color: #f5e7d8; letter-spacing: -0.3px; }
    .up-handle { color: ${color}; font-size: 12px; margin-top: 2px; font-weight: bold; }
    .up-title-row { margin-top: 10px; }
    .up-title { display: inline-block; background: ${color}22; color: ${color}; border: 1px solid ${color}66; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .up-online { color: #6ce28a; font-size: 10px; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 5px; }
    .up-online .dot { width: 6px; height: 6px; border-radius: 50%; background: #6ce28a; box-shadow: 0 0 6px #6ce28a; animation: up-pulse 1.5s ease-in-out infinite; }
    @keyframes up-pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }

    .up-actions { display: flex; gap: 6px; padding: 0 14px 14px; }
    .up-actions button { flex: 1; padding: 7px 8px; background: #14100f; border: 1px solid #2c211f; color: #c4b8aa; border-radius: 6px; font: inherit; font-size: 11px; cursor: pointer; font-weight: bold; }
    .up-actions button.primary { background: linear-gradient(180deg, ${color}, ${color}cc); border-color: ${color}; color: #fff; }

    .up-mood-block { padding: 12px 14px; border-top: 1px dashed #2c211f; }
    .up-mood-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; color: #c4b8aa; }
    .up-mood-row .k { color: #8a7d72; }
    .up-mood-row .v { color: #f5e7d8; font-weight: bold; }

    .up-themesong { padding: 12px 14px; border-top: 1px dashed #2c211f; background:
      repeating-linear-gradient(0deg, #1a1413 0 2px, #14100f 2px 4px); }
    .up-themesong .lbl { font-size: 10px; color: ${color}; text-transform: uppercase; letter-spacing: 0.8px; font-weight: bold; }
    .up-themesong .player { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
    .up-themesong .play { width: 28px; height: 28px; border-radius: 50%; background: ${color}; color: #fff; display: flex; align-items: center; justify-content: center; flex: 0 0 auto; font-size: 12px; cursor: pointer; }
    .up-themesong .meta { font-size: 11px; color: #c4b8aa; }
    .up-themesong .meta .tt { color: #f5e7d8; font-weight: bold; }
    .up-themesong .bars { display: flex; gap: 2px; align-items: flex-end; height: 14px; margin-left: auto; }
    .up-themesong .bars span { display: block; width: 2px; background: ${color}; }
    .up-themesong .bars span:nth-child(1){height:30%;}
    .up-themesong .bars span:nth-child(2){height:70%;}
    .up-themesong .bars span:nth-child(3){height:100%;}
    .up-themesong .bars span:nth-child(4){height:50%;}
    .up-themesong .bars span:nth-child(5){height:80%;}

    .up-stickers { padding: 12px 14px; border-top: 1px dashed #2c211f; display: flex; flex-wrap: wrap; gap: 6px; }
    .up-sticker { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; font-family: Tahoma, sans-serif; font-weight: 900; font-size: 9.5px; border-radius: 4px; border: 1.5px solid currentColor; text-transform: uppercase; letter-spacing: 0.4px; transform: rotate(-2deg); }
    .up-sticker:nth-child(2n) { transform: rotate(1deg); }
    .up-sticker.gold { color: #ffc547; background: #2a2010; }
    .up-sticker.red { color: #ff3b6c; background: #2c1418; }
    .up-sticker.green { color: #6ce28a; background: #102a1c; }
    .up-sticker.purple { color: #b58aff; background: #1f1430; }

    /* Right column */
    .up-right { display: flex; flex-direction: column; gap: 16px; }
    .up-tabs { background: #1a1413; border: 1px solid #2c211f; border-radius: 10px; padding: 6px; display: flex; gap: 4px; }
    .up-tab { padding: 7px 14px; border-radius: 6px; cursor: pointer; color: #8a7d72; font-size: 12px; font-weight: bold; }
    .up-tab.cur { background: ${color}22; color: ${color}; }
    .up-tab:hover { color: #f5e7d8; }

    /* About / bio block — looks user-styled, MySpace HTML-ish */
    .up-bio { background: linear-gradient(180deg, ${color}11, #1a1413); border: 1px solid ${color}55; border-radius: 12px; padding: 22px 24px; color: #ece6df; }
    .up-bio h2 { font-family: Tahoma, sans-serif; font-weight: 900; color: ${color}; margin: 0 0 8px; letter-spacing: -0.3px; font-size: 18px; }
    .up-bio h2 em { font-style: italic; color: #ffc547; }
    .up-bio p { margin: 0 0 10px; line-height: 1.55; color: #ece6df; }
    .up-bio p:last-child { margin: 0; }
    .up-bio .signoff { color: ${color}; font-family: 'Courier New', monospace; font-weight: bold; margin-top: 14px; }

    /* Stat cards */
    .up-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .up-stat { background: #1a1413; border: 1px solid #2c211f; border-radius: 10px; padding: 14px; }
    .up-stat .v { font-family: Tahoma, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -1px; line-height: 1; }
    .up-stat .l { color: #8a7d72; font-size: 10px; text-transform: uppercase; letter-spacing: 0.7px; margin-top: 6px; }
    .up-stat .delta { font-size: 10px; color: #6ce28a; margin-top: 4px; }

    .up-xp-block { background: linear-gradient(180deg,#1a1413,#161110); border: 1px solid #2c211f; border-radius: 10px; padding: 14px 16px; }
    .up-xp-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 12px; }
    .up-xp-row .cur { color: ${color}; font-weight: bold; }
    .up-xp-row .next { color: #8a7d72; }
    .up-xp-bar { height: 10px; background: #14100f; border-radius: 99px; margin-top: 8px; overflow: hidden; border: 1px solid #2c211f; }
    .up-xp-fill { height: 100%; background: linear-gradient(90deg, ${color}, #ffc547); width: 64%; }
    .up-xp-foot { display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; color: #8a7d72; }

    /* Top 8 watchdogs (allies) */
    .up-card { background: linear-gradient(180deg,#1a1413,#161110); border: 1px solid #2c211f; border-radius: 10px; overflow: hidden; }
    .up-card-h { padding: 12px 16px; border-bottom: 1px solid #2c211f; display: flex; align-items: center; gap: 8px;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 13px; color: #f5e7d8; }
    .up-card-h .edit { margin-left: auto; color: ${color}; font-size: 11px; font-weight: normal; cursor: pointer; }
    .up-top8 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 16px; }
    .up-friend { text-align: center; cursor: pointer; }
    .up-friend .av { width: 64px; height: 64px; border-radius: 12px; margin: 0 auto; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 26px; border: 2px solid #1a1413;
      transition: transform .15s; }
    .up-friend:hover .av { transform: rotate(-3deg) scale(1.05); }
    .up-friend .n { font-size: 11px; color: #f5e7d8; margin-top: 6px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .up-friend .t { font-size: 9.5px; color: #8a7d72; }
    .up-friend .mood { font-size: 9px; color: #ffc547; font-style: italic; margin-top: 1px; }

    /* Recent reports */
    .up-rep-row { display: grid; grid-template-columns: 36px 1fr auto; gap: 12px; padding: 10px 16px; border-bottom: 1px dashed #2c211f; align-items: center; }
    .up-rep-row:last-child { border-bottom: 0; }
    .up-rep-row:hover { background: rgba(255,255,255,0.02); cursor: pointer; }
    .up-rep-row .rnk { font-family: Tahoma, sans-serif; font-weight: 900; font-size: 18px; color: #8a7d72; line-height: 1; }
    .up-rep-row .id { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #f5e7d8; }
    .up-rep-row .ro { font-style: italic; color: #ffc547; font-size: 11px; }
    .up-rep-row .meta { font-size: 10px; color: #8a7d72; margin-top: 2px; }
    .up-rep-row .conf { font-family: Tahoma, sans-serif; font-weight: 900; color: #ff3b6c; font-size: 14px; }

    /* Wall (comments people leave on user's profile) */
    .up-wall-input { padding: 14px 16px; display: flex; gap: 10px; align-items: flex-start; border-bottom: 1px solid #2c211f; }
    .up-wall-input .av { width: 32px; height: 32px; border-radius: 50%; background: ${color}; color: #fff; display: flex; align-items: center; justify-content: center; font-family: Tahoma, sans-serif; font-weight: 900; font-size: 14px; }
    .up-wall-input .field { flex: 1; background: #14100f; border: 1px solid #2c211f; border-radius: 6px; padding: 8px 12px; color: #8a7d72; font-size: 12px; }
    .up-wall-row { padding: 12px 16px; border-bottom: 1px dashed #2c211f; display: grid; grid-template-columns: 32px 1fr; gap: 10px; }
    .up-wall-row:last-child { border-bottom: 0; }
    .up-wall-row .av { width: 32px; height: 32px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-family: Tahoma, sans-serif; font-weight: 900; font-size: 14px; }
    .up-wall-row .h { font-size: 11px; margin-bottom: 4px; }
    .up-wall-row .body { color: #ece6df; font-size: 12.5px; line-height: 1.5; }
    .up-wall-row .when { color: #8a7d72; font-size: 10px; margin-top: 4px; }
  `;

  const stickers = [
    { c: 'gold', t: '🥇 Top hunter, Q1' },
    { c: 'red', t: '💀 Caught a legendary' },
    { c: 'gold', t: '🎯 100% confirm rate' },
    { c: 'green', t: '🔥 14-day streak' },
    { c: 'purple', t: '✨ Roast champion · 17×' },
    { c: 'red', t: '🛡 Saved $400k (est.)' },
    { c: 'gold', t: '👁 First to spot · 8×' },
    { c: 'green', t: '🧬 Pattern detector' },
  ];

  const walls = [
    { u: 'etherdetective', c: '#7c5cff', t: 'Watchdog', body: 'absolute work on the JEETCOIN trail. you saved my degenerate ass — would have aped that one for sure.', when: '38m ago' },
    { u: 'soliditysnitch', c: '#34d399', t: 'Code Auditor', body: 'send the wallet cluster export when you have a sec, want to cross-ref with my honeypot dataset.', when: '2h ago' },
    { u: 'groupchatgremlin', c: '#fb923c', t: 'Fresh Degen', body: 'how do you even spot these so fast 😭 teach me sensei', when: '5h ago' },
  ];

  return (
    <div className="up-root">
      <style>{css}</style>
      <div className="up-nav">
        <a>← back to feed</a>
        <span style={{ color: '#5a4540' }}>/</span>
        <span style={{ color: '#c4b8aa' }}>watchdogs</span>
        <span style={{ color: '#5a4540' }}>/</span>
        <span style={{ color: '#f5e7d8' }}>@{u.nick}</span>
        <span style={{ marginLeft: 'auto', color: '#8a7d72' }}>this profile is themed by its owner ·  <a>change skin</a></span>
      </div>

      <div className="up-banner">
        <div className="up-banner-deco">RUGSLAYER</div>
      </div>

      <div className="up-page">
        {/* Left column — identity */}
        <div className="up-id">
          <div className="up-id-top">
            <div className="up-avatar">{u.nick[0].toUpperCase()}</div>
            <div className="up-name">{u.nick}</div>
            <div className="up-handle">@{u.nick}</div>
            <div className="up-title-row">
              <span className="up-title">{u.title}</span>
            </div>
            <div className="up-online"><span className="dot"></span> online · last seen 2m ago</div>
          </div>
          <div className="up-actions">
            <button className="primary">+ watch</button>
            <button>message</button>
            <button>★</button>
          </div>
          <div className="up-mood-block">
            <div className="up-mood-row"><span className="k">mood</span><span className="v" style={{ color: color }}>vengeful 🗡</span></div>
            <div className="up-mood-row"><span className="k">currently</span><span className="v">tracing tornado outflows</span></div>
            <div className="up-mood-row"><span className="k">specialty</span><span className="v">LP migration patterns</span></div>
            <div className="up-mood-row"><span className="k">chain main</span><span className="v">SOL · ETH</span></div>
            <div className="up-mood-row"><span className="k">member since</span><span className="v">Aug 2025</span></div>
          </div>
          <div className="up-themesong">
            <div className="lbl">▶ profile theme song</div>
            <div className="player">
              <div className="play">▶</div>
              <div className="meta">
                <div className="tt">a wallet draining .wav</div>
                <div style={{ color: '#8a7d72' }}>2:14 · pinned</div>
              </div>
              <div className="bars"><span></span><span></span><span></span><span></span><span></span></div>
            </div>
          </div>
          <div className="up-stickers">
            {stickers.map((s,i)=>(
              <span key={i} className={`up-sticker ${s.c}`}>{s.t}</span>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="up-right">
          <div className="up-tabs">
            <span className="up-tab cur">📋 About</span>
            <span className="up-tab">📊 Stats</span>
            <span className="up-tab">🎯 Reports · 31</span>
            <span className="up-tab">💬 Wall · 142</span>
            <span className="up-tab">🏆 Roasts · 17</span>
            <span className="up-tab">⚙ Customize</span>
          </div>

          <div className="up-bio">
            <h2>About me, <em>I guess.</em></h2>
            <p>5 years on-chain. Lost 14 SOL to a stealth-LP migration in 2022 and decided "never again, and never to anyone else either."</p>
            <p>I run a pattern matcher on every new deploy on SOL and ETH. If you've got a wallet that looks suspicious, send it — I'll either tell you it's clean or it'll be on the front page by morning.</p>
            <p>Not a financial advisor. Definitely not your friend if you rug. The blockchain is forever and so is my memory.</p>
            <div className="signoff">— rugslayer.eth · est. 2022 · ☠</div>
          </div>

          <div className="up-stat-grid">
            <div className="up-stat"><div className="v" style={{ color: '#ff3b6c' }}>31</div><div className="l">reports</div><div className="delta">+3 this week</div></div>
            <div className="up-stat"><div className="v" style={{ color: '#ffc547' }}>1,204</div><div className="l">confirms</div><div className="delta">+88 this week</div></div>
            <div className="up-stat"><div className="v" style={{ color: '#6ce28a' }}>17</div><div className="l">roasts won</div><div className="delta">+1 this week</div></div>
            <div className="up-stat"><div className="v" style={{ color: '#5cd0e2' }}>98%</div><div className="l">confirm rate</div><div className="delta" style={{ color: '#8a7d72' }}>top 1%</div></div>
          </div>

          <div className="up-xp-block">
            <div className="up-xp-row">
              <span className="cur">⛏ {u.title} · {u.xp.toLocaleString()} XP</span>
              <span className="next">→ Sentinel (5,000 XP)</span>
            </div>
            <div className="up-xp-bar"><div className="up-xp-fill"></div></div>
            <div className="up-xp-foot"><span>180 XP to next tier</span><span>+62 today</span></div>
          </div>

          {/* Top 8 watchdogs (MySpace's Top 8 reborn) */}
          <div className="up-card">
            <div className="up-card-h">⭐ rugslayer's Top 8 Watchdogs <span className="edit">edit ordering</span></div>
            <div className="up-top8">
              {TOP_USERS.slice(1, 9).map(f=>(
                <div className="up-friend" key={f.nick}>
                  <div className="av" style={{ background: f.color, boxShadow: `0 0 16px ${f.color}55` }}>{f.nick[0].toUpperCase()}</div>
                  <div className="n" style={{ color: f.color }}>@{f.nick.split('.')[0]}</div>
                  <div className="t">{f.title}</div>
                  <div className="mood">"{f.mood}"</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent reports */}
          <div className="up-card">
            <div className="up-card-h">🎯 Recent reports <span style={{ marginLeft: 'auto', fontSize: 10, color: '#8a7d72', fontWeight: 'normal' }}>view all 31 →</span></div>
            {REPORTS.filter(r=>r.authorNickname===u.nick).map(r=>(
              <div className="up-rep-row" key={r.id}>
                <div className="rnk">#{r.rank}</div>
                <div>
                  <div className="id">{shortId(r.identifier, r.type)}</div>
                  {r.roastTitle && <div className="ro">"{r.roastTitle}"</div>}
                  <div className="meta">{r.createdAt} · {r.chain} · {THREAT_STYLE[r.threat].label}</div>
                </div>
                <div>
                  <div className="conf">{THREAT_STYLE[r.threat].fire || '·'} {r.confirmCount}</div>
                  <div style={{ fontSize: 10, color: '#8a7d72', textAlign: 'right' }}>confirms</div>
                </div>
              </div>
            ))}
            {/* Pad with one more */}
            <div className="up-rep-row">
              <div className="rnk">#42</div>
              <div>
                <div className="id">0x55e0…7c11</div>
                <div className="ro">"Two Pumps and a Funeral"</div>
                <div className="meta">8d ago · ETH · HIGH</div>
              </div>
              <div>
                <div className="conf" style={{ color: '#ff7a3a' }}>🔥🔥 18</div>
                <div style={{ fontSize: 10, color: '#8a7d72', textAlign: 'right' }}>confirms</div>
              </div>
            </div>
          </div>

          {/* The wall */}
          <div className="up-card">
            <div className="up-card-h">💬 The wall <span style={{ marginLeft: 'auto', fontSize: 10, color: '#8a7d72', fontWeight: 'normal' }}>142 entries</span></div>
            <div className="up-wall-input">
              <div className="av">R</div>
              <div className="field">Leave something on @{u.nick}'s wall…</div>
            </div>
            {walls.map((w,i)=>(
              <div className="up-wall-row" key={i}>
                <div className="av" style={{ background: w.c }}>{w.u[0].toUpperCase()}</div>
                <div>
                  <div className="h">
                    <span style={{ color: w.c, fontWeight: 'bold' }}>@{w.u}</span>
                    <span style={{ color: '#8a7d72' }}> · {w.t}</span>
                  </div>
                  <div className="body">{w.body}</div>
                  <div className="when">{w.when} · ▲ {[24,12,7][i]}  · reply</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.HybridUser = HybridUser;
