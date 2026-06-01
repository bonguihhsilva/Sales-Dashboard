const fs = require('fs');
const path = require('path');
const file = path.join('c:/Projetos/da-silva-dashboard/src/app/dashboard/mapeamento/MapeamentoClient.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  // Styles definitions
  [
    `  const selStyle = {\n    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',\n    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem',\n    padding: '7px 10px', outline: 'none', cursor: 'pointer', width: '100%',\n  }`,
    `  const selStyle = "w-full bg-surface-container-high/50 border border-white/10 rounded-lg text-white font-mono text-xs px-3 py-2 outline-none focus:border-accent transition-colors cursor-pointer"`
  ],
  [
    `  const inputStyle = {\n    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',\n    color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem',\n    padding: '7px 10px', outline: 'none', width: '100%',\n  }`,
    `  const inputStyle = "w-full bg-surface-container-high/50 border border-white/10 rounded-lg text-white font-mono text-xs px-3 py-2 outline-none focus:border-accent transition-colors"`
  ],
  [
    `  const labelStyle = {\n    display: 'block' as const, fontSize: '0.62rem', fontFamily: 'DM Mono, monospace',\n    color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px',\n  }`,
    `  const labelStyle = "block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1"`
  ],
  
  // Convert style prop to className
  [`style={selStyle}`, `className={selStyle}`],
  [`style={inputStyle}`, `className={inputStyle}`],
  [`style={labelStyle}`, `className={labelStyle}`],
  [`style={{ ...inputStyle, textAlign: 'right' }}`, `className={\`\${inputStyle} text-right\`}`],
  [`style={{ ...selStyle, marginBottom: '0.85rem' }}`, `className={\`\${selStyle} mb-3\`}`],
  [`style={{ ...selStyle, marginBottom: '1.5rem' }}`, `className={\`\${selStyle} mb-6\`}`],

  // Header intro
  [
    `<p style={{ fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>\n        Vincule cada vendedor do HTML ao usuário do sistema. Vendedores do HTML não registrados aparecem na seção abaixo para cadastro.\n      </p>`,
    `<p className="text-xs font-mono text-muted-foreground mb-6 leading-relaxed">\n        Vincule cada vendedor do HTML ao usuário do sistema. Vendedores do HTML não registrados aparecem na seção abaixo para cadastro.\n      </p>`
  ],

  // Message box
  [
    `<div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', background: msg.startsWith('✓') ? 'rgba(200,245,66,0.1)' : 'rgba(245,92,66,0.1)', color: msg.startsWith('✓') ? 'var(--meta1)' : '#f55c42', border: \`1px solid \${msg.startsWith('✓') ? 'rgba(200,245,66,0.3)' : 'rgba(245,92,66,0.3)'}\` }}>`,
    `<div className={\`px-4 py-3 rounded-lg mb-4 text-xs font-mono border \${msg.startsWith('✓') ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}\`}>`
  ],

  // Summary pills
  [
    `<div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>`,
    `<div className="flex gap-3 mb-6 flex-wrap items-center">`
  ],
  [
    `<div style={{ background: 'rgba(200,245,66,0.08)', border: '1px solid rgba(200,245,66,0.2)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace' }}>\n          <span style={{ color: 'var(--meta1)', fontWeight: 700 }}>{mappedCount}</span>\n          <span style={{ color: 'var(--muted)' }}> vinculados</span>\n        </div>`,
    `<div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 text-xs font-mono">\n          <span className="text-green-400 font-bold">{mappedCount}</span>\n          <span className="text-muted-foreground"> vinculados</span>\n        </div>`
  ],
  [
    `<div style={{ background: unmappedCount > 0 ? 'rgba(245,200,66,0.08)' : 'var(--surface2)', border: \`1px solid \${unmappedCount > 0 ? 'rgba(245,200,66,0.25)' : 'var(--border)'}\`, borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace' }}>\n          <span style={{ color: unmappedCount > 0 ? '#f5c842' : 'var(--muted)', fontWeight: 700 }}>{unmappedCount}</span>\n          <span style={{ color: 'var(--muted)' }}> sem usuário</span>\n        </div>`,
    `<div className={\`border rounded-lg px-4 py-2 text-xs font-mono \${unmappedCount > 0 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-surface-container-high/30 border-white/5'}\`}>\n          <span className={\`font-bold \${unmappedCount > 0 ? 'text-yellow-400' : 'text-muted-foreground'}\`}>{unmappedCount}</span>\n          <span className="text-muted-foreground"> sem usuário</span>\n        </div>`
  ],
  [
    `<div style={{ background: 'rgba(245,92,66,0.08)', border: '1px solid rgba(245,92,66,0.2)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontFamily: 'DM Mono, monospace' }}>\n            <span style={{ color: '#f55c42', fontWeight: 700 }}>{orphanVendors.length}</span>\n            <span style={{ color: 'var(--muted)' }}> não registrados</span>\n          </div>`,
    `<div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-xs font-mono">\n            <span className="text-red-400 font-bold">{orphanVendors.length}</span>\n            <span className="text-muted-foreground"> não registrados</span>\n          </div>`
  ],
  [
    `<button\n          onClick={() => setShowAddModal(true)}\n          style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}\n        >\n          + Adicionar Novo Vendedor\n        </button>`,
    `<button\n          onClick={() => setShowAddModal(true)}\n          className="ml-auto bg-accent text-bg font-display font-bold text-xs border-none rounded-lg px-4 py-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"\n        >\n          + Adicionar Novo Vendedor\n        </button>`
  ],

  // Registered Vendors Table Container
  [
    `<div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>\n        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>\n          <thead>\n            <tr style={{ borderBottom: '1px solid var(--border)' }}>\n              {['Vendedor (HTML)', 'Loja', 'ID', 'Usuário do sistema', ''].map(h => (\n                <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>\n              ))}\n            </tr>\n          </thead>\n          <tbody>`,
    `<div className="glass-card rounded-2xl p-6 border border-white/5 mb-10">\n        <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">\n          <table className="w-full text-sm text-left border-collapse">\n            <thead className="bg-surface-container-high/50 border-b border-white/5">\n              <tr>\n                {['Vendedor (HTML)', 'Loja', 'ID', 'Usuário do sistema', ''].map(h => (\n                  <th key={h} className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-4 py-3 text-left whitespace-nowrap">{h}</th>\n                ))}\n              </tr>\n            </thead>\n            <tbody className="divide-y divide-border">`
  ],
  [
    `<td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>`,
    `<td colSpan={5} className="p-8 text-center text-muted-foreground font-mono text-xs">`
  ],
  [
    `          </tbody>\n        </table>\n      </div>`,
    `            </tbody>\n          </table>\n        </div>\n      </div>`
  ],

  // Vendor Row
  [
    `<tr style={{ borderBottom: '1px solid var(--border)' }}>`,
    `<tr className="hover:bg-secondary/10 transition-colors">`
  ],
  [
    `<td style={{ padding: '10px 12px', fontWeight: 600 }}>{v.vendor_name}</td>`,
    `<td className="px-4 py-3 font-semibold">{v.vendor_name}</td>`
  ],
  [
    `<td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{v.store}</td>`,
    `<td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.store}</td>`
  ],
  [
    `<td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--accent)' }}>{v.vendor_id}</td>`,
    `<td className="px-4 py-3 font-mono text-xs text-accent">{v.vendor_id}</td>`
  ],
  [
    `<td style={{ padding: '10px 12px', minWidth: '240px' }}>`,
    `<td className="px-4 py-3 min-w-[240px]">`
  ],
  [
    `<td style={{ padding: '10px 12px' }}>`,
    `<td className="px-4 py-3">`
  ],
  [
    `<span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--meta1)' }}>✓ Vinculado</span>`,
    `<span className="font-mono text-[11px] text-green-400">✓ Vinculado</span>`
  ],
  [
    `<button\n              onClick={() => { if (selected) saveMapping(v.vendor_id, selected) }}\n              disabled={!selected || !changed || saving === v.vendor_id}\n              style={{\n                background: changed ? 'var(--accent)' : 'transparent',\n                color: changed ? '#0e0f11' : 'var(--muted)',\n                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.72rem',\n                border: '1px solid var(--border)', borderRadius: '6px',\n                padding: '6px 14px', cursor: changed ? 'pointer' : 'default',\n                opacity: saving === v.vendor_id ? 0.6 : 1, whiteSpace: 'nowrap',\n              }}\n            >`,
    `<button\n              onClick={() => { if (selected) saveMapping(v.vendor_id, selected) }}\n              disabled={!selected || !changed || saving === v.vendor_id}\n              className={\`font-display font-bold text-[11px] border rounded-md px-3 py-1.5 whitespace-nowrap transition-colors \${\n                changed \n                  ? 'bg-accent text-bg border-accent cursor-pointer' \n                  : 'bg-transparent text-muted-foreground border-white/10 cursor-default'\n              } \${saving === v.vendor_id ? 'opacity-60' : ''}\`}\n            >`
  ],

  // Orphan Vendors
  [
    `<div style={{ marginBottom: '1rem' }}>\n            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f55c42' }}>\n              ⚠ Vendedores não registrados\n            </h2>\n            <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '4px' }}>\n              Estes IDs aparecem nas vendas importadas mas não têm metas cadastradas. Clique em "Registrar" para adicionar.\n            </p>\n          </div>`,
    `<div className="mb-4">\n            <h2 className="text-base font-bold text-red-400 font-display-lg">\n              ⚠ Vendedores não registrados\n            </h2>\n            <p className="text-xs font-mono text-muted-foreground mt-1">\n              Estes IDs aparecem nas vendas importadas mas não têm metas cadastradas. Clique em "Registrar" para adicionar.\n            </p>\n          </div>`
  ],
  [
    `<div style={{ overflowX: 'auto' }}>\n            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>\n              <thead>\n                <tr style={{ borderBottom: '1px solid var(--border)' }}>\n                  {['Nome (no HTML)', 'Loja', 'ID', ''].map(h => (\n                    <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>\n                  ))}\n                </tr>\n              </thead>\n              <tbody>`,
    `<div className="glass-card rounded-2xl p-6 border border-white/5">\n          <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">\n            <table className="w-full text-sm text-left border-collapse">\n              <thead className="bg-surface-container-high/50 border-b border-white/5">\n                <tr>\n                  {['Nome (no HTML)', 'Loja', 'ID', ''].map(h => (\n                    <th key={h} className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-4 py-3 text-left whitespace-nowrap">{h}</th>\n                  ))}\n                </tr>\n              </thead>\n              <tbody className="divide-y divide-border">`
  ],
  [
    `<td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: '#f55c42' }}>{v.vendor_id}</td>`,
    `<td className="px-4 py-3 font-mono text-xs text-red-400">{v.vendor_id}</td>`
  ],
  [
    `<button\n                        onClick={() => {\n                          setAddVendor(v)\n                          setAddName(v.vendor_name)\n                          setAddStore(v.store)\n                          setShowAddModal(true)\n                        }}\n                        style={{ background: 'rgba(245,92,66,0.15)', color: '#f55c42', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(245,92,66,0.3)', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}\n                      >`,
    `<button\n                        onClick={() => {\n                          setAddVendor(v)\n                          setAddName(v.vendor_name)\n                          setAddStore(v.store)\n                          setShowAddModal(true)\n                        }}\n                        className="bg-red-500/10 text-red-400 font-display font-bold text-[11px] border border-red-500/30 rounded-md px-3 py-1.5 cursor-pointer whitespace-nowrap hover:bg-red-500/20 transition-colors"\n                      >`
  ],
  [
    `</tbody>\n            </table>\n          </div>\n        </div>`,
    `</tbody>\n            </table>\n          </div>\n        </div>\n      </div>`
  ],

  // Add Modal
  [
    `<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>`,
    `<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">`
  ],
  [
    `<div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>`,
    `<div className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card shadow-2xl">`
  ],
  [
    `<h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>`,
    `<h2 className="text-xl font-bold mb-2 font-display-lg">`
  ],
  [
    `<p style={{ fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginBottom: '1.5rem' }}>`,
    `<p className="text-xs font-mono text-muted-foreground mb-6">`
  ],
  [
    `<div style={{ display: 'flex', gap: '12px', marginBottom: '0.85rem', padding: '10px 14px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>`,
    `<div className="flex gap-4 mb-4 p-4 bg-surface-container-high/30 rounded-xl border border-white/5">`
  ],
  [
    `<div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '3px' }}>ID</div>`,
    `<div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">ID</div>`
  ],
  [
    `<div style={{ fontWeight: 700, color: 'var(--accent)' }}>{addVendor.vendor_id}</div>`,
    `<div className="font-bold text-accent font-mono text-sm">{addVendor.vendor_id}</div>`
  ],
  [
    `<div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '3px' }}>Nome</div>`,
    `<div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Nome</div>`
  ],
  [
    `<div style={{ fontWeight: 600 }}>{addVendor.vendor_name}</div>`,
    `<div className="font-semibold text-sm">{addVendor.vendor_name}</div>`
  ],
  [
    `<div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '3px' }}>Loja</div>`,
    `<div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Loja</div>`
  ],
  [
    `<div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>{addVendor.store}</div>`,
    `<div className="font-mono text-xs">{addVendor.store}</div>`
  ],
  [
    `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.85rem' }}>`,
    `<div className="grid grid-cols-2 gap-4 mb-4">`
  ],
  [
    `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '0.85rem' }}>`,
    `<div className="grid grid-cols-3 gap-3 mb-4">`
  ],
  [
    `<div style={{ display: 'flex', gap: '10px' }}>`,
    `<div className="flex gap-3 mt-2">`
  ],
  [
    `<button\n                onClick={() => { setShowAddModal(false); setAddVendor(null); setAddName(''); setAddM1(''); setAddM2(''); setAddM3(''); setAddUserId('') }}\n                style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', padding: '10px', cursor: 'pointer' }}\n              >\n                Cancelar\n              </button>`,
    `<button\n                onClick={() => { setShowAddModal(false); setAddVendor(null); setAddName(''); setAddM1(''); setAddM2(''); setAddM3(''); setAddUserId('') }}\n                className="flex-1 bg-transparent border border-white/10 rounded-lg text-muted-foreground font-display font-semibold text-sm p-3 cursor-pointer hover:bg-surface-container-high transition-colors"\n              >\n                Cancelar\n              </button>`
  ],
  [
    `<button\n                onClick={registerAndLink}\n                disabled={addingVendor || (!addVendor && !addName)}\n                style={{ flex: 2, background: 'var(--accent)', color: '#0e0f11', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', opacity: (addingVendor || (!addVendor && !addName)) ? 0.6 : 1 }}\n              >\n                {addingVendor ? 'Salvando...' : 'Registrar Vendedor'}\n              </button>`,
    `<button\n                onClick={registerAndLink}\n                disabled={addingVendor || (!addVendor && !addName)}\n                className={\`flex-[2] bg-accent text-bg font-display font-bold text-sm border-none rounded-lg p-3 cursor-pointer transition-opacity \${(addingVendor || (!addVendor && !addName)) ? 'opacity-50' : 'hover:opacity-90'}\`}\n              >\n                {addingVendor ? 'Salvando...' : 'Registrar Vendedor'}\n              </button>`
  ]
];

for (const [t, r] of replacements) {
  content = content.replace(t, r);
}

fs.writeFileSync(file, content);
console.log("Replacements complete!");
