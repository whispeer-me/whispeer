exports.up = (pgm) => {
  pgm.createTable("archived_ids", {
    id: { type: "text", primaryKey: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("archived_ids");
};
