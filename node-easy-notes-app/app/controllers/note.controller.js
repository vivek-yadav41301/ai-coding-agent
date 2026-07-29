const Note = require('../models/note.model.js');

// Helper to parse tags into an array
const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) {
        return tags.map(t => String(t).trim()).filter(Boolean);
    }
    if (typeof tags === 'string') {
        return tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
};

// Helper to escape special regex characters
const escapeRegex = (string) => {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }//THIS IS A NEW CODE 

    // Create a Note
    const note = new Note({
        title: req.body.title || "Untitled Note", 
        content: req.body.content,
        tags: parseTags(req.body.tags),
        category: req.body.category || ""
    });

    // Save Note in the database
    note.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
};

// Retrieve and return all notes from the database (supports search and category/tag filtering).
exports.findAll = (req, res) => {
    const query = {};
    const { search, q, tag, category } = req.query;
    const searchTerm = search || q;

    if (searchTerm) {
        const regex = new RegExp(escapeRegex(searchTerm), 'i');
        query.$or = [
            { title: regex },
            { content: regex },
            { tags: regex },
            { category: regex }
        ];
    }

    if (tag) {
        query.tags = new RegExp('^' + escapeRegex(tag) + '$', 'i');
    }

    if (category) {
        query.category = new RegExp(escapeRegex(category), 'i');
    }

    Note.find(query)
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
        });
    });
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
    Note.findById(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });            
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.noteId
        });
    });
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    const updateData = {
        title: req.body.title || "Untitled Note",
        content: req.body.content
    };

    if (req.body.tags !== undefined) {
        updateData.tags = parseTags(req.body.tags);
    }

    if (req.body.category !== undefined) {
        updateData.category = req.body.category;
    }

    // Find note and update it with the request body
    Note.findByIdAndUpdate(req.params.noteId, updateData, {new: true})
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.noteId
        });
    });
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    Note.findByIdAndRemove(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
};
