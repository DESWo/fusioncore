/* Snapshot and restore every FusionCore save, from the browser console.
 *
 * WHY THIS FILE EXISTS
 * On 2026-08-03 an agent was told "back up the saves before browser testing".
 * It did: into a JavaScript variable on the page. Then it reloaded the page,
 * which cleared the variable, and its test save overwrote the real one. The
 * career was recoverable only because a copy happened to be sitting in a
 * scratch directory.
 *
 * The instruction was not wrong, it was underspecified. "Back up the saves"
 * leaves the method to whoever reads it, and a page-scoped variable is an
 * obvious-looking answer that silently fails. So the method is written down
 * here instead of being reinvented each time.
 *
 * Saves live in TWO places and a snapshot must cover both:
 *   localStorage   fusioncore_career_v1, fusioncore_career_runs_v1
 *   IndexedDB      keyval-store -> fusioncore_save_v2_fusion / _fission
 * Anything that only reads localStorage will silently miss the reactor runs.
 *
 * USAGE, in the browser console on the running app:
 *
 *   1. Paste this whole file.
 *   2. await fcSnapshot()      -> prints one JSON line. SAVE IT TO A FILE.
 *                                 Not a variable. A file. Reloads kill
 *                                 variables; that is the whole bug.
 *   3. ...do your testing...
 *   4. await fcRestore(json)   -> pass the text back in, verifies as it goes.
 *
 * fcRestore refuses to run on a snapshot that does not parse, and reports
 * every key it wrote with its byte count so a silent partial restore is
 * visible rather than assumed.
 */

const FC_LS_KEYS = [
  'fusioncore_career_v1',
  'fusioncore_career_runs_v1',
];
const FC_IDB_DB = 'keyval-store';
const FC_IDB_STORE = 'keyval';

function fcOpenDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(FC_IDB_DB);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function fcIdbEntries() {
  const dbs = await indexedDB.databases();
  if (!dbs.some((d) => d.name === FC_IDB_DB)) return {};
  const db = await fcOpenDb();
  if (!db.objectStoreNames.contains(FC_IDB_STORE)) { db.close(); return {}; }
  const tx = db.transaction(FC_IDB_STORE, 'readonly');
  const store = tx.objectStore(FC_IDB_STORE);
  const keys = await new Promise((r) => { const q = store.getAllKeys(); q.onsuccess = () => r(q.result); });
  const vals = await new Promise((r) => { const q = store.getAll(); q.onsuccess = () => r(q.result); });
  db.close();
  return Object.fromEntries(keys.map((k, i) => [k, vals[i]]));
}

/** Everything, as one JSON string. Save the output to a FILE. */
async function fcSnapshot() {
  const local = {};
  for (const k of FC_LS_KEYS) local[k] = localStorage.getItem(k);
  const idb = await fcIdbEntries();
  const snap = { takenAt: new Date().toISOString(), local, idb };
  const json = JSON.stringify(snap);
  console.log(
    `snapshot: ${Object.values(local).filter(Boolean).length} localStorage keys, ` +
    `${Object.keys(idb).length} IndexedDB keys, ${json.length} bytes`,
  );
  console.log('SAVE THE NEXT LINE TO A FILE, NOT A VARIABLE:');
  console.log(json);
  return json;
}

/** Put it all back. Pass the JSON text from fcSnapshot. */
async function fcRestore(json) {
  const snap = typeof json === 'string' ? JSON.parse(json) : json;
  if (!snap || typeof snap !== 'object' || !('local' in snap) || !('idb' in snap)) {
    throw new Error('not a FusionCore snapshot: expected { local, idb }');
  }
  const report = { local: {}, idb: {} };

  for (const [k, v] of Object.entries(snap.local)) {
    if (v === null || v === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
    report.local[k] = v ? `${v.length} chars` : 'cleared';
  }

  const idbKeys = Object.keys(snap.idb);
  if (idbKeys.length) {
    const db = await fcOpenDb();
    const tx = db.transaction(FC_IDB_STORE, 'readwrite');
    const store = tx.objectStore(FC_IDB_STORE);
    for (const [k, v] of Object.entries(snap.idb)) {
      store.put(v, k);
      report.idb[k] = `${JSON.stringify(v ?? null).length} bytes`;
    }
    await new Promise((r, j) => { tx.oncomplete = r; tx.onerror = () => j(tx.error); });
    db.close();
  }

  console.log('restored:', report);
  console.log('reload the page to see it.');
  return report;
}

// Reachable from the console however this file was loaded.
if (typeof window !== 'undefined') {
  window.fcSnapshot = fcSnapshot;
  window.fcRestore = fcRestore;
}
