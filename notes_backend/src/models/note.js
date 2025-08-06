const db = require('./db');

// PUBLIC_INTERFACE
async function createNote({ userId, title, content, tags }) {
  const result = await db.query(
    'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, user_id, title, content, created_at, updated_at',
    [userId, title, content]
  );
  const note = result.rows[0];
  await updateNoteTags(note.id, tags || []);
  note.tags = tags || [];
  return note;
}

// PUBLIC_INTERFACE
async function getNotesByUser({ userId, search, tags }) {
  let sql = 'SELECT n.*, ARRAY_REMOVE(ARRAY_AGG(t.name), NULL) as tags FROM notes n LEFT JOIN note_tags nt ON n.id = nt.note_id LEFT JOIN tags t ON nt.tag_id = t.id WHERE n.user_id = $1';
  const params = [userId];
  let i = 2;

  if (search) {
    sql += ` AND (LOWER(n.title) LIKE $${i} OR LOWER(n.content) LIKE $${i})`;
    params.push(`%${search.toLowerCase()}%`);
    i++;
  }
  if (tags && tags.length > 0) {
    sql += ` AND n.id IN (
      SELECT note_id FROM note_tags WHERE tag_id IN (
        SELECT id FROM tags WHERE name = ANY($${i})
      )
      GROUP BY note_id
      HAVING COUNT(DISTINCT tag_id) = $${i + 1}
    )`;
    params.push(tags, tags.length);
    i += 2;
  }
  sql += ' GROUP BY n.id ORDER BY n.updated_at DESC';
  const result = await db.query(sql, params);
  return result.rows;
}

// PUBLIC_INTERFACE
async function getNoteById({ userId, id }) {
  const result = await db.query(
    `SELECT n.*, ARRAY_REMOVE(ARRAY_AGG(t.name), NULL) as tags 
    FROM notes n 
    LEFT JOIN note_tags nt ON n.id = nt.note_id 
    LEFT JOIN tags t ON nt.tag_id = t.id 
    WHERE n.id = $1 AND n.user_id = $2
    GROUP BY n.id`, [id, userId]
  );
  return result.rows[0];
}

// PUBLIC_INTERFACE
async function updateNote({ userId, id, title, content, tags }) {
  const noteRes = await db.query(
    'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING id',
    [title, content, id, userId]
  );
  if (!noteRes.rowCount) return null;
  await updateNoteTags(id, tags || []);
  return getNoteById({ userId, id });
}

// PUBLIC_INTERFACE
async function deleteNote({ userId, id }) {
  const res = await db.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
  return res.rowCount > 0;
}

// PUBLIC_INTERFACE
async function getAllTags(userId) {
  const tagsResult = await db.query(`
    SELECT DISTINCT t.name FROM tags t
    INNER JOIN note_tags nt ON t.id = nt.tag_id
    INNER JOIN notes n ON n.id = nt.note_id
    WHERE n.user_id = $1
    ORDER BY t.name ASC`, [userId]);
  return tagsResult.rows.map(r => r.name);
}

// --- Helpers ---
async function updateNoteTags(noteId, tags) {
  await db.query('DELETE FROM note_tags WHERE note_id = $1', [noteId]);
  if (!tags || tags.length === 0) return;

  for (const tagName of tags) {
    let tagRes = await db.query('SELECT id FROM tags WHERE name = $1', [tagName]);
    let tagId;
    if (tagRes.rowCount === 0) {
      tagRes = await db.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [tagName]);
    }
    tagId = tagRes.rows[0].id;
    await db.query('INSERT INTO note_tags (note_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [noteId, tagId]);
  }
}

module.exports = {
  createNote,
  getNotesByUser,
  getNoteById,
  updateNote,
  deleteNote,
  getAllTags,
};
