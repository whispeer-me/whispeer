// SPDX-License-Identifier: AGPL-3.0-only

const MESSAGE_ID = /^[A-Za-z0-9]{10}$/;

export const isValidMessageId = (id: unknown): id is string =>
  typeof id === "string" && MESSAGE_ID.test(id);
