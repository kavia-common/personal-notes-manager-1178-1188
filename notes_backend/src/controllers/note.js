const noteModel = require('../models/note');

// PUBLIC_INTERFACE
async function createNote(req, res) {
  /**
   * Create a new note
   * POST /notes
   * { title, content, tags }
   */
  const { title, content, tags } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  const note = await noteModel.createNote({
    userId: req.user.id,
    title,
    content: content || '',
    tags: tags || [],
  });
  return res.status(201).json(note);
}

// PUBLIC_INTERFACE
async function getNotes(req, res) {
  /**
   * Get all notes for user (optionally filter by search, tags)
   * GET /notes?search=<str>&tags=tag1,tag2
   */
  const search = req.query.search || null;
  const tags = req.query.tags ? req.query.tags.split(',') : null;
  const notes = await noteModel.getNotesByUser({
    userId: req.user.id,
    search,
    tags,
  });
  return res.json(notes);
}

// PUBLIC_INTERFACE
async function getNote(req, res) {
  /**
   * Get a specific note by ID
   * GET /notes/:id
   */
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid note id.' });
  const note = await noteModel.getNoteById({ userId: req.user.id, id });
  if (!note) return res.status(404).json({ error: 'Not found.' });
  return res.json(note);
}

// PUBLIC_INTERFACE
async function updateNote(req, res) {
  /**
   * Update a note by ID
   * PUT /notes/:id
   */
  const id = parseInt(req.params.id, 10);
  const { title, content, tags } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  const note = await noteModel.updateNote({
    userId: req.user.id,
    id,
    title,
    content: content || '',
    tags: tags || [],
  });
  if (!note) return res.status(404).json({ error: 'Not found.' });
  return res.json(note);
}

// PUBLIC_INTERFACE
async function deleteNote(req, res) {
  /**
   * Delete a note by ID
   * DELETE /notes/:id
   */
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid note id.' });
  const deleted = await noteModel.deleteNote({ userId: req.user.id, id });
  if (!deleted) return res.status(404).json({ error: 'Not found.' });
  return res.json({ success: true });
}

// PUBLIC_INTERFACE
async function getTags(req, res) {
  /**
   * Get all tags for user
   * GET /tags
   */
  const tags = await noteModel.getAllTags(req.user.id);
  return res.json(tags);
}

module.exports = {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  getTags,
};
