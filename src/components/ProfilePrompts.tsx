import { backups, useOffer, useBackups, type Offer } from '../game/backup';
import { useKnocks } from '../game/devices';
import { money, nameKey, useProfiles } from '../game/profiles';
import { hostLink } from '../net/host';
import { ui } from '../state/ui';
import { Icon } from './Icon';

/** "3 days ago", roughly. */
export function ago(at: number): string {
  const mins = Math.max(0, (Date.now() - at) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${Math.round(mins)} minutes ago`;
  const hours = mins / 60;
  if (hours < 24) return `${Math.round(hours)} ${Math.round(hours) === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** What restoring would bring back, in a sentence or two. */
function OfferText({ o }: { o: Offer }) {
  const list = Object.values(o.profiles).sort((a, b) => b.coins - a.coins);
  const n = list.length;
  const pets = list.reduce((sum, p) => sum + p.pets.length, 0);
  const named = list.slice(0, 3).map((p) => `${p.name} ${money(p.coins)}`);
  return (
    <>
      <h3>
        {o.ours
          ? `Players have newer copies of ${plural(n, 'profile')}, from ${ago(o.at)}. Restore them?`
          : `Players have a backup of ${plural(n, 'profile')} from ${ago(o.at)}. Restore them?`}
      </h3>
      <p>
        Kept by {plural(o.copies, 'player’s browser', 'players’ browsers')}. {named.join(', ')}
        {n > 3 ? ` and ${n - 3} more` : ''}
        {pets ? `, with ${plural(pets, 'pet')} between them` : ''}. Each replaces the profile of the same name here, like importing a file.
      </p>
    </>
  );
}

function restore(o: Offer) {
  const got = backups.restore(o);
  if (typeof got === 'string') ui.toast(got, 'evil');
  else ui.toast(`Restored ${plural(got, 'profile')} from the players’ backup`, 'good');
}

/**
 * Storyteller: players' browsers have a copy of the profiles worth restoring (this browser's book is new, or older
 * than theirs). Nothing changes until the Storyteller says so.
 */
export function RestorePrompt() {
  const o = useOffer();
  const answered = useBackups((s) => s.answered);
  const knocking = useKnocks((s) => s.list.length > 0);
  if (!o || o.sig === answered || knocking) return null;
  return (
    <div className="slayer-prompt nominate-prompt profile-prompt surface" role="alertdialog" aria-label="Restore players’ profiles">
      <span className="eyebrow">
        <Icon name="trophy" /> Players’ profiles
      </span>
      <OfferText o={o} />
      <div className="slayer-choice">
        <button className="btn" onClick={() => backups.dismiss(o)}>
          Not now
        </button>
        <button className="btn primary" onClick={() => restore(o)}>
          <Icon name="download" /> Restore them
        </button>
      </div>
    </div>
  );
}

/** The same offer, inside the Profiles panel (after "Restore from players"). */
export function RestoreOffer() {
  const o = useOffer();
  const asked = useBackups((s) => s.asked);
  const players = useBackups((s) => Object.keys(s.copies).length);
  if (!asked && !o) return null;
  return (
    <div className="profiles-restore">
      {o ? (
        <>
          <OfferText o={o} />
          <div className="slayer-choice">
            <button className="btn small primary" onClick={() => restore(o)}>
              <Icon name="download" /> Restore them
            </button>
          </div>
        </>
      ) : (
        <p>
          {players
            ? 'The players’ copies have nothing newer than the profiles here.'
            : 'Asking the players here for their copies… Anyone who arrives from now on is asked too.'}
        </p>
      )}
    </div>
  );
}

/** Storyteller: someone is joining as a name another device has. In they come, or not. */
export function DoorPrompt() {
  const list = useKnocks((s) => s.list);
  const book = useProfiles((s) => s.profiles);
  const k = list[0];
  if (!k) return null;
  const known = book[nameKey(k.name)]?.devices?.length ?? 0;
  return (
    <div className="slayer-prompt nominate-prompt profile-prompt surface" role="alertdialog" aria-label="Someone at the door">
      <span className="eyebrow">
        <Icon name="userPlus" /> A new device{list.length > 1 ? ` · ${list.length - 1} more waiting` : ''}
      </span>
      <h3>Someone is joining as {k.name} from a new device</h3>
      <p>
        {k.name} has played here from {plural(known, 'other device')}. If it’s really them (a new phone, another browser), let them in and this one is
        remembered too. If not, they’re asked to choose another name.
      </p>
      <div className="slayer-choice">
        <button className="btn" onClick={() => void hostLink.answerKnock(k.playerId, false)}>
          Not them
        </button>
        <button className="btn primary" onClick={() => void hostLink.answerKnock(k.playerId, true)}>
          <Icon name="check" /> Let them in
        </button>
      </div>
    </div>
  );
}
