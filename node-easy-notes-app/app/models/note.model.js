const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    title: String,
    content: String,
    tags: [String],
    category: String,
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
    color: { type: String, default: '#ffffff' }
}, {
    timestamps: true
});

NoteSchema.index({ title: 'text', content: 'text', tags: 'text', category: 'text' });
NoteSchema.index({ isPinned: -1, updatedAt: -1 });
NoteSchema.index({ isArchived: 1 });
NoteSchema.index({ category: 1 });
NoteSchema.index({ tags: 1 });

module.exports = mongoose.model('Note', NoteSchema);