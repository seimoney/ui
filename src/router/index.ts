import { createRouter, createWebHistory } from "vue-router";
import { useWalletStore } from "../stores/wallet";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_, __, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    {
      path: "/",
      name: "Landing",
      component: () => import("../views/LandingView.vue"),
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("../views/account/LoginView.vue"),
    },
    {
      path: "/account",
      name: "Account",
      component: () => import("../views/account/AccountView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard",
      component: () => import("../views/dashboard/DashboardView.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "/dashboard",
          name: "Overview",
          component: () => import("../views/dashboard/pages/OverviewView.vue"),
        },
        {
          path: "contracts",
          name: "Contracts",
          component: () =>
            import("../views/dashboard/pages/contracts/ContractsView.vue"),
        },
        {
          path: "contracts/create",
          name: "CreateContract",
          component: () =>
            import("../views/dashboard/pages/contracts/CreateContractView.vue"),
        },
        {
          path: "links",
          name: "Links",
          component: () =>
            import("../views/dashboard/pages/links/LinksView.vue"),
        },
        {
          path: "links/create",
          name: "CreateLink",
          component: () =>
            import("../views/dashboard/pages/links/CreateLinkView.vue"),
        },
        {
          path: "contracts/:id",
          name: "ContractDetail",
          component: () =>
            import("../views/dashboard/pages/contracts/ContractDetailView.vue"),
        },
        {
          path: "files/:id",
          name: "FileDetail",
          component: () =>
            import("../views/dashboard/pages/files/FileDetailView.vue"),
        },
        {
          path: "links/:id",
          name: "LinkDetail",
          component: () =>
            import("../views/dashboard/pages/links/LinkDetailView.vue"),
        },
        {
          path: "files",
          name: "Files",
          component: () =>
            import("../views/dashboard/pages/files/FilesView.vue"),
        },
        {
          path: "files/upload",
          name: "UploadFile",
          component: () =>
            import("../views/dashboard/pages/files/UploadFileView.vue"),
        },
        {
          path: "smart-account",
          name: "SmartAccount",
          component: () =>
            import("../views/dashboard/pages/defi/SmartAccountView.vue"),
        },
        {
          path: "checkout",
          name: "checkout",
          component: () =>
            import(
              "../views/dashboard/pages/checkout/CheckoutDashboardView.vue"
            ),
        },
        {
          path: "checkout/create",
          name: "checkout-create",
          component: () =>
            import("../views/dashboard/pages/checkout/CreateCheckoutView.vue"),
        },
        {
          path: "checkout/product/:id",
          name: "checkout-product",
          component: () =>
            import("../views/dashboard/pages/products/ProductDetailView.vue"),
        },
      ],
    },
    {
      path: "/pay/:id",
      name: "LinkPayment",
      component: () => import("../views/payment/LinkPaymentView.vue"),
    },
    {
      path: "/pay/file/:id",
      name: "FilePayment",
      component: () => import("../views/payment/FilePaymentView.vue"),
    },
    {
      path: "/contract/sign/:id",
      name: "ContractSign",
      component: () => import("../views/payment/ContractSignView.vue"),
    },
  ],
});

router.beforeEach((to, _, next) => {
  const walletConnect = useWalletStore();

  if (to.meta.requiresAuth && !walletConnect.account) {
    next("/login");
  } else if (to.path === "/login" && walletConnect.account) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
