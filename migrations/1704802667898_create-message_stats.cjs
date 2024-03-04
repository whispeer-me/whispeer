exports.up = (pgm) => {
  pgm.createTable("message_stats", {
    id: "id", // auto-incrementing integer id
    created_count: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    view_count: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Let's insert an initial row
  pgm.sql("INSERT INTO message_stats (created_count, view_count) VALUES (0, 0)");
};

exports.down = (pgm) => {
  pgm.dropTable("message_stats");
};
