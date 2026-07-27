module.exports = (app) => {
    const notes = require('../controllers/note.controller.js');

    // Create a new Note
    app.post('/notes', notes.create);

    // Retrieve all Notes
    app.get('/notes', notes.findAll);

    // Search Notes
    app.get('/notes/search', notes.search);

    // Pinned Notes
    app.get('/notes/pinned', notes.getPinnedNotes);
    app.get('/pinned-notes', notes.getPinnedNotes);

    // Science Notes
    app.get('/notes/science', notes.getScienceNotes);
    app.post('/notes/science', notes.createScienceNote);
    app.get('/science-notes', notes.getScienceNotes);
    app.post('/science-notes', notes.createScienceNote);
    app.get('/notes/category/science', notes.getScienceNotes);

    // Get unique tags
    app.get('/notes/tags', notes.getTags);

    // Get unique categories
    app.get('/notes/categories', notes.getCategories);

    // Get statistics
    app.get('/notes/stats', notes.getStats);

    // Toggle/update note status
 
    app.post('/notes/:noteId/pin', notes.togglePin);
    app.put('/notes/pin/:noteId', notes.togglePin);
    app.patch('/notes/pin/:noteId', notes.togglePin);
    app.post('/notes/pin/:noteId', notes.togglePin);

    app.put('/notes/:noteId/unpin', notes.unpinNote);
    app.patch('/notes/:noteId/unpin', notes.unpinNote);
    app.post('/notes/:noteId/unpin', notes.unpinNote);
    app.put('/notes/unpin/:noteId', notes.unpinNote);
    app.patch('/notes/unpin/:noteId', notes.unpinNote);
    app.post('/notes/unpin/:noteId', notes.unpinNote);

    app.put('/notes/:noteId/archive', notes.toggleArchive);
    app.patch('/notes/:noteId/archive', notes.toggleArchive);

    app.put('/notes/:noteId/favorite', notes.toggleFavorite);
    app.patch('/notes/:noteId/favorite', notes.toggleFavorite);

    // Retrieve a single Note with noteId
    app.get('/notes/:noteId', notes.findOne);

    // Update a Note with noteId
    app.put('/notes/:noteId', notes.update);

    // Partial update a Note with noteId
    app.patch('/notes/:noteId', notes.patch);

    // Delete a Note with noteId
    app.delete('/notes/:noteId', notes.delete);
}
