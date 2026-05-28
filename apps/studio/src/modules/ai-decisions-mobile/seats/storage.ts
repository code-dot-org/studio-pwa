/**
 * localStorage adapter for the mobile prototype seat storage.
 *
 * Drop-in replacement for the Capacitor Preferences adapter:
 * same exported functions, same key namespace, same async API surface.
 */

import type {JourneyProgress, Seat, SeatId, SeatIndex} from './types';

export const KEY_SCHEMA_VERSION = 'meta:schema-version';
export const KEY_SEATS_INDEX = 'seats:index';

export function keySeatProfile(seatId: SeatId): string {
  return `seats:profile:${seatId}`;
}

export function keySeatProgress(seatId: SeatId): string {
  return `seats:progress:${seatId}`;
}

export function keyLevelState(seatId: SeatId, levelId: string): string {
  return `seats:level-state:${seatId}:${levelId}`;
}

export async function prefsGet<T>(key: string): Promise<T | null> {
  const value = localStorage.getItem(key);
  if (value === null) return null;
  return JSON.parse(value) as T;
}

export async function prefsSet<T>(key: string, value: T): Promise<void> {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function prefsRemove(key: string): Promise<void> {
  localStorage.removeItem(key);
}

export async function readSchemaVersion(): Promise<number> {
  return (await prefsGet<number>(KEY_SCHEMA_VERSION)) ?? 0;
}

export async function writeSchemaVersion(v: number): Promise<void> {
  await prefsSet(KEY_SCHEMA_VERSION, v);
}

export async function readSeatIndex(): Promise<SeatIndex> {
  return (
    (await prefsGet<SeatIndex>(KEY_SEATS_INDEX)) ?? {
      seats: [],
      activeSeatId: null,
    }
  );
}

export async function writeSeatIndex(index: SeatIndex): Promise<void> {
  await prefsSet(KEY_SEATS_INDEX, index);
}

export async function readSeatProfile(seatId: SeatId): Promise<Seat | null> {
  return prefsGet<Seat>(keySeatProfile(seatId));
}

/** Write profile BEFORE updating index (atomicity convention). */
export async function writeSeatProfile(seat: Seat): Promise<void> {
  await prefsSet(keySeatProfile(seat.id), seat);
}

export async function removeSeatProfile(seatId: SeatId): Promise<void> {
  await prefsRemove(keySeatProfile(seatId));
}

export async function readSeatProgress(
  seatId: SeatId,
): Promise<JourneyProgress | null> {
  return prefsGet<JourneyProgress>(keySeatProgress(seatId));
}

export const PROGRESS_UPDATED_EVENT = 'mobile:progress-updated';

export async function writeSeatProgress(
  progress: JourneyProgress,
): Promise<void> {
  await prefsSet(keySeatProgress(progress.seatId), progress);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PROGRESS_UPDATED_EVENT, {
        detail: {seatId: progress.seatId},
      }),
    );
  }
}

export async function removeSeatProgress(seatId: SeatId): Promise<void> {
  await prefsRemove(keySeatProgress(seatId));
}

export async function readLevelState<T>(
  seatId: SeatId,
  levelId: string,
): Promise<T | null> {
  return prefsGet<T>(keyLevelState(seatId, levelId));
}

export async function writeLevelState<T>(
  seatId: SeatId,
  levelId: string,
  state: T,
): Promise<void> {
  await prefsSet(keyLevelState(seatId, levelId), state);
}

export async function removeLevelState(
  seatId: SeatId,
  levelId: string,
): Promise<void> {
  await prefsRemove(keyLevelState(seatId, levelId));
}

export async function removeAllLevelStates(
  seatId: SeatId,
  levelIds: string[],
): Promise<void> {
  await Promise.all(levelIds.map(id => removeLevelState(seatId, id)));
}
