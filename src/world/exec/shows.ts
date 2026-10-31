import type { ExecMethod } from '../../state/types';
import { ExecStage } from './stage';
import { MORE_METHODS, MoreStage } from './stage2';

/**
 * Every way to be executed but the gallows, fetched together the first time one is needed (see lazyModule in the
 * engine): the first ten ways in stage.ts, the newer ones in stage2.ts.
 */
export { EXEC_CAM, STAGE_YAW, execCamera } from './stage';
export type { ExecFrame, ExecPose } from './stage';

export function makeStage(method: Exclude<ExecMethod, 'hang'>, survives: boolean, spot: { x: number; z: number; ry: number; y: number }, sound?: (name: string) => void): ExecStage {
  return (MORE_METHODS as readonly string[]).includes(method) ? new MoreStage(method, survives, spot, sound) : new ExecStage(method, survives, spot, sound);
}

/** A Slayer claim played out in the square (see slay.ts), fetched with the executions. */
export { SlayStage } from './slay';
