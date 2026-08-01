import { supabase } from './supabase';

// * ARCHITECTURE: Synchronization Engine
// NOTE: This module batches rapid consecutive updates into a single Supabase request
// to prevent rate limiting and optimize network traffic.
// ! CRITICAL: Always ensure `workspaceId` is present before queuing an upsert.
// TODO: Implement IndexedDB offline-first caching for progressive web app resilience.

let syncTimeout = null;
let pendingUpserts = { cards: new Map(), connections: new Map(), drawings: new Map() };
let pendingDeletes = { cards: new Set(), connections: new Set(), drawings: new Set() };

const flushSync = async (workspaceId) => {
  if (!workspaceId) return;

  // Snapshot and clear the queues
  const upserts = {
    cards: Array.from(pendingUpserts.cards.values()),
    connections: Array.from(pendingUpserts.connections.values()).map(c => ({
      id: c.id,
      source: c.source,
      target: c.target,
      type: c.type,
      label: c.label,
      workspace_id: c.workspace_id,
    })),
    drawings: Array.from(pendingUpserts.drawings.values()),
  };
  const deletes = {
    cards: Array.from(pendingDeletes.cards),
    connections: Array.from(pendingDeletes.connections),
    drawings: Array.from(pendingDeletes.drawings),
  };

  pendingUpserts = { cards: new Map(), connections: new Map(), drawings: new Map() };
  pendingDeletes = { cards: new Set(), connections: new Set(), drawings: new Set() };

  // Perform Supabase operations
  try {
    const promises = [];

    if (upserts.cards.length > 0) promises.push(supabase.from('cards').upsert(upserts.cards));
    if (upserts.connections.length > 0) {
      promises.push(
        supabase.from('connections').upsert(upserts.connections).then((res) => {
          if (res.error) console.error("Supabase Connection Error:", res.error);
          return res;
        })
      );
    }
    if (upserts.drawings.length > 0)
      promises.push(supabase.from('drawings').upsert(upserts.drawings));

    if (deletes.cards.length > 0)
      promises.push(supabase.from('cards').delete().in('id', deletes.cards));
    if (deletes.connections.length > 0)
      promises.push(supabase.from('connections').delete().in('id', deletes.connections));
    if (deletes.drawings.length > 0)
      promises.push(supabase.from('drawings').delete().in('id', deletes.drawings));

    await Promise.all(promises);
  } catch (err) {
    console.error('Failed to flush sync queue to Supabase:', err);
  }
};

export const queueUpsert = (table, item, workspaceId) => {
  if (!workspaceId) return;
  pendingUpserts[table].set(item.id, { ...item, workspace_id: workspaceId });
  pendingDeletes[table].delete(item.id);

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => flushSync(workspaceId), 800);
};

export const queueDelete = (table, id, workspaceId) => {
  if (!workspaceId) return;
  pendingDeletes[table].add(id);
  pendingUpserts[table].delete(id);

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => flushSync(workspaceId), 800);
};

export const queueDeletes = (table, ids, workspaceId) => {
  if (!workspaceId) return;
  ids.forEach((id) => {
    pendingDeletes[table].add(id);
    pendingUpserts[table].delete(id);
  });

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => flushSync(workspaceId), 800);
};
