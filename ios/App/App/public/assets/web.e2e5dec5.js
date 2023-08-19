import { W as WebPlugin } from "./index.6fc4a900.js";
class AdMobWeb extends WebPlugin {
  constructor() {
    super({
      name: "AdMob",
      platforms: ["web"]
    });
  }
  async initialize() {
    console.log("initialize");
  }
  async targetSettings() {
    console.log("targetSettings");
  }
  async trackingAuthorizationStatus() {
    return {
      status: "authorized"
    };
  }
  async setApplicationMuted(options) {
    console.log("setApplicationMuted", options);
  }
  async setApplicationVolume(options) {
    console.log("setApplicationVolume", options);
  }
  async showBanner(options) {
    console.log("showBanner", options);
  }
  async hideBanner() {
    console.log("hideBanner");
  }
  async resumeBanner() {
    console.log("resumeBanner");
  }
  async removeBanner() {
    console.log("removeBanner");
  }
  async prepareInterstitial(options) {
    console.log("prepareInterstitial", options);
    return {
      adUnitId: options.adId
    };
  }
  async showInterstitial() {
    console.log("showInterstitial");
  }
  async prepareRewardVideoAd(options) {
    console.log(options);
    return {
      adUnitId: options.adId
    };
  }
  async showRewardVideoAd() {
    return {
      type: "",
      amount: 0
    };
  }
}
export { AdMobWeb };
