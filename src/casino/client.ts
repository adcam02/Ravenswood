import { useEffect, useState } from 'react';
import { player, useClient } from '../net/client';
import { casinoFor, useCasino } from './host';
import type { CasinoAction, CasinoView } from './types';

let stView: { rev: number; view: CasinoView | null } | null = null;
/**
 * The casino as this screen sees it: a player's own view from the Storyteller, or for the Storyteller (watching,
 * not playing), the tables with nobody's hole cards showing.
 */
export function casinoNow(mode: 'st' | 'player' | 'preview'): CasinoView | null {
  if (mode === 'st') {
    const rev = useCasino.getState().rev;
    if (stView?.rev !== rev) stView = { rev, view: casinoFor(null) };
    return stView.view;
  }
  return useClient.getState().priv?.casino ?? null;
}

export function useCasinoView(mode: 'st' | 'player'): CasinoView | null {
  const priv = useClient((s) => (mode === 'player' ? (s.priv?.casino ?? null) : null));
  const rev = useCasino((s) => (mode === 'st' ? s.rev : 0));
  const [st, setSt] = useState<CasinoView | null>(() => (mode === 'st' ? casinoFor(null) : null));
  useEffect(() => {
    if (mode === 'st') setSt(casinoFor(null));
  }, [mode, rev]);
  return mode === 'st' ? st : priv;
}

export const casino = (a: CasinoAction) => player.casino(a);

/** The host's clock, as near as this screen knows it. */
export const hostNow = () => Date.now() + (useClient.getState().clockOffset || 0);
