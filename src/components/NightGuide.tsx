import { getRole, nightReminder } from '../data';
import { bringDawn, guide, guideSteps, nightKind, stepName, stepsLeft, type NightStep } from '../lib/nightGuide';
import { joinNames } from '../lib/util';
import { seatName, useHost } from '../state/host';
import { ui, useUI } from '../state/ui';
import { useView } from '../state/view';
import { Icon } from './Icon';
import { RichText } from './RichText';
import { NightIcon } from './SidePanel';

/**
 * The Storyteller's guided night: the next character on the night sheet (only those in play), who has it, and what
 * to do, with a button to wake them with their question ready; then Next puts them back to sleep and moves on.
 * It keeps the same ticks as the night order in the side panel, so either can be used.
 */
export function NightGuide() {
  const view = useView();
  const g = useHost((s) => s.g);
  const open = useUI((s) => s.nightGuide);
  const hidden = useUI((s) => s.hideGrimoire);
  const draft = useUI((s) => s.draft);
  if (view.mode !== 'st' || g.phase !== 'night' || !g.revealed || g.ended || hidden) return null;
  const steps = guideSteps(g);
  const step = stepsLeft(g)[0];
  if (!step) return null;
  const at = steps.findIndex((s) => s.key === step.key) + 1;
  const name = stepName(step);
  if (!open) {
    return (
      <button className="night-guide-tab surface" onClick={() => useUI.setState({ nightGuide: true })} title="Open the night guide">
        <Icon name="moon" /> {at} of {steps.length}: {name}
      </button>
    );
  }
  const k = nightKind(g);
  const text = nightReminder(step.row.id, k);
  const after = stepsLeft(g, step.key)[0];
  const canBack = steps.slice(0, at - 1).some((s) => g.nightDone.includes(s.key));
  return (
    <div className="night-guide surface" role="region" aria-label="Night guide">
      <div className="night-guide-head">
        <span className="eyebrow">
          <Icon name="moon" /> Night {g.day} · {at} of {steps.length}
        </span>
        <button className="night-guide-hide" onClick={() => useUI.setState({ nightGuide: false })} title="Tuck the guide away" aria-label="Tuck the guide away">
          <Icon name="chevronDown" />
        </button>
      </div>
      <div className="night-guide-step">
        <div className="night-icon">
          <NightIcon id={step.row.id} />
        </div>
        <div className="night-guide-text">
          <div className="night-name">
            <strong>{name}</strong>
            <Who step={step} />
          </div>
          {text && (
            <p>
              <RichText text={text} />
            </p>
          )}
        </div>
      </div>
      <div className="night-guide-actions">
        <button className="btn small square" disabled={!canBack} onClick={() => guide.back(step.key)} title="Back a step" aria-label="Back a step">
          <Icon name="chevronLeft" />
        </button>
        <span className="grow" />
        <Actions step={step} next={after ? `Next: ${stepName(after)}` : 'Done'} sent={draft.step === step.key && Boolean(draft.sentId)} reopen={draft.step === step.key} />
      </div>
    </div>
  );
}

/** Who the step wakes: their names (the dead struck through), and the real character of anyone who only thinks they have it. */
function Who({ step }: { step: NightStep }) {
  const g = useHost((s) => s.g);
  const believers = new Set(step.row.holders.filter((h) => h.believes).map((h) => h.seat.id));
  return (
    <>
      {step.who.map((id) => {
        const seat = g.seats.find((s) => s.id === id);
        return (
          <span key={id} className={`night-who ${seat?.dead ? 'dead' : ''}`} title={seat?.dead ? 'Dead' : undefined}>
            {seatName(g, id)}
            {believers.has(id) && ` (${getRole(seat?.roleId)?.name})`}
          </span>
        );
      })}
    </>
  );
}

function Actions({ step, next, sent, reopen }: { step: NightStep; next: string; sent: boolean; reopen: boolean }) {
  const g = useHost((s) => s.g);
  const wake = () => (reopen ? ui.open({ kind: 'wake' }) : guide.wake(step));
  if (step.row.id === 'dawn') {
    return (
      <button className="btn primary" onClick={bringDawn}>
        <Icon name="sun" /> Bring the dawn
      </button>
    );
  }
  if (!step.who.length) {
    return (
      <button className="btn primary" onClick={() => guide.next(step.key)}>
        {next} <Icon name="chevronRight" />
      </button>
    );
  }
  const names = joinNames(step.who.map((id) => seatName(g, id)));
  const awake = step.who.some((id) => g.awake[id]);
  if (awake || sent) {
    return (
      <>
        <button className="btn" onClick={wake}>
          <Icon name="wake" /> Wake screen
        </button>
        <button className="btn primary" onClick={() => guide.next(step.key)} title="Put them back to sleep, tick this off and wake the next character">
          {next} <Icon name="chevronRight" />
        </button>
      </>
    );
  }
  return (
    <>
      <button className="btn" onClick={() => guide.skip(step.key)} title="Tick this off without waking anyone">
        Skip
      </button>
      <button className="btn primary" onClick={wake}>
        <Icon name="wake" /> Wake {names}
      </button>
    </>
  );
}
