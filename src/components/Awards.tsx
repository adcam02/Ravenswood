import { useState } from 'react';
import { useProgress } from '../game/progress';
import { FEATS, HATS, hatSpeedLabel } from '../world/types';
import { Modal } from './Modal';

/**
 * Everything a player can earn: the hats (worn from the customiser) and the achievements, with how to get
 * the ones still to come. Secret ones stay a question mark until they're found. All of it is kept in this browser.
 */
export function AwardsModal() {
  const progress = useProgress();
  const [tab, setTab] = useState<'feats' | 'hats'>('feats');
  const feats = FEATS.map((f) => ({ ...f, got: progress.feats.includes(f.id) }));
  const hats = HATS.map((h) => ({ ...h, got: h.unlocked(progress) }));
  const gotFeats = feats.filter((f) => f.got).length;
  const gotHats = hats.filter((h) => h.got).length;
  return (
    <Modal
      title="Awards"
      eyebrow={`${gotFeats} of ${feats.length} achievements · ${gotHats} of ${hats.length} hats`}
      size="lg"
      className="awards-modal"
      head={
        <div className="awards-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'feats'} className={tab === 'feats' ? 'on' : ''} onClick={() => setTab('feats')}>
            Achievements
          </button>
          <button role="tab" aria-selected={tab === 'hats'} className={tab === 'hats' ? 'on' : ''} onClick={() => setTab('hats')}>
            Hats
          </button>
        </div>
      }
    >
      {tab === 'hats' && (
        <p className="awards-speed">
          Each hat you own: +0.1% speed. With {gotHats} you’re {hatSpeedLabel(gotHats)} quicker about town.
        </p>
      )}
      <ul className="awards-list">
        {(tab === 'feats' ? feats : hats).map((a) => {
          const hidden = !a.got && a.secret;
          const hat = 'hat' in a && a.hat ? HATS.find((h) => h.id === a.hat) : undefined;
          return (
            <li key={a.id} className={`award ${a.got ? 'got' : 'locked'} ${a.secret ? 'secret' : ''}`}>
              <span className="award-icon">{hidden ? '❓' : a.icon}</span>
              <div>
                <strong>{hidden ? 'A secret' : a.name}</strong>
                <span>{hidden ? 'Keep exploring Ravenswood…' : a.how}</span>
                {hat && !hidden && <em>{a.got ? `Unlocked the ${hat.name.toLowerCase()}` : `Comes with the ${hat.name.toLowerCase()}`}</em>}
              </div>
              <span className="award-state">{a.got ? '✓' : '🔒'}</span>
            </li>
          );
        })}
      </ul>
      <p className="awards-note">Your name, your animal and everything you earn are kept in this browser, so they’re here next time you play.</p>
    </Modal>
  );
}
