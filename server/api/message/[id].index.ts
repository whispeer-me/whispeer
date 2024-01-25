export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id.index");

  if (id === "2") {
    return {
      data: {
        id: id,
        content: "DKhgS9+OTPBBo0V4nl6Knw==",
        salt: "1066970ac090c98c7b8753a40d785219",
        iv: "5861eec91ad30d72b6f9e164378f1e28",
        is_private: true,
        view_count: 1,
        created_at: "2024-01-25T12:06:06.515Z",
        expires_in: "23 hours and 54 minutes",
      },
    };
  } else {
    return {
      data: {
        id: id,
        content: "Hello",
        salt: null,
        iv: null,
        is_private: false,
        view_count: 0,
        created_at: "2024-01-24T12:36:54.597Z",
        expires_in: "23 hours and 59 minutes",
      },
    };
  }
});
