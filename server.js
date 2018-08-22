"use strict";

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require("./config");
const {Post, Author} = require("./models");

const app = express();
app.use(express.json());
app.use(morgan("common"));

app.get("/posts", (req, res) => {
    Post
        .find()
        .then(posts => {
            res.json(posts.map(post => {
                return {
                    title: post.title,
                    content: post.content,
                    author: post.authorName,
                    created: post.created
                }
        }));
    })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});

app.get("/posts/:id", (req, res) => {
    Post
        .findById(req.params.id)
        .then(post => {
            res.json({
                title: post.title,
                content: post.content,
                author: post.authorName,
                created: post.created,
                comments: post.comments
            })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
    });
});

app.post("/posts", (req, res) => {
    const requiredFields = [
        "title", 
        "author_id",
        "content"
        ];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Sorry, \`${field}\` is missing from the request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Author
        .findById(req.body.author_id)
        .then(author => {
            if (author) {
                Post
                    .create({
                        title: req.body.title,
                        content: req.body.content,
                        author_id: req.body.id
                    })
                    .then(post => res.json({
                        title: post.title,
                        content: post.content,
                        author: post.author,
                        created: post.created,
                        comments: post.comments
                    }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({message: "Internal server error"});
                    });
                    
            }

            else {
                const message = `Sorry, no author found`;
                console.error(message);
                return res.status(400).send(message);
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});

app.put("/posts/:id", (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Sorry, but the request path id (${req.params.id}) and the request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({message: message});
    }

    const postToUpdate = {};
    const updateableFields = ["title", "content"];

    updateableFields.forEach(field => {
        if (field in req.body) {
            postToUpdate[field] = req.body[field];
        }
    });

    Post
        .findByIdAndUpdate(req.params.id, {$set: postToUpdate}, {new: true})
        .then(updatedPost => res.status(200).json({
            title: updatedPost.title,
            content: updatedPost.content,
            author: updatedPost.authorName,
            created: updatedPost.created
        }))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});

app.delete("/posts/:id", (req, res) => {
    Post
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleting blog post \`${req.params.id}\``);
            res.status(204).end()
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});

app.get("authors", (req, res) => {
    Author
        .find()
        .then(authors => {
            res.json(authors.map(author => {
                return {
                    id: author._id,
                    name: `${author.firstName} ${author.lastName}`,
                    userName: author.userName
                };
            }));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});

app.post("authors", (req, res) => {
    const requiredFields = ["firstName", "lastName", "userName"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Sorry, \`${field}\` is missing from the request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Author
        .findOne({userName: req.body.userName})
        .then(author => {
            if (author) {
                const message = `Sorry, this username already exists`;
                console.error(message);
                return res.status(400).send(message);
            }
            else {
                Author
                    .create({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        userName: req.body.userName
                    })
                    .then(author => res.json({
                        _id: author.id,
                        name: `${author.firstName} ${author.lastName}`,
                        userName: author.userName
                    }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({message: "Internal server error"});
                    });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});

app.put("authors/:id", (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Sorry, but the request path id (${req.params.id}) and the request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({message: message});
    }

    const authorToUpdate = {};
    const updateableFields = ["firstName", "lastName", "userName"];

    updateableFields.forEach(field => {
        if (field in req.body) {
            authorToUpdate[field] = req.body[field];
        }
    });

    Author
        .findOne({userName: authorToUpdate.userName || "", _id: {$ne: req.params.id}})
        .then(author => {
            if (author) {
                const message = `Sorry, this username already exists`;
                console.error(message);
                return res.status(400).send(message);
            }

            else {
                Author
                    .findByIdAndUpdate(req.params.id, {$set: authorToUpdate}, {new: true})
                    .then(updatedAuthor => res.json({
                        _id: updatedAuthor.id,
                        name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
                        userName: updatedAuthor.userName
                    }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({message: "Internal server error"});
                    });
            }
        });
});

app.delete("authors/:id", (req, res) => {
    Post
        .remove({ author: req.params.id })
        .then(() => {

        Author
            .findByIdAndRemove(req.params.id)
            .then(() => {
                console.log(`Deleting author \`${req.params.id}\` and all content related to this author`);
                res.status(204).end();
            });
        })
            .catch(err => {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
            });
});

app.use("*", function(req, res) {
    res.status(404).json({message: "Not Found"});
});

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            databaseUrl,
            err => {
                if (err) {
                    return reject(err);
                }
            server = app
                .listen(port, () =>{
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on("error", err => {
                    mongoose.disconnect();
                    reject(err);
                });
            }
        );
    });
}

function closeServer() {
    return mongoose.disconnect()
        .then(() => {
            return new Promise((resolve, reject) => {
                console.log("Closing Server");
                server.close(err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};

