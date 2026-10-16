const TABLE = () => process.env.AIRTABLE_TABLE_NAME || 'Prospects';

function config() {
  const token = process.env.AIRTABLE_API_KEY || '';
  const baseId = process.env.AIRTABLE_BASE_ID || '';
  if (!token || !baseId) {
    const err = new Error("L'enregistrement des coordonnées est indisponible pour le moment.");
    err.status = 500;
    throw err;
  }
  return { token, baseId, table: TABLE() };
}

function escapeFormula(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function airtableRequest(pathAndQuery, options = {}) {
  const { token, baseId } = config();
  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${pathAndQuery}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data?.error?.message || "Airtable a refusé l'enregistrement");
    err.status = response.status;
    err.airtableType = data?.error?.type || '';
    throw err;
  }
  return data;
}

function unknownField(error) {
  const match = String(error.message || '').match(/Unknown field name: "([^"]+)"/);
  return match ? match[1] : null;
}

function rejectedChoice(error) {
  const message = String(error.message || '');
  const match = message.match(/select option ["“]([^"”]+)["”]/i);
  return match ? match[1] : null;
}

async function writeFields(method, recordPath, fields) {
  const remaining = { ...fields };
  const dropped = [];
  while (Object.keys(remaining).length) {
    try {
      const result = await airtableRequest(recordPath, {
        method,
        body:
          method === 'POST'
            ? { records: [{ fields: remaining }], typecast: true }
            : { fields: remaining, typecast: true },
      });
      if (dropped.length) {
        console.warn('Airtable fields skipped (missing in base):', dropped.join(', '));
      }
      return { result, dropped };
    } catch (error) {
      const missing = unknownField(error);
      const choice = rejectedChoice(error);
      const dropSource =
        choice === 'evaluation' ||
        (/select option/i.test(error.message || '') && /evaluation/.test(error.message || ''));
      const key = missing || (dropSource && 'source' in remaining ? 'source' : null);
      if (!key || !(key in remaining) || error.status !== 422) throw error;
      delete remaining[key];
      dropped.push(key);
    }
  }
  const err = new Error('Aucun champ Airtable reconnu');
  err.status = 500;
  throw err;
}

async function findByEmail(email) {
  const formula = `LOWER({email})='${escapeFormula(email.toLowerCase())}'`;
  const query = `${encodeURIComponent(config().table)}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;
  const data = await airtableRequest(query);
  return data.records?.[0] || null;
}

function pickDefined(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== '') out[key] = value;
  }
  return out;
}

/**
 * Upsert Prospects by email.
 * Form "métier" maps to existing Airtable column "poste".
 */
async function upsertProspect(profile) {
  const table = encodeURIComponent(config().table);
  const fields = pickDefined({
    prenom: profile.prenom,
    nom: profile.nom,
    nom_complet: `${profile.prenom || ''} ${profile.nom || ''}`.trim() || undefined,
    email: profile.email,
    telephone: profile.telephone,
    poste: profile.metier,
    niveau_declare: profile.niveauDeclare,
    profil_qcm: profile.profilQcm,
    score: profile.score,
    niveau_calcule: profile.niveauCalcule,
    recommandation: profile.recommandation,
    date_dernier_passage: profile.dateDernierPassage,
  });

  const existing = await findByEmail(profile.email);
  if (existing) {
    const { dropped } = await writeFields('PATCH', `${table}/${existing.id}`, fields);
    return { id: existing.id, created: false, dropped };
  }

  const { result: created, dropped } = await writeFields('POST', table, {
    ...fields,
    statut: 'nouveau',
    offre_cible: 'Formation IA',
    source: 'evaluation',
    notes: "Formulaire d'évaluation de niveau IA — digitalprocessgrp.com/evaluation",
  });
  const id = created.records?.[0]?.id;
  if (!id) {
    const err = new Error("L'enregistrement des coordonnées a échoué.");
    err.status = 502;
    throw err;
  }
  return { id, created: true, dropped };
}

async function saveEvaluationLead(profile) {
  return upsertProspect({
    ...profile,
    dateDernierPassage: profile.dateDernierPassage || new Date().toISOString(),
  });
}

async function saveEvaluationResult(profile) {
  return upsertProspect({
    ...profile,
    dateDernierPassage: profile.dateDernierPassage || new Date().toISOString(),
  });
}

module.exports = {
  saveEvaluationLead,
  saveEvaluationResult,
  upsertProspect,
  findByEmail,
};
