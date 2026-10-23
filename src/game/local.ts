import { create } from 'zustand';
import { toPose, type Item, type Pose, type PoseState } from '../world/types';

/** This browser's own animal: where it is and what it's doing. The 3D world moves it; the network reports it. */
export const local: PoseState = {
  x: 0,
  z: 0,
  ry: Math.PI,
  zone: 'town',
  anim: 'idle',
  item: null,
  speaking: false,
  voiceId: null,
  // (Until the mic is on, nobody can hear us.)
  muted: true,
  shout: false,
  entering: null,
};

/** Things the HUD shows about the local animal. */
export const useLocal = create<{ item: Item | null; gift: { item: Item; from: string | null; key: number } | null }>(() => ({
  item: null,
  gift: null,
}));

export function setItem(item: Item | null) {
  local.item = item;
  useLocal.setState({ item });
}

/** Something put in our paw by someone else, or taken from the bar or shelf. */
export function receiveItem(item: Item, from: string | null) {
  setItem(item);
  useLocal.setState({ gift: { item, from, key: Date.now() } });
}

let sender: ((p: Pose) => void) | null = null;
let lastJson = '';
let lastSent = 0;

/** Starts reporting our pose about ten times a second while it changes, and every second otherwise. */
export function reportPoseWith(send: ((p: Pose) => void) | null) {
  sender = send;
}

setInterval(() => {
  if (!sender) return;
  const pose = toPose(local);
  const json = JSON.stringify(pose);
  const now = Date.now();
  if (json === lastJson && now - lastSent < 1000) return;
  lastJson = json;
  lastSent = now;
  sender(pose);
}, 100);
