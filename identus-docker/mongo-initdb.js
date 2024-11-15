db.createUser({
    user: "admin",
    pwd: "admin",
    roles: [
        { role: "readWrite", db: "mediator" }
    ]
});

const database = 'mediator';
const collectionDidAccount = 'user.account';
const collectionMessages = 'messages';
const collectionMessagesSend = 'messages.outbound';

// The current database to use.
use(database);

// Create  collections.
db.createCollection(collectionDidAccount);
db.createCollection(collectionMessages);
db.createCollection(collectionMessagesSend);

//create index
db.getCollection(collectionDidAccount).createIndex({ 'did': 1 }, { unique: true });
// Only enforce uniqueness on non-empty arrays
db.getCollection(collectionDidAccount).createIndex({ 'alias': 1 }, { unique: true, partialFilterExpression: { "alias.0": { $exists: true } } });
db.getCollection(collectionDidAccount).createIndex({ "messagesRef.hash": 1, "messagesRef.recipient": 1 });

// There are 2 message types  `Mediator`  and `User` Please follow the Readme for more details in the section Mediator storage
const expireAfterSeconds = 7 * 24 * 60 * 60; // 7 day * 24 hours * 60 minutes * 60 seconds
db.getCollection(collectionMessages).createIndex(
    { ts: 1 },
    {
        name: "message-ttl-index",
        partialFilterExpression: { "message_type": "Mediator" },
        expireAfterSeconds: expireAfterSeconds
    }
)
