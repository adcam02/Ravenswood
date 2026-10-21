import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isMissingPart } from '../lib/lazy';

interface Props {
  children: ReactNode;
  /** What to show instead of the broken part. Without one, the whole page is replaced by a note. */
  fallback?: (error: Error) => ReactNode;
}

/**
 * Catches anything that goes wrong drawing the part of the page inside it, so one broken dialog or minigame
 * shows a note with a way out instead of blanking the whole game.
 */
export class Guard extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error);
    return (
      <div className="crashed cosy">
        <CrashNote error={error} />
      </div>
    );
  }
}

/** What went wrong, and a Reload button (plus a way back, when there is one). */
export function CrashNote({ error, close, closeLabel = 'Close' }: { error: Error; close?: () => void; closeLabel?: string }) {
  const missing = isMissingPart(error);
  return (
    <div className="crash-note cosy-panel" role="alert">
      <strong>{missing ? 'Ravenswood was updated' : 'Something went wrong'}</strong>
      <p>
        {missing ? 'A newer version went live while you were playing. ' : ''}
        Reload to carry on. Nothing is lost: your seat and the game are kept.
      </p>
      {!missing && <code>{error.message}</code>}
      <div className="crash-actions">
        {close && (
          <button className="cosy-btn small" onClick={close}>
            {closeLabel}
          </button>
        )}
        <button className="cosy-btn small primary" onClick={() => location.reload()}>
          Reload
        </button>
      </div>
    </div>
  );
}
