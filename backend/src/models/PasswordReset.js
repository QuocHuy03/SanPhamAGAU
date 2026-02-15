const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    code: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // TTL index - document will be deleted after 15 minutes (900 seconds)
    }
});

// Index for faster queries
passwordResetSchema.index({ email: 1, code: 1 });
passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
