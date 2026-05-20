// Hybrid direction — single scammer profile page.
// Shows how the system extends: scammer dossier with linked wallets,
// receipts, threaded comments, bounty pool, roast section.

function HybridScammer() {
  const r = REPORTS[0]; // The big legendary one
  const t = THREAT_STYLE[r.threat];

  const css = `
    .sp-root { font-family: "Geist", "Inter", -apple-system, sans-serif; color: #ece6df; background: #14100f; font-size: 13px; }
    .sp-root, .sp-root * { box-sizing: border-box; }
    .sp-mono { font-family: "JetBrains Mono", "SF Mono", monospace; }

    .sp-nav { background: #1a1413; border-bottom: 1px solid #2c211f; padding: 10px 22px; display: flex; align-items: center; gap: 14px; font-size: 12px; color: #8a7d72; }
    .sp-nav .crumb { color: #c4b8aa; }
    .sp-nav a { color: #ff3b6c; text-decoration: none; }

    /* Hero — full bleed mugshot card */
    .sp-hero { padding: 24px 22px; border-bottom: 1px solid #2c211f;
      background:
        radial-gradient(circle at 12% 0%, #ff3b6c33 0%, transparent 45%),
        radial-gradient(circle at 90% 100%, #ffc54722 0%, transparent 40%),
        linear-gradient(180deg,#1a1413, #14100f);
      position: relative; overflow: hidden; }
    .sp-hero::before { content: 'WANTED'; position: absolute; right: -20px; top: -10px;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 200px; color: #ff3b6c08; letter-spacing: -8px; line-height: 1; transform: rotate(8deg); pointer-events: none; }

    .sp-hero-row { display: grid; grid-template-columns: 1fr auto; gap: 32px; max-width: 1280px; margin: 0 auto; align-items: center; }
    .sp-mugshot { display: flex; gap: 20px; align-items: center; }
    .sp-mug-frame { width: 110px; height: 130px; position: relative; flex: 0 0 auto;
      background:
        repeating-linear-gradient(0deg, #2c211f 0 2px, transparent 2px 12px),
        linear-gradient(135deg, #ff3b6c33, #7c5cff33);
      border: 2px solid #ff3b6c; box-shadow: 0 0 30px #ff3b6c44; display: flex; align-items: center; justify-content: center;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 56px; color: #fff; }
    .sp-mug-frame::after { content: 'CASE# 0428–RUG'; position: absolute; bottom: -22px; left: 0; right: 0;
      font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7d72; text-align: center; letter-spacing: 0.5px; }
    .sp-id-block .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8a7d72; }
    .sp-id-block .id { font-family: 'JetBrains Mono', monospace; font-size: 22px; color: #f5e7d8; margin-top: 2px; }
    .sp-id-block .copy { color: #ff3b6c; font-size: 10px; cursor: pointer; margin-left: 8px; }
    .sp-id-block .roast { font-family: Tahoma, sans-serif; font-style: italic; color: #ffc547; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin-top: 14px; line-height: 1.1; }
    .sp-aka { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; font-size: 11px; }
    .sp-aka .lbl { color: #8a7d72; }
    .sp-aka .alias { background: #1a1413; border: 1px solid #2c211f; padding: 2px 8px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #c4b8aa; }

    .sp-threat-cluster { text-align: right; }
    .sp-threat-big { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 6px;
      background: #2c1418; border: 2px solid #ff3b6c; box-shadow: 0 0 20px #ff3b6c66;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 14px; color: #ff3b6c; letter-spacing: 0.5px; transform: rotate(-2deg); }
    .sp-conf-big { font-family: Tahoma, sans-serif; font-weight: 900; font-size: 64px; color: #ff3b6c; line-height: 1; margin-top: 14px; letter-spacing: -3px; }
    .sp-conf-lbl { font-size: 11px; color: #8a7d72; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .sp-actions { display: flex; gap: 8px; margin-top: 18px; justify-content: flex-end; }
    .sp-actions button { padding: 8px 14px; border-radius: 6px; border: 1px solid #2c211f; background: #1a1413; color: #c4b8aa; font: inherit; font-size: 12px; font-weight: bold; cursor: pointer; }
    .sp-actions button.primary { background: linear-gradient(180deg,#ff3b6c,#c11a4c); color: #fff; border-color: #ff3b6c; }

    /* Body */
    .sp-body { display: grid; grid-template-columns: 1fr 320px; gap: 20px; padding: 22px; max-width: 1280px; margin: 0 auto; }
    .sp-card { background: linear-gradient(180deg,#1a1413,#161110); border: 1px solid #2c211f; border-radius: 10px; margin-bottom: 16px; overflow: hidden; }
    .sp-card-h { padding: 12px 16px; border-bottom: 1px solid #2c211f; display: flex; align-items: center; gap: 10px;
      font-family: Tahoma, sans-serif; font-weight: 900; font-size: 14px; letter-spacing: -0.3px; color: #f5e7d8; }
    .sp-card-h .count { background: #2c211f; color: #c4b8aa; font-size: 10px; padding: 2px 7px; border-radius: 99px; font-family: 'JetBrains Mono', monospace; }
    .sp-card-h .more { margin-left: auto; font-size: 11px; color: #8a7d72; font-weight: normal; }
    .sp-card-b { padding: 16px; font-size: 13px; line-height: 1.55; color: #c4b8aa; }

    .sp-reason p { margin: 0 0 10px; }
    .sp-reason p:last-child { margin: 0; }
    .sp-reason .id { font-family: 'JetBrains Mono', monospace; color: #f5e7d8; background: #14100f; padding: 1px 5px; border-radius: 3px; border: 1px solid #2c211f; }

    /* Receipts gallery */
    .sp-receipts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 12px; }
    .sp-receipt { aspect-ratio: 4/3; background:
      repeating-linear-gradient(135deg,#1a1413 0 8px,#161110 8px 16px);
      border: 1px solid #2c211f; border-radius: 6px; padding: 8px; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7d72; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; }
    .sp-receipt:hover { border-color: #ff3b6c; }
    .sp-receipt .tag { background: #14100f; padding: 2px 5px; border-radius: 3px; align-self: flex-start; color: #ffc547; }
    .sp-receipt .src { color: #c4b8aa; }

    /* Linked wallets graph */
    .sp-graph { padding: 16px; }
    .sp-node-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px dashed #2c211f; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
    .sp-node-row:last-child { border-bottom: 0; }
    .sp-node-row .dot { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto; }
    .sp-node-row .addr { color: #c4b8aa; flex: 1; }
    .sp-node-row .rel { font-family: Geist, sans-serif; color: #8a7d72; font-size: 11px; }
    .sp-node-row .conf { color: #ff3b6c; font-family: Geist, sans-serif; font-weight: bold; }

    /* Comments */
    .sp-sortcomments { display: flex; gap: 4px; padding: 12px 16px; border-bottom: 1px solid #2c211f; font-size: 11px; }
    .sp-sortcomments .s { padding: 4px 10px; border-radius: 4px; cursor: pointer; color: #8a7d72; }
    .sp-sortcomments .s.cur { background: #2c211f; color: #f5e7d8; }
    .sp-commentbox { padding: 14px 16px; border-bottom: 1px solid #2c211f; display: flex; gap: 12px; align-items: flex-start; }
    .sp-commentbox .av { width: 36px; height: 36px; border-radius: 50%; background: #ff3b9a; color: #fff; display: flex; align-items: center; justify-content: center; font-family: Tahoma, sans-serif; font-weight: 900; }
    .sp-commentbox .field { flex: 1; background: #14100f; border: 1px solid #2c211f; border-radius: 6px; padding: 10px 12px; color: #8a7d72; font-size: 12px; min-height: 60px; }
    .sp-commentbox .post { background: linear-gradient(180deg,#ff3b6c,#c11a4c); color: #fff; padding: 8px 16px; border: 0; border-radius: 6px; font-weight: bold; font: inherit; font-size: 12px; cursor: pointer; align-self: stretch; }
    .sp-comment { padding: 14px 16px; border-bottom: 1px solid #2c211f; display: grid; grid-template-columns: 36px 1fr; gap: 12px; }
    .sp-comment:last-child { border-bottom: 0; }
    .sp-comment .av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: Tahoma, sans-serif; font-weight: 900; color: #fff; }
    .sp-comment .h { display: flex; gap: 8px; align-items: baseline; font-size: 11px; color: #8a7d72; margin-bottom: 4px; }
    .sp-comment .author { font-weight: bold; font-size: 13px; }
    .sp-comment .title { color: #8a7d72; font-size: 11px; }
    .sp-comment .body { color: #ece6df; line-height: 1.55; }
    .sp-comment .body .id { font-family: 'JetBrains Mono', monospace; color: #ffc547; background: #14100f; padding: 1px 5px; border-radius: 3px; }
    .sp-comment .actions { display: flex; gap: 14px; margin-top: 8px; font-size: 11px; color: #8a7d72; }
    .sp-comment .actions span { cursor: pointer; }
    .sp-comment .actions span:hover { color: #ff3b6c; }
    .sp-comment .actions .score { color: #ff3b6c; font-weight: bold; }
    .sp-thread { margin-left: 18px; border-left: 2px solid #2c211f; padding-left: 18px; margin-top: 12px; }

    /* Sidebar */
    .sp-side { display: flex; flex-direction: column; gap: 16px; }
    .sp-bounty { padding: 18px; text-align: center; background:
      radial-gradient(circle at center, #ffc54722 0%, transparent 60%); }
    .sp-bounty .pool { font-family: Tahoma, sans-serif; font-weight: 900; font-size: 32px; color: #ffc547; letter-spacing: -1px; }
    .sp-bounty .sub { color: #8a7d72; font-size: 11px; margin-top: 2px; }
    .sp-bounty .contribs { display: flex; justify-content: center; gap: -8px; margin-top: 12px; }
    .sp-bounty .contribs .av { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #1a1413; margin-left: -8px; color: #fff; display: flex; align-items: center; justify-content: center; font-family: Tahoma, sans-serif; font-weight: 900; font-size: 11px; }
    .sp-bounty .contribs .av:first-child { margin-left: 0; }
    .sp-bounty button { margin-top: 14px; background: #ffc547; color: #2a1c00; border: 0; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font: inherit; font-size: 12px; }

    .sp-rule { display: flex; gap: 8px; padding: 8px 0; border-bottom: 1px dashed #2c211f; font-size: 12px; align-items: baseline; }
    .sp-rule:last-child { border-bottom: 0; }
    .sp-rule .k { color: #8a7d72; flex: 0 0 100px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .sp-rule .v { color: #f5e7d8; font-weight: 600; flex: 1; text-align: right; }

    .sp-timeline { padding: 12px 16px 16px; }
    .sp-tl-row { display: grid; grid-template-columns: 50px 1fr; gap: 12px; padding: 6px 0; font-size: 11.5px; }
    .sp-tl-row .when { font-family: 'JetBrains Mono', monospace; color: #8a7d72; font-size: 10px; }
    .sp-tl-row .what b { color: #f5e7d8; }
  `;

  return (
    <div className="sp-root">
      <style>{css}</style>
      <div className="sp-nav">
        <a>← back</a>
        <span className="crumb">r/rugpulls</span>
        <span style={{ color: '#5a4540' }}>/</span>
        <span className="crumb sp-mono">0x8a3F…901B</span>
        <span style={{ color: '#5a4540' }}>/</span>
        <span style={{ color: '#f5e7d8' }}>case file</span>
      </div>

      <div className="sp-hero">
        <div className="sp-hero-row">
          <div className="sp-mugshot">
            <div className="sp-mug-frame">⚙</div>
            <div className="sp-id-block">
              <div className="lbl">DEPLOYER ADDRESS · Solana</div>
              <div className="id">0x8a3F19c4b6d2E14e0b9c81f9b73a4eAaC7d2901B <span className="copy">copy</span></div>
              <div className="roast">"the Rugnarok"</div>
              <div className="sp-aka">
                <span className="lbl">also seen as:</span>
                <span className="alias">@jeetcoin_dev</span>
                <span className="alias">moonboi_dev</span>
                <span className="alias">0x42aE…1aaA</span>
                <span className="alias" style={{ color: '#ff3b6c' }}>+11 more</span>
              </div>
            </div>
          </div>
          <div className="sp-threat-cluster">
            <div className="sp-threat-big">💀 LEGENDARY · TIER 5</div>
            <div className="sp-conf-big">287</div>
            <div className="sp-conf-lbl">confirms · 14 reports · 142 comments</div>
            <div className="sp-actions">
              <button>👁 Watch</button>
              <button>📎 Add evidence</button>
              <button>🔥 Roast</button>
              <button className="primary">✓ I was rugged too</button>
            </div>
          </div>
        </div>
      </div>

      <div className="sp-body">
        <div>
          {/* Reason */}
          <div className="sp-card">
            <div className="sp-card-h">📋 Original report <span className="more">submitted by <span style={{ color: '#ff3b9a' }}>@rugslayer.eth</span> · 3h ago</span></div>
            <div className="sp-card-b sp-reason">
              <p>Deployed <b style={{ color: '#f5e7d8' }}>JEETCOIN</b> on Solana at 17:42 UTC. LP at <span className="id">0x8a3F…901B</span> was migrated to a single wallet 38 minutes after launch, draining $1.2M USDC in one transaction.</p>
              <p>Same EOA has deployed <b style={{ color: '#ff3b6c' }}>14 tokens in the last 9 days</b> — every single one followed the same pattern: pump for 20–45 minutes, then a one-shot LP migration. Funded by Tornado Cash 0.1 ETH ~9 hours before each deploy.</p>
              <p style={{ color: '#8a7d72', fontStyle: 'italic' }}>If you bought into JEETCOIN, BAGRUG, MOONJEET, FLOORSWEEP, or any of the linked tokens below — receipts welcome.</p>
            </div>
          </div>

          {/* Receipts */}
          <div className="sp-card">
            <div className="sp-card-h">🧾 Receipts gallery <span className="count">11</span> <span className="more">add evidence →</span></div>
            <div className="sp-receipts">
              {[
                { tag: 'tx', src: 'solscan.io', t: 'LP migration · 1,247 SOL out' },
                { tag: 'screenshot', src: 'twitter', t: '@jeetcoin_dev — "lol"' },
                { tag: 'tx', src: 'solscan.io', t: 'Tornado in · 9h pre-deploy' },
                { tag: 'screenshot', src: 'discord', t: '"buy now, locked LP"' },
                { tag: 'graph', src: 'arkham', t: 'wallet cluster · 11 EOAs' },
                { tag: 'tx', src: 'solscan.io', t: 'BAGRUG drain · 412 SOL' },
                { tag: 'screenshot', src: 'telegram', t: 'pre-launch shill group' },
                { tag: 'contract', src: 'solscan.io', t: 'hidden mint fn line 218' },
              ].map((rec,i)=>(
                <div className="sp-receipt" key={i}>
                  <div className="tag">{rec.tag}</div>
                  <div>
                    <div className="src">{rec.src}</div>
                    <div style={{ color: '#c4b8aa', marginTop: 2 }}>{rec.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Linked wallets */}
          <div className="sp-card">
            <div className="sp-card-h">🔗 Linked wallets & aliases <span className="count">11</span> <span className="more">view graph →</span></div>
            <div className="sp-graph">
              {[
                { color: '#ff3b6c', addr: '0x8a3F19c4b6d2E14e0b9c81f9b73a4eAaC7d2901B', rel: 'PRIMARY · this case', conf: '287' },
                { color: '#ff7a3a', addr: '0x42aeFf09812bB1c9aA4f8d11de2C29c66E901aaA', rel: 'funded primary · 9h pre-deploy', conf: '92' },
                { color: '#ffc547', addr: '0x9100c441D9eC4F2b81fEd4dfBb12CE6cD401fffe', rel: 'received drained LP', conf: '38' },
                { color: '#7c5cff', addr: '@moonboi_dev', rel: 'twitter shill account', conf: '144' },
                { color: '#5cd0e2', addr: '0x77abEEdc119fF1b1cE2cE3441b8a2c1F71eFe211', rel: 'same deploy pattern', conf: '14' },
                { color: '#8a7d72', addr: '+ 6 more wallets', rel: 'suspected · awaiting confirmation', conf: '—' },
              ].map((n,i)=>(
                <div className="sp-node-row" key={i}>
                  <span className="dot" style={{ background: n.color, boxShadow: `0 0 8px ${n.color}` }}></span>
                  <span className="addr">{n.addr}</span>
                  <span className="rel">{n.rel}</span>
                  <span className="conf">{n.conf}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="sp-card">
            <div className="sp-card-h">💬 Discussion <span className="count">142</span></div>
            <div className="sp-sortcomments">
              <span className="s cur">🔥 Top</span>
              <span className="s">🆕 New</span>
              <span className="s">😈 Controversial</span>
              <span className="s">💀 Most damning</span>
              <span style={{ marginLeft: 'auto', color: '#8a7d72' }}>collapse all</span>
            </div>
            <div className="sp-commentbox">
              <div className="av" style={{ background: '#ff3b9a' }}>R</div>
              <div className="field">Drop a receipt, share a transaction trail, or just let it rip…</div>
              <button className="post">post</button>
            </div>
            {COMMENTS.map((c,i)=>(
              <div className="sp-comment" key={i}>
                <div className="av" style={{ background: c.color }}>{c.user[0].toUpperCase()}</div>
                <div>
                  <div className="h">
                    <span className="author" style={{ color: c.color }}>@{c.user}</span>
                    <span className="title">[{c.title}]</span>
                    <span>·</span>
                    <span>{c.t} ago</span>
                  </div>
                  <div className="body">{c.body}</div>
                  <div className="actions">
                    <span className="score">▲ {c.score}</span>
                    <span>▼</span>
                    <span>reply</span>
                    <span>quote</span>
                    <span>save</span>
                    <span>🎖 award</span>
                    {i===0 && <span style={{ color: '#ffc547' }}>★ pinned by mods</span>}
                  </div>
                  {i===0 && (
                    <div className="sp-thread">
                      <div className="sp-comment" style={{ padding: 0, border: 0 }}>
                        <div className="av" style={{ background: '#7c5cff' }}>E</div>
                        <div>
                          <div className="h"><span className="author" style={{ color: '#7c5cff' }}>@etherdetective</span><span className="title">[Watchdog]</span><span>·</span><span>1h ago</span></div>
                          <div className="body">Confirmed — I traced the same <span className="id">_skipFee</span> backdoor in their other 13 contracts. It's literal copy-paste. They didn't even rename the mapping.</div>
                          <div className="actions"><span className="score">▲ 47</span><span>▼</span><span>reply</span><span>quote</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sp-side">
          {/* Bounty pool */}
          <div className="sp-card">
            <div className="sp-card-h">💰 Bounty pool <span className="count">6</span></div>
            <div className="sp-bounty">
              <div className="pool">$2,180</div>
              <div className="sub">USDC · payable on legal action</div>
              <div className="contribs">
                {TOP_USERS.slice(0,5).map(u=>(
                  <div className="av" key={u.nick} style={{ background: u.color }}>{u.nick[0].toUpperCase()}</div>
                ))}
                <div className="av" style={{ background: '#2c211f', color: '#8a7d72' }}>+1</div>
              </div>
              <button>+ contribute</button>
            </div>
          </div>

          {/* Rap sheet */}
          <div className="sp-card">
            <div className="sp-card-h">📑 Rap sheet</div>
            <div className="sp-card-b" style={{ paddingTop: 4 }}>
              <div className="sp-rule"><span className="k">first seen</span><span className="v">Mar 14, 2026</span></div>
              <div className="sp-rule"><span className="k">tokens deployed</span><span className="v" style={{ color: '#ff3b6c' }}>14</span></div>
              <div className="sp-rule"><span className="k">est. stolen</span><span className="v" style={{ color: '#ff3b6c' }}>$1.2M</span></div>
              <div className="sp-rule"><span className="k">chain(s)</span><span className="v">SOL · ETH</span></div>
              <div className="sp-rule"><span className="k">linked twitters</span><span className="v">3</span></div>
              <div className="sp-rule"><span className="k">pattern</span><span className="v">stealth-LP migration</span></div>
              <div className="sp-rule"><span className="k">avg time-to-rug</span><span className="v">37 min</span></div>
              <div className="sp-rule"><span className="k">status</span><span className="v" style={{ color: '#ffc547' }}>still active</span></div>
            </div>
          </div>

          {/* Timeline */}
          <div className="sp-card">
            <div className="sp-card-h">🕐 Timeline</div>
            <div className="sp-timeline">
              {[
                { when: '3h ago', what: <><b>@rugslayer.eth</b> reported as scammer.</> },
                { when: '2h ago', what: <><b>14 confirms</b> in the first hour.</> },
                { when: '2h ago', what: <><b>@soliditysnitch</b> dropped contract evidence.</> },
                { when: '1h ago', what: <>auto-promoted to <b style={{ color: '#ff3b6c' }}>LEGENDARY</b>.</> },
                { when: '52m ago', what: <>bounty pool opened by <b>@etherdetective</b>.</> },
                { when: '38m ago', what: <>2 linked wallets identified.</> },
                { when: '14m ago', what: <><b>"the Rugnarok"</b> won roast of the week.</> },
              ].map((row,i)=>(
                <div className="sp-tl-row" key={i}>
                  <span className="when">{row.when}</span>
                  <span className="what" style={{ color: '#c4b8aa' }}>{row.what}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Similar scammers */}
          <div className="sp-card">
            <div className="sp-card-h">🧬 Same pattern</div>
            <div className="sp-card-b" style={{ paddingTop: 4 }}>
              {REPORTS.slice(2,5).map(r=>(
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px dashed #2c211f' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: '#2c211f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tahoma', fontWeight: 900, color: '#ffc547', fontSize: 14 }}>#{r.rank}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#f5e7d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortId(r.identifier, r.type)}</div>
                    <div style={{ color: '#8a7d72', fontSize: 10 }}>{r.confirmCount} confirms · {r.chain}</div>
                  </div>
                  <span style={{ color: THREAT_STYLE[r.threat].color, fontSize: 10, fontFamily: 'Tahoma', fontWeight: 900 }}>{THREAT_STYLE[r.threat].label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.HybridScammer = HybridScammer;
