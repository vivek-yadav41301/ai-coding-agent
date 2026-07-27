const Note = require('../models/note.model.js');

function escapeRegex(text) {
    return text.replace(/[-[[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    let tags = [];
    if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
    } else if (typeof req.body.tags === 'string' && req.body.tags.trim() !== '') {
        tags = req.body.tags.split(',').map(t => t.trim());
    }

    // Create a Note
    const note = new Note({
        title: req.body.title || "Untitled Note", 
        content: req.body.content,
        tags: tags,
        category: req.body.category || "",
        isPinned: req.body.isPinned !== undefined ? (req.body.isPinned === 'true' || req.body.isPinned === true) : false,
        isArchived: req.body.isArchived !== undefined ? (req.body.isArchived === 'true' || req.body.isArchived === true) : false,
        favorite: req.body.favorite !== undefined ? (req.body.favorite === 'true' || req.body.favorite === true) : false,
        color: req.body.color || "#ffffff"
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

// Create and Save a new Science Note
exports.createScienceNote = (req, res) => {
    req.body.category = req.body.category || "Science";

    let tags = [];
    if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
    } else if (typeof req.body.tags === 'string' && req.body.tags.trim() !== '') {
        tags = req.body.tags.split(',').map(t => t.trim());
    }

    if (!tags.some(t => typeof t === 'string' && t.toLowerCase() === 'science')) {
        tags.push('science');
    }

    req.body.tags = tags;
    exports.create(req, res);
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res, customBaseFilter = null) => {
    const { q, query, search, kw, keyword, tag, tags, category, isPinned, pinned, isArchived, archived, favorite, color, startDate, from, endDate, to, sortBy, sort, order, sortOrder, dir, page, limit } = req.query;
    const searchTerm = q || query || search || kw || keyword;
    const tagFilter = tag || tags;

    let filter = {};
    if (customBaseFilter) {
        filter = { ...customBaseFilter };
    }

    if (searchTerm) {
        const safeSearchTerm = escapeRegex(searchTerm);
        const searchConditions = [
            { title: { $regex: safeSearchTerm, $options: 'i' } },
            { content: { $regex: safeSearchTerm, $options: 'i' } },
            { tags: { $regex: safeSearchTerm, $options: 'i' } },
            { category: { $regex: safeSearchTerm, $options: 'i' } }
        ];
        if (filter.$or) {
            filter = {
                $and: [
                    { $or: filter.$or },
                    { $or: searchConditions }
                ]
            };
        } else {
            filter.$or = searchConditions;
        }
    }

    if (tagFilter) {
        let tagCond;
        if (Array.isArray(tagFilter)) {
            tagCond = { $in: tagFilter };
        } else if (typeof tagFilter === 'string' && tagFilter.includes(',')) {
            tagCond = { $in: tagFilter.split(',').map(t => t.trim()) };
        } else {
            tagCond = tagFilter;
        }
        filter.tags = tagCond;
    }

    if (category) {
        let categoryCond;
        if (Array.isArray(category)) {
            categoryCond = { $in: category };
        } else if (typeof category === 'string' && category.includes(',')) {
            categoryCond = { $in: category.split(',').map(c => c.trim()) };
        } else {
            categoryCond = category;
        }
        filter.category = categoryCond;
    }

    if (color) {
        filter.color = color;
    }

    const pinnedParam = isPinned !== undefined ? isPinned : pinned;
    if (pinnedParam !== undefined) {
        filter.isPinned = pinnedParam === 'true' || pinnedParam === true;
    }

    const archivedParam = isArchived !== undefined ? isArchived : archived;
    if (archivedParam !== undefined) {
        filter.isArchived = archivedParam === 'true' || archivedParam === true;
    }

    if (favorite !== undefined) {
        filter.favorite = favorite === 'true' || favorite === true;
    }

    const start = startDate || from;
    const end = endDate || to;
    if (start || end) {
        filter.createdAt = {};
        if (start) filter.createdAt.$gte = new Date(start);
        if (end) filter.createdAt.$lte = new Date(end);
    }

    const sortField = sortBy || sort;
    const sortDirection = order || sortOrder || dir;
    const directionMultiplier = (sortDirection === 'asc' || sortDirection === '1' || sortDirection === 1) ? 1 : -1;

    let sortOptions = {};
    if (sortField) {
        let mappedSortField = sortField;
        if (sortField === 'pinned') mappedSortField = 'isPinned';
        if (sortField === 'archived') mappedSortField = 'isArchived';
        sortOptions[mappedSortField] = directionMultiplier;
    } else {
        sortOptions = { isPinned: -1, updatedAt: -1 };
    }

    let queryExec = Note.find(filter).sort(sortOptions);

    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
        const parsedPage = parseInt(page, 10);
        const pageNum = (!isNaN(parsedPage) && parsedPage > 0) ? parsedPage : 1;
        const skip = (pageNum - 1) * parsedLimit;
        queryExec = queryExec.skip(skip).limit(parsedLimit);
    }

    queryExec
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
        });
    });
};

