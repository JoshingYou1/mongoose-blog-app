"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const commentSchema = mongoose.Schema({content: "string"});

const blogPostSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "Author"},
    created: {type: Date, default: Date.now},
    comments: [commentSchema]
});

blogPostSchema.pre("findOne", function(next) {
    this.populate("author");
    next();
});

blogPostSchema.pre("find", function(next) {
    this.populate("author");
    next();
})

blogPostSchema.virtual("authorName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = function() {
    return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorName,
    created: this.created,
    comments: this.comments
    };
};

const authorSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: {
        type: String,
        unique: true
    }
});

const Post = mongoose.model("Post", blogPostSchema);
const Author = mongoose.model("Author", authorSchema);

module.exports = {Post, Author};