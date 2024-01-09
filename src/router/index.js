import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CodeView from "@/views/CodeView.vue";
import ContactView from "@/views/ContactView.vue";
import MessageView from "@/views/message/MessageView.vue";
import CreateMessageView from "@/views/message/CreateMessageView.vue";
import PrivacyPolicyView from "@/views/PrivacyPolicyView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/the-story",
    name: "the-story",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/TheStoryView.vue"),
  },
  {
    path: "/code",
    name: "code",
    component: CodeView,
  },
  {
    path: "/contact",
    name: "contact",
    component: ContactView,
  },
  {
    path: "/privacy-policy",
    name: "privacy-policy",
    component: PrivacyPolicyView,
  },
  {
    path: "/m/new",
    name: "new-message",
    component: CreateMessageView,
  },
  {
    path: "/m",
    name: "view-message",
    component: MessageView,
  },
];

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes,
});

export default router;