// Retrieve science notes
exports.getScienceNotes = (req, res) => {
    const scienceFilter = {
        $or: [
            { category: { $regex: /^science$/i } },
            { tags: { $regex: /^science$/i } }
        ]
    };
    exports.findAll(req, res, scienceFilter);
};

// Retrieve pinned notes
exports.getPinnedNotes = (req, res) => {
    const pinnedFilter = { isPinned: true };
    exports.findAll(req, res, pinnedFilter);
};

// Search notes
exports.search = (req, res) => {
    exports.findAll(req, res);
};

// Retrieve all unique tags
exports.getTags = (req, res) => {
    Note.distinct('tags')
    .then(tags => {
        const cleanedTags = tags.filter(t => t && typeof t === 'string' && t.trim() !== '').map(t => t.trim());
        const uniqueTags = Array.from(new Set(cleanedTags)).sort();
        res.send(uniqueTags);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving tags."
        });
    });
};

// Retrieve all unique categories
exports.getCategories = (req, res) => {
    Note.distinct('category')
    .then(categories => {
        const cleanedCategories = categories.filter(c => c && typeof c === 'string' && c.trim() !== '').map(c => c.trim());
        const uniqueCategories = Array.from(new Set(cleanedCategories)).sort();
        res.send(uniqueCategories);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving categories."
        });
    });
};

// Retrieve note statistics
exports.getStats = (req, res) => {
    Promise.all([
        Note.countDocuments({}),
        Note.countDocuments({ isPinned: true }),
        Note.countDocuments({ isArchived: true }),
        Note.countDocuments({ favorite: true }),
        Note.distinct('tags'),
        Note.distinct('category')
    ]).then(([total, pinned, archived, favorite, tags, categories]) => {
        res.send({
            totalNotes: total,
            pinnedNotes: pinned,
            archivedNotes: archived,
            favoriteNotes: favorite,
            totalTags: tags.filter(t => t && typeof t === 'string' && t.trim() !== '').length,
            totalCategories: categories.filter(c => c && typeof c === 'string' && c.trim() !== '').length
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving note statistics."
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
        if(err.kind === 'ObjectId' || err.name === 'CastError') {
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
        if (Array.isArray(req.body.tags)) {
            updateData.tags = req.body.tags;
        } else if (typeof req.body.tags === 'string' && req.body.tags.trim() !== '') {
            updateData.tags = req.body.tags.split(',').map(t => t.trim());
        } else {
            updateData.tags = [];
        }
    }

    if (req.body.category !== undefined) {
        updateData.category = req.body.category;
    }

    if (req.body.isPinned !== undefined) {
        updateData.isPinned = req.body.isPinned === 'true' || req.body.isPinned === true;
    }

    if (req.body.isArchived !== undefined) {
        updateData.isArchived = req.body.isArchived === 'true' || req.body.isArchived === true;
    }

    if (req.body.favorite !== undefined) {
        updateData.favorite = req.body.favorite === 'true' || req.body.favorite === true;
    }

    if (req.body.color !== undefined) {
        updateData.color = req.body.color;
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
        if(err.kind === 'ObjectId' || err.name === 'CastError') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.noteId
        });
    });
};

// Partial update a note
exports.patch = (req, res) => {
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.tags !== undefined) {
        if (Array.isArray(req.body.tags)) {
            updateData.tags = req.body.tags;
        } else if (typeof req.body.tags === 'string' && req.body.tags.trim() !== '') {
            updateData.tags = req.body.tags.split(',').map(t => t.trim());
        } else {
            updateData.tags = [];
        }
    }
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.isPinned !== undefined) updateData.isPinned = req.body.isPinned === 'true' || req.body.isPinned === true;
    if (req.body.isArchived !== undefined) updateData.isArchived = req.body.isArchived === 'true' || req.body.isArchived === true;
    if (req.body.favorite !== undefined) updateData.favorite = req.body.favorite === 'true' || req.body.favorite === true;
    if (req.body.color !== undefined) updateData.color = req.body.color;

    Note.findByIdAndUpdate(req.params.noteId, updateData, { new: true })
    .then(note => {
        if (!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send(note);
    }).catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'CastError') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.noteId
        });
    });
};

