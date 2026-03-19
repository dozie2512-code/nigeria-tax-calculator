/**
 * cloud-sync.js — Phase 1 Firestore persistence layer
 *
 * Adds cloud storage as the source of truth for businesses, members,
 * and ledger transactions while keeping localStorage as fallback/cache.
 *
 * Feature flags
 * ─────────────
 *   CLOUD_SYNC_ENABLED  – set false to disable all Firestore writes (demo mode).
 *
 * Firestore schema used
 * ─────────────────────
 *   businesses/{businessId}
 *   businesses/{businessId}/members/{uid}
 *   businesses/{businessId}/transactions/{txnId}
 *   businesses/{businessId}/billing/subscription   (read-only from client)
 *   users/{uid}                                    (profile + migration flag)
 *
 * Entitlement helper
 * ──────────────────
 *   getEffectivePlan(businessId)  → Promise<{plan, status, currentPeriodEnd}>
 *   isFeatureEnabled(featureName, businessId) → Promise<boolean>
 */

(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* 1. Feature flag                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Set to false to disable all Firestore writes (demo / offline mode).
   * Automatically set to false when Firestore is not initialised.
   */
  var CLOUD_SYNC_ENABLED = true;

  /* ------------------------------------------------------------------ */
  /* 2. Internal helpers                                                   */
  /* ------------------------------------------------------------------ */

  function getDb() {
    // firebaseDb is initialised by the Firebase config block in index.html
    return (typeof firebaseDb !== 'undefined') ? firebaseDb : null;
  }

  function getAuth() {
    return (typeof firebaseAuth !== 'undefined') ? firebaseAuth : null;
  }

  function currentFirebaseUser() {
    var auth = getAuth();
    return auth ? auth.currentUser : null;
  }

  function isEnabled() {
    return CLOUD_SYNC_ENABLED && getDb() !== null;
  }

  function serverTs() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  /* ------------------------------------------------------------------ */
  /* 3. Plan / entitlement helpers                                        */
  /* ------------------------------------------------------------------ */

  /**
   * Feature-flag map: which features require which plan level.
   * Plan order (ascending): demo < Business < Company < Enterprise
   */
  var PLAN_LEVELS = { demo: 0, Business: 1, Company: 2, Enterprise: 3, 'Enterprise Plus': 4 };

  var FEATURE_PLAN_REQUIREMENTS = {
    bankReconciliation:  'Enterprise',
    journalEntry:        'Enterprise',
    payables:            'Enterprise',
    cgt:                 'Company',
    cit:                 'Company',
    multipleBusinesses:  'Company',
    vatTracking:         'Business',
    whtTracking:         'Business',
    payeTracking:        'Business',
    reports:             'Business'
  };

  /**
   * Read the Firestore billing/subscription doc for a business.
   * Falls back to { plan: 'demo', status: 'demo' } when offline or doc absent.
   *
   * @param {string} businessId
   * @returns {Promise<{plan:string, status:string, currentPeriodEnd:Date|null}>}
   */
  function getEffectivePlan(businessId) {
    if (!isEnabled() || !businessId) {
      return Promise.resolve({ plan: 'demo', status: 'demo', currentPeriodEnd: null });
    }
    return getDb()
      .collection('businesses').doc(businessId)
      .collection('billing').doc('subscription')
      .get()
      .then(function (doc) {
        if (!doc.exists) {
          // No subscription doc — treat as permissive demo plan so the app
          // still works while Phase 2 Stripe integration is being wired up.
          return { plan: 'demo', status: 'demo', currentPeriodEnd: null };
        }
        var d = doc.data();
        return {
          plan: d.plan || 'demo',
          status: d.status || 'demo',
          currentPeriodEnd: d.currentPeriodEnd ? d.currentPeriodEnd.toDate() : null
        };
      })
      .catch(function () {
        return { plan: 'demo', status: 'demo', currentPeriodEnd: null };
      });
  }

  /**
   * Returns true when the named feature is available for the business's plan.
   * Defaults to permissive (true) in demo/local mode so nothing is locked out
   * before Phase 2 enforcement is activated.
   *
   * @param {string} featureName  – key from FEATURE_PLAN_REQUIREMENTS
   * @param {string} businessId
   * @returns {Promise<boolean>}
   */
  function isFeatureEnabled(featureName, businessId) {
    return getEffectivePlan(businessId).then(function (sub) {
      var required = FEATURE_PLAN_REQUIREMENTS[featureName];
      if (!required) return true; // unknown feature → allow
      if (sub.status === 'demo') return true; // permissive in demo mode
      var userLevel = PLAN_LEVELS[sub.plan] || 0;
      var reqLevel  = PLAN_LEVELS[required] || 0;
      return userLevel >= reqLevel;
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Business operations                                               */
  /* ------------------------------------------------------------------ */

  /**
   * Write (create or update) a business document.
   * Also creates the owner membership record.
   *
   * @param {object} business  – local business object (must have .id)
   * @param {string} ownerUid  – Firebase uid of the owner
   * @returns {Promise<void>}
   */
  function syncBusiness(business, ownerUid) {
    if (!isEnabled() || !business || !business.id) return Promise.resolve();
    var db = getDb();
    var bizRef = db.collection('businesses').doc(business.id);
    var batch = db.batch();

    batch.set(bizRef, {
      id:         business.id,
      name:       business.name || '',
      entity:     business.entity || '',
      ownerUid:   ownerUid || null,
      currency:   business.currency || 'NGN',
      vatRate:    business.vatRate  != null ? business.vatRate  : 7.5,
      whtRate:    business.whtRate  != null ? business.whtRate  : 5.0,
      citRate:    business.citRate  != null ? business.citRate  : 30.0,
      vatEnabled: business.vatEnabled !== false,
      payeEnabled:business.payeEnabled !== false,
      pitEnabled: business.pitEnabled !== false,
      citEnabled: business.citEnabled !== false,
      periodStart:business.periodStart || null,
      periodEnd:  business.periodEnd   || null,
      createdAt:  business.createdAt   ? new Date(business.createdAt) : serverTs(),
      updatedAt:  serverTs()
    }, { merge: true });

    // Owner membership
    if (ownerUid) {
      var memberRef = bizRef.collection('members').doc(ownerUid);
      batch.set(memberRef, {
        uid:     ownerUid,
        role:    'owner',
        addedAt: serverTs()
      }, { merge: true });
    }

    return batch.commit().catch(function (e) {
      console.warn('[cloud-sync] syncBusiness failed:', e.message);
    });
  }

  /**
   * Load all businesses where the current user is a member.
   * Returns an array of plain business objects (Firestore data).
   *
   * @param {string} uid – Firebase uid
   * @returns {Promise<object[]>}
   */
  function loadUserBusinesses(uid) {
    if (!isEnabled() || !uid) return Promise.resolve([]);
    var db = getDb();

    // Strategy: query each business whose members/{uid} document exists.
    // For Phase 1 we do a collection-group query on "members" filtered by uid.
    // Requires a composite index: collectionGroup=members, field=uid.
    // Falls back to empty array if the index is not yet deployed.
    return db.collectionGroup('members')
      .where('uid', '==', uid)
      .get()
      .then(function (snap) {
        var promises = snap.docs.map(function (memberDoc) {
          // memberDoc.ref.parent.parent is the business doc
          return memberDoc.ref.parent.parent.get();
        });
        return Promise.all(promises);
      })
      .then(function (bizDocs) {
        return bizDocs
          .filter(function (d) { return d.exists; })
          .map(function (d) { return d.data(); });
      })
      .catch(function (e) {
        console.warn('[cloud-sync] loadUserBusinesses failed (index may be missing):', e.message);
        return [];
      });
  }

  /* ------------------------------------------------------------------ */
  /* 5. Transaction operations                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Write a single transaction to Firestore.
   *
   * @param {string} businessId
   * @param {object} txn  – transaction object (must have .id)
   * @returns {Promise<void>}
   */
  function syncTransaction(businessId, txn) {
    if (!isEnabled() || !businessId || !txn || !txn.id) return Promise.resolve();
    return getDb()
      .collection('businesses').doc(businessId)
      .collection('transactions').doc(txn.id)
      .set(Object.assign({}, txn, { _syncedAt: serverTs() }), { merge: true })
      .catch(function (e) {
        console.warn('[cloud-sync] syncTransaction failed:', e.message);
      });
  }

  /**
   * Delete a transaction document from Firestore.
   *
   * @param {string} businessId
   * @param {string} txnId
   * @returns {Promise<void>}
   */
  function deleteTransaction(businessId, txnId) {
    if (!isEnabled() || !businessId || !txnId) return Promise.resolve();
    return getDb()
      .collection('businesses').doc(businessId)
      .collection('transactions').doc(txnId)
      .delete()
      .catch(function (e) {
        console.warn('[cloud-sync] deleteTransaction failed:', e.message);
      });
  }

  /**
   * Load all transactions for a business from Firestore.
   * Returns an array ordered by date ascending.
   *
   * @param {string} businessId
   * @returns {Promise<object[]>}
   */
  function loadTransactions(businessId) {
    if (!isEnabled() || !businessId) return Promise.resolve([]);
    return getDb()
      .collection('businesses').doc(businessId)
      .collection('transactions')
      .orderBy('date', 'asc')
      .get()
      .then(function (snap) {
        return snap.docs.map(function (d) { return d.data(); });
      })
      .catch(function (e) {
        console.warn('[cloud-sync] loadTransactions failed:', e.message);
        return [];
      });
  }

  /* ------------------------------------------------------------------ */
  /* 6. One-time localStorage → Firestore migration                       */
  /* ------------------------------------------------------------------ */

  var MIGRATION_LS_KEY   = 'ntc_cloud_migration_done';
  var MIGRATION_FS_FIELD = 'migrationComplete';

  /**
   * Check whether migration has already been performed for this uid.
   *
   * @param {string} uid
   * @returns {Promise<boolean>}
   */
  function isMigrationComplete(uid) {
    // Fast path: localStorage marker
    var lsKey = MIGRATION_LS_KEY + '_' + uid;
    if (localStorage.getItem(lsKey) === 'true') return Promise.resolve(true);

    if (!isEnabled()) return Promise.resolve(false);

    return getDb().collection('users').doc(uid).get()
      .then(function (doc) {
        return doc.exists && doc.data()[MIGRATION_FS_FIELD] === true;
      })
      .catch(function () { return false; });
  }

  /**
   * Migrate local businesses + transactions belonging to a given local userId
   * into Firestore under the authenticated Firebase uid.
   *
   * This function is idempotent: it uses set-with-merge so re-running it will
   * not create duplicates.
   *
   * @param {string} localUserId  – the app's internal user id
   * @param {string} firebaseUid  – Firebase Auth uid
   * @param {object} appState     – the full local state object
   * @returns {Promise<{migrated: number, errors: string[]}>}
   */
  function migrateLocalToCloud(localUserId, firebaseUid, appState) {
    if (!isEnabled() || !localUserId || !firebaseUid || !appState) {
      return Promise.resolve({ migrated: 0, errors: ['Cloud sync not available'] });
    }

    var db     = getDb();
    var errors = [];
    var total  = 0;

    // Find businesses owned by this local user
    var businesses = (appState.businesses || []).filter(function (b) {
      return b.userId === localUserId || b.ownerId === localUserId;
    });

    if (businesses.length === 0) {
      // No businesses to migrate; mark done anyway
      return _markMigrationComplete(db, firebaseUid, localUserId)
        .then(function () { return { migrated: 0, errors: [] }; });
    }

    var promises = businesses.map(function (biz) {
      // Sync business doc + owner member record
      return syncBusiness(biz, firebaseUid)
        .then(function () {
          // Sync transactions
          var txns = (
            (appState.transactions[localUserId] && appState.transactions[localUserId][biz.id]) ||
            appState.transactions[biz.id] ||
            []
          );
          var txnPromises = txns.map(function (txn) {
            total++;
            return syncTransaction(biz.id, txn);
          });
          return Promise.all(txnPromises);
        })
        .catch(function (e) {
          errors.push('Business ' + biz.id + ': ' + e.message);
        });
    });

    return Promise.all(promises)
      .then(function () {
        return _markMigrationComplete(db, firebaseUid, localUserId);
      })
      .then(function () {
        return { migrated: total, errors: errors };
      });
  }

  function _markMigrationComplete(db, firebaseUid, localUserId) {
    // Mark in Firestore
    var fsPromise = db.collection('users').doc(firebaseUid).set(
      { [MIGRATION_FS_FIELD]: true, migrationAt: serverTs(), localUserId: localUserId },
      { merge: true }
    ).catch(function () {});

    // Mark in localStorage (fast path for next check)
    try {
      localStorage.setItem(MIGRATION_LS_KEY + '_' + firebaseUid, 'true');
    } catch (e) {}

    return fsPromise;
  }

  /* ------------------------------------------------------------------ */
  /* 7. Login hook                                                        */
  /* ------------------------------------------------------------------ */

  /**
   * Called by index.html immediately after a successful Firebase sign-in.
   * Loads cloud businesses, merges them into the local state, and checks
   * whether a localStorage → Firestore migration should be offered.
   *
   * @param {string} firebaseUid
   * @param {string} localUserId   – app's internal user id
   * @param {object} appState      – reference to the live state object
   * @param {function} onComplete  – callback(needsMigration: boolean)
   */
  function onUserSignedIn(firebaseUid, localUserId, appState, onComplete) {
    if (!isEnabled()) {
      if (typeof onComplete === 'function') onComplete(false);
      return;
    }

    // Load cloud businesses for this user
    loadUserBusinesses(firebaseUid)
      .then(function (cloudBizList) {
        if (cloudBizList.length > 0) {
          // Merge cloud businesses into local state (cloud wins for existing ids)
          cloudBizList.forEach(function (cloudBiz) {
            var idx = (appState.businesses || []).findIndex(function (b) { return b.id === cloudBiz.id; });
            if (idx >= 0) {
              appState.businesses[idx] = Object.assign(appState.businesses[idx], cloudBiz);
            } else {
              appState.businesses = appState.businesses || [];
              appState.businesses.push(cloudBiz);
            }
          });
        }
      })
      .catch(function (e) {
        console.warn('[cloud-sync] onUserSignedIn loadUserBusinesses error:', e.message);
      })
      .then(function () {
        // Check if migration is needed
        return isMigrationComplete(firebaseUid);
      })
      .then(function (done) {
        var hasLocalData = (appState.businesses || []).some(function (b) {
          var userId = b.userId || b.ownerId;
          return userId === localUserId;
        });
        var needsMigration = !done && hasLocalData;
        if (typeof onComplete === 'function') onComplete(needsMigration);
      })
      .catch(function (e) {
        console.warn('[cloud-sync] onUserSignedIn error:', e.message);
        if (typeof onComplete === 'function') onComplete(false);
      });
  }

  /* ------------------------------------------------------------------ */
  /* 8. Expose public API on window.cloudSync                             */
  /* ------------------------------------------------------------------ */

  global.cloudSync = {
    // Feature flag (readable/writable)
    get enabled() { return CLOUD_SYNC_ENABLED; },
    set enabled(v) { CLOUD_SYNC_ENABLED = !!v; },

    // Business
    syncBusiness:       syncBusiness,
    loadUserBusinesses: loadUserBusinesses,

    // Transactions
    syncTransaction:    syncTransaction,
    deleteTransaction:  deleteTransaction,
    loadTransactions:   loadTransactions,

    // Migration
    isMigrationComplete:  isMigrationComplete,
    migrateLocalToCloud:  migrateLocalToCloud,

    // Login hook
    onUserSignedIn: onUserSignedIn,

    // Entitlements
    getEffectivePlan: getEffectivePlan,
    isFeatureEnabled: isFeatureEnabled
  };

}(window));
