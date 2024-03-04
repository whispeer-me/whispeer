exports.up = (pgm) => {
  pgm.createTable("messages", {
    id: { type: "text", primaryKey: true },
    content: { type: "text", notNull: true },
    salt: { type: "text" },
    iv: { type: "text" },
    is_private: { type: "boolean", notNull: true, default: false },
    view_count: { type: "integer", notNull: true, default: 0 },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("messages");
};