// Toggle or set pinned status
exports.togglePin = (req, res) => {
    Note.findById(req.params.noteId)
    .then(note => {
        if (!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        let pinStatus;
        if (req.body && req.body.isPinned !== undefined) {
            pinStatus = req.body.isPinned === 'true' || req.body.isPinned === true;
        } else if (req.body && req.body.pinned !== undefined) {
            pinStatus = req.body.pinned === 'true' || req.body.pinned === true;
        }
        if (pinStatus === undefined) {
            pinStatus = !note.isPinned;
        }
        note.isPinned = pinStatus;
        return note.save();
    })
    .then(updatedNote => {
        if (updatedNote) res.send(updatedNote);
    })
    .catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'CastError') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        return res.status(500).send({
            message: "Error updating pin status for note with id " + req.params.noteId
        });
    });
};

// Pin a note
exports.pinNote = exports.pin = (req, res) => {
    req.body = req.body || {};
    req.body.isPinned = true;
    exports.togglePin(req, res);
};

// Unpin a note
exports.unpinNote = exports.unpin = (req, res) => {
    req.body = req.body || {};
    req.body.isPinned = false;
    exports.togglePin(req, res);
};

// Toggle or set archive status
exports.toggleArchive = (req, res) => {
    Note.findById(req.params.noteId)
    .then(note => {
        if (!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        let archiveStatus;
        if (req.body && req.body.isArchived !== undefined) {
            archiveStatus = req.body.isArchived === 'true' || req.body.isArchived === true;
        } else if (req.body && req.body.archived !== undefined) {
            archiveStatus = req.body.archived === 'true' || req.body.archived === true;
        }
        if (archiveStatus === undefined) {
            archiveStatus = !note.isArchived;
        }
        note.isArchived = archiveStatus;
        return note.save();
    })
    .then(updatedNote => {
        if (updatedNote) res.send(updatedNote);
    })
    .catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'CastError') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        return res.status(500).send({
            message: "Error updating archive status for note with id " + req.params.noteId
        });
    });
};

// Toggle or set favorite status
exports.toggleFavorite = (req, res) => {
    Note.findById(req.params.noteId)
    .then(note => {
        if (!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        let favoriteStatus;
        if (req.body && req.body.favorite !== undefined) {
            favoriteStatus = req.body.favorite === 'true' || req.body.favorite === true;
        }
        if (favoriteStatus === undefined) {
            favoriteStatus = !note.favorite;
        }
        note.favorite = favoriteStatus;
        return note.save();
    })
    .then(updatedNote => {
        if (updatedNote) res.send(updatedNote);
    })
    .catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'CastError') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        return res.status(500).send({
            message: "Error updating favorite status for note with id " + req.params.noteId
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
        if(err.kind === 'ObjectId' || err.name === 'NotFound' || err.name === 'CastError') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
};
