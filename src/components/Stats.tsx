import { useMemo, useState, useSyncExternalStore } from 'react';
import { money, useProfiles } from '../game/profiles';
import { stats } from '../stats/host';
import { SHOP_KINDS, statTables, tablesCSV, type Row, type Table } from '../stats/tables';
import { Icon } from './Icon';
import { Modal } from './Modal';

/**
 * Storyteller: the stats kept in this browser (stats/host.ts), as tables sorted most or least popular first, with
 * what's never been bought or chosen picked out. Export them as JSON or CSV to send on.
 */
export function StatsModal() {
  // (The stats are changed in place: their change count says when to look again.)
  const rev = useSyncExternalStore(stats.subscribe, stats.rev);
  const book = useProfiles((x) => x.profiles);
  const s = stats.get();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tables = useMemo(() => statTables(s, Object.values(book)), [rev, book]);
  const [tab, setTab] = useState('shop');
  const [least, setLeast] = useState(false);
  const [kind, setKind] = useState('all');
  const [sure, setSure] = useState(false);
  const t = tables.find((x) => x.id === tab) ?? tables[0];

  const download = (text: string, type: string, ext: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = `ravenswood-stats-${new Date().toLocaleDateString('en-CA')}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const json = () => JSON.stringify({ exported: new Date().toISOString(), stats: s, tables: tables.map(({ id, title, rows }) => ({ id, title, rows })) }, null, 1);

  return (
    <Modal
      title="Stats"
      eyebrow={`Counting since ${new Date(s.since).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })} · ${s.games} ${s.games === 1 ? 'game' : 'games'}`}
      size="lg"
      className="stats-modal"
      head={
        <div className="profiles-tools">
          <button className="btn small" onClick={() => download(json(), 'application/json', 'json')} title="Save the stats as JSON">
            <Icon name="download" /> <span>JSON</span>
          </button>
          <button className="btn small" onClick={() => download(tablesCSV(tables), 'text/csv', 'csv')} title="Save the tables as CSV (for a spreadsheet)">
            <Icon name="download" /> <span>CSV</span>
          </button>
        </div>
      }
    >
      <p className="profiles-blurb">What gets bought, picked and played, counted in this browser to see what works and what doesn’t. Never sent to players.</p>
      <div className="seg stats-tabs">
        {tables.map((x) => (
          <button key={x.id} className={x.id === t.id ? 'on' : ''} onClick={() => setTab(x.id)}>
            {x.title}
          </button>
        ))}
      </div>
      <div className="stats-tools">
        <div className="seg">
          <button className={!least ? 'on' : ''} onClick={() => setLeast(false)}>
            Most first
          </button>
          <button className={least ? 'on' : ''} onClick={() => setLeast(true)}>
            Least first
          </button>
        </div>
        {t.id === 'shop' && (
          <select className="input stats-kind" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Which kind of item">
            <option value="all">Everything</option>
            {SHOP_KINDS.map((k) => (
              <option key={k} value={k}>
                {t.rows.find((r) => String(r.key).startsWith(`${k}:`))?.kind ?? k}
              </option>
            ))}
          </select>
        )}
      </div>
      <StatTable table={t} least={least} kind={t.id === 'shop' ? kind : 'all'} />
      <div className="stats-reset">
        <button className={`btn small ${sure ? 'blood' : 'quiet'}`} onClick={() => (sure ? (stats.reset(), setSure(false)) : setSure(true))}>
          {sure ? 'Yes, clear every count' : 'Start counting afresh'}
        </button>
      </div>
    </Modal>
  );
}

function StatTable({ table, least, kind }: { table: Table; least: boolean; kind: string }) {
  const rows = table.rows.filter((r) => kind === 'all' || String(r.key).startsWith(`${kind}:`));
  const by = (r: Row) => Number(r[table.by]) || 0;
  // (Ties by name, past any icon in front.)
  const plain = (r: Row) => String(r.name).replace(/^[^\p{L}\p{N}]+/u, '');
  const sorted = [...rows].sort((a, b) => (least ? by(a) - by(b) : by(b) - by(a)) || plain(a).localeCompare(plain(b)));
  const never = rows.filter((r) => !by(r));
  const show = (v: string | number | undefined, k?: string) => (k === 'money' ? money(Number(v) || 0) : k === 'pct' ? (v === '' || v === undefined ? '' : `${v}%`) : (v ?? ''));
  return (
    <>
      {table.note && <p className="stats-note">{table.note}</p>}
      <p className="stats-note">
        <strong>
          {never.length} of {rows.length}
        </strong>{' '}
        {table.never}
        {never.length > 0 && never.length <= 12 ? `: ${never.map((r) => r.name).join(', ')}` : ''}.
      </p>
      <div className="stats-scroll">
        <table className="stats-table">
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c.key} className={c.kind && c.kind !== 'text' ? 'n' : ''}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={String(r.key)} className={by(r) ? '' : 'never'}>
                {table.columns.map((c) => (
                  <td key={c.key} className={c.kind && c.kind !== 'text' ? 'n' : ''}>
                    {show(r[c.key], c.kind)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
