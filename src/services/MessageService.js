import Api from "@/api/Api.js";

export default {
  async getMessage(id) {
    return await Api.get(`/message/${id}`);
  },
};
