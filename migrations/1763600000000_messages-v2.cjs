// SPDX-License-Identifier: AGPL-3.0-only

// v2: client-side encryption only. Old rows (crypto-js format and plaintext)
// are deleted; there is no legacy reader.
exports.up = (pgm) => {
  pgm.sql("DELETE FROM messages;");
  pgm.dropColumn("messages", "is_private");
  pgm.addColumns("messages", {
    version: { type: "smallint", notNull: true },
    has_passphrase: { type: "boolean", notNull: true, default: false },
    burn_after_read: { type: "boolean", notNull: true, default: false },
  });
  pgm.createIndex("messages", "created_at");
};

exports.down = (pgm) => {
  pgm.sql("DELETE FROM messages;");
  pgm.dropIndex("messages", "created_at");
  pgm.dropColumns("messages", ["version", "has_passphrase", "burn_after_read"]);
  pgm.addColumns("messages", {
    is_private: { type: "boolean", notNull: true, default: false },
  });
};
