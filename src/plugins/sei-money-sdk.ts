import type { App } from "vue";
import { createSeiMoneySDK } from "@seimoney/sdk/src/sdk";

export default {
  install(app: App) {
    const sdk = createSeiMoneySDK({
      apiUrl: "https://api.seimoney.com",
    });
    app.config.globalProperties.$mySdk = sdk;
  },
};
