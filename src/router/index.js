import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "@/views/HomeView.vue";
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
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
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
    path: "/m/:id",
    name: "message",
    component: MessageView,
    props: true,
  },
];

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes,
});

export default router;
