import { useEffect, useState } from 'react';
import { useClient } from '../net/client';
import { Icon } from './Icon';

/** How long everyone's eyes are closed as the automated night begins. */
const VEIL_MS = 6000;

/**
 * As the Storyteller's automated night begins, every player's screen goes dark for the same few seconds, whether
 * their character acts tonight or not, so nobody can tell from anyone else's moment who is being asked something.
 * Questions arriving meanwhile wait underneath.
 */
export function NightVeil() {
  const at = useClient((s) => s.pub?.nightFall);
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  // From when this screen hears of it (a slow line hears late, and its questions come late too), unless the page was
  // opened long after nightfall.
  useEffect(() => {
    if (!at || Date.now() + useClient.getState().clockOffset - at > 30000) return;
    setNow(Date.now());
    setUntil(Date.now() + VEIL_MS);
  }, [at]);
  useEffect(() => {
    if (until <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [until]);
  const left = until - now;
  if (left <= 0) return null;
  return (
    <div className={`night-veil ${left < 900 ? 'lifting' : ''}`} aria-live="polite">
      <div className="night-veil-words">
        <Icon name="moon" />
        <strong>Night falls on Ravenswood</strong>
        <span>Close your eyes. If your character wakes tonight, the Storyteller will ask you in a moment.</span>
      </div>
    </div>
  );
}
