const p = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p();
var style = "";
/*! Capacitor: https://capacitorjs.com/ - MIT License */
const createCapacitorPlatforms = (win) => {
  const defaultPlatformMap = /* @__PURE__ */ new Map();
  defaultPlatformMap.set("web", { name: "web" });
  const capPlatforms = win.CapacitorPlatforms || {
    currentPlatform: { name: "web" },
    platforms: defaultPlatformMap
  };
  const addPlatform = (name, platform) => {
    capPlatforms.platforms.set(name, platform);
  };
  const setPlatform = (name) => {
    if (capPlatforms.platforms.has(name)) {
      capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
    }
  };
  capPlatforms.addPlatform = addPlatform;
  capPlatforms.setPlatform = setPlatform;
  return capPlatforms;
};
const initPlatforms = (win) => win.CapacitorPlatforms = createCapacitorPlatforms(win);
const CapacitorPlatforms = /* @__PURE__ */ initPlatforms(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
CapacitorPlatforms.addPlatform;
CapacitorPlatforms.setPlatform;
var ExceptionCode;
(function(ExceptionCode2) {
  ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
  ExceptionCode2["Unavailable"] = "UNAVAILABLE";
})(ExceptionCode || (ExceptionCode = {}));
class CapacitorException extends Error {
  constructor(message, code, data) {
    super(message);
    this.message = message;
    this.code = code;
    this.data = data;
  }
}
const getPlatformId = (win) => {
  var _a, _b;
  if (win === null || win === void 0 ? void 0 : win.androidBridge) {
    return "android";
  } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
    return "ios";
  } else {
    return "web";
  }
};
const createCapacitor = (win) => {
  var _a, _b, _c, _d, _e;
  const capCustomPlatform = win.CapacitorCustomPlatform || null;
  const cap = win.Capacitor || {};
  const Plugins = cap.Plugins = cap.Plugins || {};
  const capPlatforms = win.CapacitorPlatforms;
  const defaultGetPlatform = () => {
    return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
  };
  const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
  const defaultIsNativePlatform = () => getPlatform() !== "web";
  const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
  const defaultIsPluginAvailable = (pluginName) => {
    const plugin = registeredPlugins.get(pluginName);
    if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
      return true;
    }
    if (getPluginHeader(pluginName)) {
      return true;
    }
    return false;
  };
  const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) || defaultIsPluginAvailable;
  const defaultGetPluginHeader = (pluginName) => {
    var _a2;
    return (_a2 = cap.PluginHeaders) === null || _a2 === void 0 ? void 0 : _a2.find((h) => h.name === pluginName);
  };
  const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
  const handleError = (err) => win.console.error(err);
  const pluginMethodNoop = (_target, prop, pluginName) => {
    return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
  };
  const registeredPlugins = /* @__PURE__ */ new Map();
  const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
    const registeredPlugin = registeredPlugins.get(pluginName);
    if (registeredPlugin) {
      console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
      return registeredPlugin.proxy;
    }
    const platform = getPlatform();
    const pluginHeader = getPluginHeader(pluginName);
    let jsImplementation;
    const loadPluginImplementation = async () => {
      if (!jsImplementation && platform in jsImplementations) {
        jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
      } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
        jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
      }
      return jsImplementation;
    };
    const createPluginMethod = (impl, prop) => {
      var _a2, _b2;
      if (pluginHeader) {
        const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
        if (methodHeader) {
          if (methodHeader.rtype === "promise") {
            return (options) => cap.nativePromise(pluginName, prop.toString(), options);
          } else {
            return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
          }
        } else if (impl) {
          return (_a2 = impl[prop]) === null || _a2 === void 0 ? void 0 : _a2.bind(impl);
        }
      } else if (impl) {
        return (_b2 = impl[prop]) === null || _b2 === void 0 ? void 0 : _b2.bind(impl);
      } else {
        throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
      }
    };
    const createPluginMethodWrapper = (prop) => {
      let remove;
      const wrapper = (...args) => {
        const p2 = loadPluginImplementation().then((impl) => {
          const fn = createPluginMethod(impl, prop);
          if (fn) {
            const p3 = fn(...args);
            remove = p3 === null || p3 === void 0 ? void 0 : p3.remove;
            return p3;
          } else {
            throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
          }
        });
        if (prop === "addListener") {
          p2.remove = async () => remove();
        }
        return p2;
      };
      wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
      Object.defineProperty(wrapper, "name", {
        value: prop,
        writable: false,
        configurable: false
      });
      return wrapper;
    };
    const addListener = createPluginMethodWrapper("addListener");
    const removeListener = createPluginMethodWrapper("removeListener");
    const addListenerNative = (eventName, callback) => {
      const call = addListener({ eventName }, callback);
      const remove = async () => {
        const callbackId = await call;
        removeListener({
          eventName,
          callbackId
        }, callback);
      };
      const p2 = new Promise((resolve) => call.then(() => resolve({ remove })));
      p2.remove = async () => {
        console.warn(`Using addListener() without 'await' is deprecated.`);
        await remove();
      };
      return p2;
    };
    const proxy = new Proxy({}, {
      get(_, prop) {
        switch (prop) {
          case "$$typeof":
            return void 0;
          case "toJSON":
            return () => ({});
          case "addListener":
            return pluginHeader ? addListenerNative : addListener;
          case "removeListener":
            return removeListener;
          default:
            return createPluginMethodWrapper(prop);
        }
      }
    });
    Plugins[pluginName] = proxy;
    registeredPlugins.set(pluginName, {
      name: pluginName,
      proxy,
      platforms: /* @__PURE__ */ new Set([
        ...Object.keys(jsImplementations),
        ...pluginHeader ? [platform] : []
      ])
    });
    return proxy;
  };
  const registerPlugin2 = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
  if (!cap.convertFileSrc) {
    cap.convertFileSrc = (filePath) => filePath;
  }
  cap.getPlatform = getPlatform;
  cap.handleError = handleError;
  cap.isNativePlatform = isNativePlatform;
  cap.isPluginAvailable = isPluginAvailable;
  cap.pluginMethodNoop = pluginMethodNoop;
  cap.registerPlugin = registerPlugin2;
  cap.Exception = CapacitorException;
  cap.DEBUG = !!cap.DEBUG;
  cap.isLoggingEnabled = !!cap.isLoggingEnabled;
  cap.platform = cap.getPlatform();
  cap.isNative = cap.isNativePlatform();
  return cap;
};
const initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
const Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
const registerPlugin = Capacitor.registerPlugin;
Capacitor.Plugins;
class WebPlugin {
  constructor(config) {
    this.listeners = {};
    this.windowListeners = {};
    if (config) {
      console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
      this.config = config;
    }
  }
  addListener(eventName, listenerFunc) {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listenerFunc);
    const windowListener = this.windowListeners[eventName];
    if (windowListener && !windowListener.registered) {
      this.addWindowListener(windowListener);
    }
    const remove = async () => this.removeListener(eventName, listenerFunc);
    const p2 = Promise.resolve({ remove });
    Object.defineProperty(p2, "remove", {
      value: async () => {
        console.warn(`Using addListener() without 'await' is deprecated.`);
        await remove();
      }
    });
    return p2;
  }
  async removeAllListeners() {
    this.listeners = {};
    for (const listener in this.windowListeners) {
      this.removeWindowListener(this.windowListeners[listener]);
    }
    this.windowListeners = {};
  }
  notifyListeners(eventName, data) {
    const listeners = this.listeners[eventName];
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }
  hasListeners(eventName) {
    return !!this.listeners[eventName].length;
  }
  registerWindowListener(windowEventName, pluginEventName) {
    this.windowListeners[pluginEventName] = {
      registered: false,
      windowEventName,
      pluginEventName,
      handler: (event) => {
        this.notifyListeners(pluginEventName, event);
      }
    };
  }
  unimplemented(msg = "not implemented") {
    return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
  }
  unavailable(msg = "not available") {
    return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
  }
  async removeListener(eventName, listenerFunc) {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      return;
    }
    const index = listeners.indexOf(listenerFunc);
    this.listeners[eventName].splice(index, 1);
    if (!this.listeners[eventName].length) {
      this.removeWindowListener(this.windowListeners[eventName]);
    }
  }
  addWindowListener(handle) {
    window.addEventListener(handle.windowEventName, handle.handler);
    handle.registered = true;
  }
  removeWindowListener(handle) {
    if (!handle) {
      return;
    }
    window.removeEventListener(handle.windowEventName, handle.handler);
    handle.registered = false;
  }
}
const encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
const decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
class CapacitorCookiesPluginWeb extends WebPlugin {
  async getCookies() {
    const cookies = document.cookie;
    const cookieMap = {};
    cookies.split(";").forEach((cookie) => {
      if (cookie.length <= 0)
        return;
      let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
      key = decode(key).trim();
      value = decode(value).trim();
      cookieMap[key] = value;
    });
    return cookieMap;
  }
  async setCookie(options) {
    try {
      const encodedKey = encode(options.key);
      const encodedValue = encode(options.value);
      const expires = `; expires=${(options.expires || "").replace("expires=", "")}`;
      const path = (options.path || "/").replace("path=", "");
      const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
      document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async deleteCookie(options) {
    try {
      document.cookie = `${options.key}=; Max-Age=0`;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async clearCookies() {
    try {
      const cookies = document.cookie.split(";") || [];
      for (const cookie of cookies) {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async clearAllCookies() {
    try {
      await this.clearCookies();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
registerPlugin("CapacitorCookies", {
  web: () => new CapacitorCookiesPluginWeb()
});
const readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const base64String = reader.result;
    resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
  };
  reader.onerror = (error) => reject(error);
  reader.readAsDataURL(blob);
});
const normalizeHttpHeaders = (headers = {}) => {
  const originalKeys = Object.keys(headers);
  const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
  const normalized = loweredKeys.reduce((acc, key, index) => {
    acc[key] = headers[originalKeys[index]];
    return acc;
  }, {});
  return normalized;
};
const buildUrlParams = (params, shouldEncode = true) => {
  if (!params)
    return null;
  const output = Object.entries(params).reduce((accumulator, entry) => {
    const [key, value] = entry;
    let encodedValue;
    let item;
    if (Array.isArray(value)) {
      item = "";
      value.forEach((str) => {
        encodedValue = shouldEncode ? encodeURIComponent(str) : str;
        item += `${key}=${encodedValue}&`;
      });
      item.slice(0, -1);
    } else {
      encodedValue = shouldEncode ? encodeURIComponent(value) : value;
      item = `${key}=${encodedValue}`;
    }
    return `${accumulator}&${item}`;
  }, "");
  return output.substr(1);
};
const buildRequestInit = (options, extra = {}) => {
  const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
  const headers = normalizeHttpHeaders(options.headers);
  const type = headers["content-type"] || "";
  if (typeof options.data === "string") {
    output.body = options.data;
  } else if (type.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options.data || {})) {
      params.set(key, value);
    }
    output.body = params.toString();
  } else if (type.includes("multipart/form-data")) {
    const form = new FormData();
    if (options.data instanceof FormData) {
      options.data.forEach((value, key) => {
        form.append(key, value);
      });
    } else {
      for (const key of Object.keys(options.data)) {
        form.append(key, options.data[key]);
      }
    }
    output.body = form;
    const headers2 = new Headers(output.headers);
    headers2.delete("content-type");
    output.headers = headers2;
  } else if (type.includes("application/json") || typeof options.data === "object") {
    output.body = JSON.stringify(options.data);
  }
  return output;
};
class CapacitorHttpPluginWeb extends WebPlugin {
  async request(options) {
    const requestInit = buildRequestInit(options, options.webFetchExtra);
    const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
    const url = urlParams ? `${options.url}?${urlParams}` : options.url;
    const response = await fetch(url, requestInit);
    const contentType = response.headers.get("content-type") || "";
    let { responseType = "text" } = response.ok ? options : {};
    if (contentType.includes("application/json")) {
      responseType = "json";
    }
    let data;
    let blob;
    switch (responseType) {
      case "arraybuffer":
      case "blob":
        blob = await response.blob();
        data = await readBlobAsBase64(blob);
        break;
      case "json":
        data = await response.json();
        break;
      case "document":
      case "text":
      default:
        data = await response.text();
    }
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return {
      data,
      headers,
      status: response.status,
      url: response.url
    };
  }
  async get(options) {
    return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
  }
  async post(options) {
    return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
  }
  async put(options) {
    return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
  }
  async patch(options) {
    return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
  }
  async delete(options) {
    return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
  }
}
registerPlugin("CapacitorHttp", {
  web: () => new CapacitorHttpPluginWeb()
});
const scriptRel = "modulepreload";
const seen = {};
const base = "/";
const __vitePreload = function preload(baseModule, deps) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  return Promise.all(deps.map((dep) => {
    dep = `${base}${dep}`;
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : scriptRel;
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule());
};
var MaxAdContentRating;
(function(MaxAdContentRating2) {
  MaxAdContentRating2["General"] = "General";
  MaxAdContentRating2["ParentalGuidance"] = "ParentalGuidance";
  MaxAdContentRating2["Teen"] = "Teen";
  MaxAdContentRating2["MatureAudience"] = "MatureAudience";
})(MaxAdContentRating || (MaxAdContentRating = {}));
var BannerAdPluginEvents;
(function(BannerAdPluginEvents2) {
  BannerAdPluginEvents2["SizeChanged"] = "bannerAdSizeChanged";
  BannerAdPluginEvents2["Loaded"] = "bannerAdLoaded";
  BannerAdPluginEvents2["FailedToLoad"] = "bannerAdFailedToLoad";
  BannerAdPluginEvents2["Opened"] = "bannerAdOpened";
  BannerAdPluginEvents2["Closed"] = "bannerAdClosed";
  BannerAdPluginEvents2["AdImpression"] = "bannerAdImpression";
})(BannerAdPluginEvents || (BannerAdPluginEvents = {}));
var BannerAdPosition;
(function(BannerAdPosition2) {
  BannerAdPosition2["TOP_CENTER"] = "TOP_CENTER";
  BannerAdPosition2["CENTER"] = "CENTER";
  BannerAdPosition2["BOTTOM_CENTER"] = "BOTTOM_CENTER";
})(BannerAdPosition || (BannerAdPosition = {}));
var BannerAdSize;
(function(BannerAdSize2) {
  BannerAdSize2["BANNER"] = "BANNER";
  BannerAdSize2["FULL_BANNER"] = "FULL_BANNER";
  BannerAdSize2["LARGE_BANNER"] = "LARGE_BANNER";
  BannerAdSize2["MEDIUM_RECTANGLE"] = "MEDIUM_RECTANGLE";
  BannerAdSize2["LEADERBOARD"] = "LEADERBOARD";
  BannerAdSize2["ADAPTIVE_BANNER"] = "ADAPTIVE_BANNER";
  BannerAdSize2["SMART_BANNER"] = "SMART_BANNER";
})(BannerAdSize || (BannerAdSize = {}));
var InterstitialAdPluginEvents;
(function(InterstitialAdPluginEvents2) {
  InterstitialAdPluginEvents2["Loaded"] = "interstitialAdLoaded";
  InterstitialAdPluginEvents2["FailedToLoad"] = "interstitialAdFailedToLoad";
  InterstitialAdPluginEvents2["Showed"] = "interstitialAdShowed";
  InterstitialAdPluginEvents2["FailedToShow"] = "interstitialAdFailedToShow";
  InterstitialAdPluginEvents2["Dismissed"] = "interstitialAdDismissed";
})(InterstitialAdPluginEvents || (InterstitialAdPluginEvents = {}));
var RewardAdPluginEvents;
(function(RewardAdPluginEvents2) {
  RewardAdPluginEvents2["Loaded"] = "onRewardedVideoAdLoaded";
  RewardAdPluginEvents2["FailedToLoad"] = "onRewardedVideoAdFailedToLoad";
  RewardAdPluginEvents2["Showed"] = "onRewardedVideoAdShowed";
  RewardAdPluginEvents2["FailedToShow"] = "onRewardedVideoAdFailedToShow";
  RewardAdPluginEvents2["Dismissed"] = "onRewardedVideoAdDismissed";
  RewardAdPluginEvents2["Rewarded"] = "onRewardedVideoAdReward";
})(RewardAdPluginEvents || (RewardAdPluginEvents = {}));
const AdMob = registerPlugin("AdMob", {
  web: () => __vitePreload(() => import("./web.427c8c68.js"), true ? [] : void 0).then((m) => new m.AdMobWeb())
});
var KeyboardStyle;
(function(KeyboardStyle2) {
  KeyboardStyle2["Dark"] = "DARK";
  KeyboardStyle2["Light"] = "LIGHT";
  KeyboardStyle2["Default"] = "DEFAULT";
})(KeyboardStyle || (KeyboardStyle = {}));
var KeyboardResize;
(function(KeyboardResize2) {
  KeyboardResize2["Body"] = "body";
  KeyboardResize2["Ionic"] = "ionic";
  KeyboardResize2["Native"] = "native";
  KeyboardResize2["None"] = "none";
})(KeyboardResize || (KeyboardResize = {}));
const Keyboard = registerPlugin("Keyboard");
AdMob.initialize({
  requestTrackingAuthorization: true,
  initializeForTesting: true,
  testingDevices: ["00008030-001C496A3E03402E"]
});
async function interstitial() {
  let options = {};
  if (Capacitor.getPlatform() === "ios") {
    options = {
      adId: "ca-app-pub-3940256099942544/4411468910"
    };
  } else if (Capacitor.getPlatform() === "android") {
    options = {
      adId: "ca-app-pub-9790404589582022/1708561351"
    };
  }
  await AdMob.prepareInterstitial(options);
  await AdMob.showInterstitial();
}
const hostname = "https://krakenmeister.com";
const route = "/arithmio";
const css = window.document.styleSheets[0];
let focusCard;
let focusX;
let focusY;
let isDragging;
let offsetX;
let offsetY;
let lastTouch;
let total = 0;
let gameType;
let lives;
let isMultiplayer;
let lastCard;
let forceMath = true;
let deck;
let hand;
let cardIDCounter;
let score;
let isMyTurn;
let clientHand;
let clientTurn;
let socket = io("https://krakenmeister.com");
let appRoomCode;
let appPlayerId;
let keyboardUp = false;
Keyboard.addListener(Capacitor.getPlatform() === "ios" ? "keyboardWillShow" : "keyboardDidShow", (info) => {
  keyboardUp = true;
  if (document.getElementById("wrapper")) {
    document.getElementById("wrapper").style.backgroundSize = `100% ${window.innerHeight + info.keyboardHeight}px`;
  }
  let allCards = document.querySelectorAll('[class$="card"]');
  for (let card of allCards) {
    card.style.display = "none";
  }
  if (document.getElementById("playerInfo")) {
    document.getElementById("playerInfo").style.display = "none";
  }
  if (document.getElementById("myInfo")) {
    document.getElementById("myInfo").style.display = "none";
  }
  if (document.getElementById("multiplayerMenu")) {
    document.getElementById("multiplayerMenu").style.display = "none";
  }
  if (document.getElementById("totalWrapper")) {
    document.getElementById("totalWrapper").style.display = "none";
  }
  if (document.getElementById("chatWrapper")) {
    if (!document.getElementById("winner")) {
      document.getElementById("chatWrapper").style.width = "90vw";
      document.getElementById("messageWrapper").style.fontSize = "2vw";
      document.getElementById("messageWrapper").style.height = "auto";
    }
  }
  if (document.getElementById("endTurnBtn")) {
    document.getElementById("endTurnBtn").style.display = "none";
  }
});
Keyboard.addListener(Capacitor.getPlatform() === "ios" ? "keyboardWillHide" : "keyboardDidHide", (info) => {
  keyboardUp = false;
  if (document.getElementById("wrapper")) {
    document.getElementById("wrapper").style.backgroundSize = "100% 100%";
  }
  let allCards = document.querySelectorAll('[class$="card"]');
  for (let card of allCards) {
    card.style.display = "flex";
  }
  if (document.getElementById("playerInfo")) {
    document.getElementById("playerInfo").style.display = "flex";
  }
  if (document.getElementById("myInfo")) {
    document.getElementById("myInfo").style.display = "flex";
  }
  if (document.getElementById("multiplayerMenu")) {
    document.getElementById("multiplayerMenu").style.display = "flex";
  }
  if (document.getElementById("totalWrapper")) {
    document.getElementById("totalWrapper").style.display = "flex";
  }
  if (document.getElementById("chatWrapper")) {
    if (!document.getElementById("winner")) {
      document.getElementById("chatWrapper").style.width = "14vw";
      document.getElementById("messageWrapper").style.fontSize = "1.3vw";
      document.getElementById("messageWrapper").style.height = "70vh";
    }
  }
  if (document.getElementById("endTurnBtn")) {
    document.getElementById("endTurnBtn").style.display = "flex";
  }
});
function home() {
  removeAllChildNodes(document.getElementById("wrapper"));
  document.getElementById("wrapper").innerHTML = `
		<div class="homepage" id="title" style="margin-bottom: 10vh">Arithmio</div>
		<div style="display: flex; flex-direction: row; align-items: center; justify-content: center">
			<div class="homepageButton" id="singleplayerButton">
				<span>S</span>
				<span>o</span>
				<span>l</span>
				<span>i</span>
				<span>t</span>
				<span>a</span>
				<span>i</span>
				<span>r</span>
				<span>e</span>
			</div>
			<div class="homepageButton" id="multiplayerButton">
				<span>M</span>
				<span>u</span>
				<span>l</span>
				<span>t</span>
				<span>i</span>
				<span>p</span>
				<span>l</span>
				<span>a</span>
				<span>y</span>
				<span>e</span>
				<span>r</span>
			</div>
			<div class="homepageButton" id="aboutButton">
				<span>T</span>
				<span>u</span>
				<span>t</span>
				<span>o</span>
				<span>r</span>
				<span>i</span>
				<span>a</span>
				<span>l</span>
			</div>
		</div>
	`;
  document.getElementById("singleplayerButton").addEventListener("click", () => {
    document.getElementById("wrapper").remove();
    let singleplayerBackground = document.createElement("div");
    singleplayerBackground.id = "singleplayerBackground";
    document.getElementsByTagName("body")[0].appendChild(singleplayerBackground);
    deck = [];
    hand = [];
    cardIDCounter = 0;
    score = 0;
    isMyTurn = true;
    gameType = 0;
    isMultiplayer = false;
    lastCard = -1;
    startGame();
  });
  document.getElementById("multiplayerButton").addEventListener("click", () => {
    multiplayerChoice();
  });
  document.getElementById("aboutButton").addEventListener("click", () => {
    tutorial();
  });
}
function createCard(num, x, y, z, scaleX, scaleY, parent, id) {
  let card = document.createElement("div");
  card.style.position = "absolute";
  card.style.left = x;
  card.style.top = y;
  card.style.zIndex = z;
  card.style.width = scaleX;
  card.style.height = scaleY;
  card.className = `${num}card`;
  card.id = id;
  parent.appendChild(card);
}
function moveCard(id, x, y, z, scaleX, scaleY, time) {
  let card = document.getElementById(id);
  css.insertRule(`
		@keyframes anim${css.cssRules.length} {
			0% {
				left: ${card.style.left};
				top: ${card.style.top};
				width: ${card.style.width};
				height: ${card.style.height};
			}
			100% {
				left: ${x};
				top: ${y};
				width: ${scaleX};
				height: ${scaleY};
			}
		}
	`, css.cssRules.length);
  card.style.left = x;
  card.style.top = y;
  card.style.zIndex = z;
  card.style.width = scaleX;
  card.style.height = scaleY;
  card.style.animation = `anim${css.cssRules.length - 1} ${time}s ease-in-out`;
}
async function getLastCard(room, player) {
  const response = await fetch(`${hostname}${route}/gameInfo`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomCode: room,
      playerID: player
    }),
    method: "POST"
  });
  lastCard = response.data.lastCard;
}
function handToDest(handSize, handOrder, cardNum, isMyTurn2 = true, lastCard2 = -1) {
  let space = 5;
  let width = 9;
  let dest = [];
  if (handSize > 13) {
    space = 3;
  } else if (handSize > 9) {
    space = 4;
  }
  if (isMultiplayer) {
    space--;
  }
  if (total % cardNum != 0 || total == 0 || !isMyTurn2 || gameType === 2 || lastCard2 == cardNum || forceMath) {
    dest = [`${50 - (width + space * (handSize - 1)) / 2 + space * handOrder}vw`, `70vh`, `${handOrder}`, `${width}vw`, `25vh`];
  } else {
    dest = [`${50 - (width + space * (handSize - 1)) / 2 + space * handOrder}vw`, `67vh`, `${handOrder}`, `${width}vw`, `25vh`];
  }
  return dest;
}
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
async function shakeElement(e) {
  e.style.animation = "shake 0.5s";
  await timer(500);
  e.style.animation = "";
}
function startDrag(e) {
  focusCard = e.target ? e.target : e.srcElement;
  if (!focusCard.className.includes("card")) {
    return;
  }
  if (!isMyTurn) {
    return;
  }
  if (total % parseInt(focusCard.className) != 0) {
    if (gameType === 2) {
      loseLife();
    }
    shakeElement(focusCard);
    return;
  }
  if (e.type == "touchstart") {
    offsetX = e.touches[0].clientX;
    offsetY = e.touches[0].clientY;
  } else {
    offsetX = e.clientX;
    offsetY = e.clientY;
  }
  if (isMultiplayer && parseInt(focusCard.className) == lastCard) {
    repeatCard();
    return;
  }
  if (focusCard.style.left.includes("vw")) {
    focusX = window.innerWidth * parseFloat(focusCard.style.left) / 100;
  } else {
    focusX = parseInt(focusCard.style.left);
  }
  if (focusCard.style.top.includes("vh")) {
    focusY = window.innerHeight * parseFloat(focusCard.style.top) / 100;
  } else {
    focusY = parseFloat(focusCard.style.top);
  }
  isDragging = true;
  return false;
}
function dragCard(e) {
  if (!isDragging || !focusCard.className.includes("card") || total % parseInt(focusCard.className) != 0) {
    return;
  }
  if (e.type == "touchmove") {
    focusCard.style.left = `${focusX + e.touches[0].clientX - offsetX}px`;
    focusCard.style.top = `${focusY + e.touches[0].clientY - offsetY}px`;
  } else {
    focusCard.style.left = `${focusX + e.clientX - offsetX}px`;
    focusCard.style.top = `${focusY + e.clientY - offsetY}px`;
  }
  let increaseRect = document.getElementById("increaseTotal").getBoundingClientRect();
  let decreaseRect = document.getElementById("decreaseTotal").getBoundingClientRect();
  if (e.type == "touchmove") {
    if (e.touches[0].clientX > increaseRect.left && e.touches[0].clientX < increaseRect.right && e.touches[0].clientY > increaseRect.top && e.touches[0].clientY < increaseRect.bottom) {
      document.getElementById("totalDisplay").style.color = "green";
      lastTouch = 1;
    } else if (e.touches[0].clientX > decreaseRect.left && e.touches[0].clientX < decreaseRect.right && e.touches[0].clientY > decreaseRect.top && e.touches[0].clientY < decreaseRect.bottom) {
      document.getElementById("totalDisplay").style.color = "darkred";
      lastTouch = -1;
    } else {
      document.getElementById("totalDisplay").style.color = "black";
      lastTouch = 0;
    }
  } else {
    if (e.clientX > increaseRect.left && e.clientX < increaseRect.right && e.clientY > increaseRect.top && e.clientY < increaseRect.bottom) {
      document.getElementById("totalDisplay").style.color = "green";
    } else if (e.clientX > decreaseRect.left && e.clientX < decreaseRect.right && e.clientY > decreaseRect.top && e.clientY < decreaseRect.bottom) {
      document.getElementById("totalDisplay").style.color = "darkred";
    } else {
      document.getElementById("totalDisplay").style.color = "black";
    }
  }
  return false;
}
function stopDrag(e) {
  if (!focusCard.className.includes("card") || total % parseInt(focusCard.className) != 0 || !isMyTurn) {
    return;
  }
  if (isMultiplayer && parseInt(focusCard.className) == lastCard) {
    return;
  }
  isDragging = false;
  let destX = `${100 * focusX / window.innerWidth}vw`;
  let destY = `${100 * focusY / window.innerHeight}vh`;
  css.insertRule(`
		@keyframes anim${css.cssRules.length} {
			0% {
				left: ${focusCard.style.left};
				top: ${focusCard.style.top};
			}
			100% {
				left: ${destX};
				top: ${destY};
			}
		}
	`, css.cssRules.length);
  focusCard.style.left = destX;
  focusCard.style.top = destY;
  focusCard.style.animation = `anim${css.cssRules.length - 1} 0.5s ease-in-out`;
  let increaseRect = document.getElementById("increaseTotal").getBoundingClientRect();
  let decreaseRect = document.getElementById("decreaseTotal").getBoundingClientRect();
  if (e.type == "touchend") {
    if (lastTouch == 1) {
      total += parseInt(focusCard.className);
      changeTotal(total);
      playCard(focusCard.id, 1);
    } else if (lastTouch == -1) {
      total -= parseInt(focusCard.className);
      changeTotal(total);
      playCard(focusCard.id, -1);
    }
  } else {
    if (e.clientX > increaseRect.left && e.clientX < increaseRect.right && e.clientY > increaseRect.top && e.clientY < increaseRect.bottom) {
      total += parseInt(focusCard.className);
      changeTotal(total);
      playCard(focusCard.id, 1);
    } else if (e.clientX > decreaseRect.left && e.clientX < decreaseRect.right && e.clientY > decreaseRect.top && e.clientY < decreaseRect.bottom) {
      total -= parseInt(focusCard.className);
      changeTotal(total);
      playCard(focusCard.id, -1);
    }
  }
}
async function repeatCard() {
  shakeElement(focusCard);
  let notice = document.createElement("div");
  notice.style.position = "absolute";
  notice.style.fontSize = "1.2vw";
  notice.style.width = "15vw";
  notice.style.height = "8vh";
  notice.style.backgroundColor = "white";
  notice.style.border = "5px solid black";
  notice.style.borderRadius = "10px";
  notice.style.animation = "fade 20s";
  notice.style.zIndex = "9999";
  notice.style.display = "flex";
  notice.style.alignItems = "center";
  notice.style.justifyContent = "center";
  notice.style.left = `${offsetX}px`;
  notice.style.top = `${offsetY}px`;
  notice.style.textAlign = "center";
  notice.style.padding = "3px";
  notice.innerHTML = "<div>In multiplayer, you can't play the same card twice in a row</div>";
  document.getElementById("gameWrapper").appendChild(notice);
  await timer(2500);
  notice.remove();
}
window.onload = () => {
  document.onmousedown = startDrag;
  document.onmouseup = stopDrag;
  document.ontouchstart = startDrag;
  document.ontouchend = stopDrag;
  document.onmousemove = dragCard;
  document.ontouchmove = dragCard;
};
async function changeTotal(newTotal) {
  let totalDisplay = document.getElementById("totalDisplay");
  let tempTotal = parseInt(totalDisplay.innerHTML);
  let change = 1;
  if (tempTotal < newTotal) {
    change = 1;
    totalDisplay.style.color = "green";
  } else if (tempTotal > newTotal) {
    change = -1;
    totalDisplay.style.color = "darkred";
  }
  while (tempTotal != newTotal) {
    if (Math.abs(tempTotal - newTotal) > 200) {
      if (change > 0) {
        change = 71;
      } else {
        change = -71;
      }
    } else {
      if (change > 0) {
        change = 1;
      } else {
        change = -1;
      }
    }
    tempTotal += change;
    totalDisplay.innerHTML = tempTotal;
    if (tempTotal > 999) {
      totalDisplay.style.fontSize = "30vh";
    } else if (tempTotal > 99) {
      totalDisplay.style.fontSize = "40vh";
    } else {
      totalDisplay.style.fontSize = "50vh";
    }
    await timer(300 / (Math.abs(tempTotal - newTotal) + 1));
  }
  totalDisplay.style.color = "black";
}
async function loseLife() {
  const finalScore = score;
  document.getElementById(`life${lives}`).style.animation = "disappear 0.6s";
  await timer(500);
  document.getElementById(`life${lives}`).remove();
  lives--;
  if (lives === 0) {
    endGame(`Game over! You achieved a score of ${finalScore}`);
  }
}
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
function shuffleDeck() {
  for (let i = 0; i < deck.length * 7; i++) {
    let firstCard = Math.floor(Math.random() * deck.length);
    let secondCard = Math.floor(Math.random() * deck.length);
    [deck[firstCard], deck[secondCard]] = [deck[secondCard], deck[firstCard]];
  }
}
function drawCard() {
  let newCard;
  if (gameType == 1) {
    newCard = Math.floor(Math.random() * 1.5 * Math.sqrt(cardIDCounter + 25)) + 1;
    let goodCop = Math.floor(Math.random() * 10);
    if (goodCop == 0) {
      newCard = 1;
    }
    if (newCard > 19) {
      let badCop = Math.floor(Math.random() * 3);
      if (badCop == 0) {
        newCard = 13;
      } else if (badCop == 1) {
        newCard = 17;
      } else {
        newCard = 19;
      }
    }
  } else {
    newCard = deck.pop();
  }
  hand.push([newCard, cardIDCounter]);
  cardIDCounter++;
  createCard(`${newCard}`, "86vw", "70vh", 10, "9vw", "25vh", document.body, `${hand[hand.length - 1][1]}`);
  hand.sort((card1, card2) => {
    return card1[0] - card2[0];
  });
  moveHand();
  let hasDivisor = false;
  for (let i = 0; i < hand.length; i++) {
    if (total % hand[i][0] == 0) {
      hasDivisor = true;
    }
  }
  if (gameType == 1) {
    document.getElementById("deckDisplay").innerHTML = `Score: ${score}`;
  } else {
    document.getElementById("deckDisplay").innerHTML = `Cards Left: ${deck.length}`;
  }
  if (!hasDivisor) {
    endGame(`Game over! You achieved a score of ${score}`);
  }
}
async function drawHand() {
  for (let i = 0; i < 5; i++) {
    if (document.getElementById("wrapper")) {
      return;
    }
    drawCard();
    await timer(500);
  }
  let maxDivisors = 0;
  let min = 30;
  let max = 60;
  if (gameType == 2) {
    min = Math.floor(Math.random() * 9e3) + 500;
    max = min + 50;
  }
  for (let i = min; i <= max; i++) {
    let divisors = 0;
    for (let j = 0; j < hand.length; j++) {
      if (i % hand[j][0] == 0) {
        divisors++;
      }
    }
    if (divisors > maxDivisors) {
      maxDivisors = divisors;
      total = i;
    }
  }
  changeTotal(total);
  moveHand();
}
function moveHand() {
  for (let i = 0; i < hand.length; i++) {
    let dest = handToDest(hand.length, i, hand[i][0]);
    moveCard(hand[i][1], dest[0], dest[1], dest[2], dest[3], dest[4], 0.5);
  }
}
function playCard(id, direction) {
  if (isMultiplayer) {
    for (let i = 0; i < clientHand.length; i++) {
      if (clientHand[i][1] == id) {
        socket.emit("playCard", appRoomCode, appPlayerId, clientHand[i][0], direction);
        clientHand.splice(i, 1);
      }
    }
    document.body.removeChild(document.getElementById(id));
  } else {
    for (let i = 0; i < hand.length; i++) {
      if (hand[i][1] == id) {
        score += hand[i][0];
        hand.splice(i, 1);
      }
    }
    document.body.removeChild(document.getElementById(id));
    if (deck.length == 0 && gameType != 1) {
      if (hand.length == 0) {
        endGame("Congratulations! You win.");
        return;
      }
      moveHand();
      let hasDivisor = false;
      for (let i = 0; i < hand.length; i++) {
        if (total % hand[i][0] == 0) {
          hasDivisor = true;
        }
      }
      if (!hasDivisor) {
        endGame(`Game over! You achieved a score of ${score}`);
        return;
      }
    } else {
      drawCard();
    }
    if (total == 0) {
      endGame(`Game over! You achieved a score of ${score}`);
    }
  }
}
function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  }
}
function startGame() {
  if (document.getElementById("alertWrapper")) {
    document.getElementById("alertWrapper").remove();
  }
  let alertWrapper = document.createElement("div");
  alertWrapper.id = "alertWrapper";
  let startDisplay = document.createElement("div");
  startDisplay.id = "startDisplay";
  startDisplay.className = "gameAlert";
  startDisplay.innerHTML = "Select the gamemode you wish to play:";
  let optionWrapper = document.createElement("div");
  optionWrapper.id = "optionWrapper";
  let option1 = document.createElement("div");
  option1.className = "gameOption";
  option1.innerHTML = `
		<span>C</span>
		<span>l</span>
		<span>a</span>
		<span>s</span>
		<span>s</span>
		<span>i</span>
		<span>c</span>
	`;
  option1.addEventListener("click", () => {
    requestFullscreen(document.body);
    startClassicGame();
  });
  let option2 = document.createElement("div");
  option2.className = "gameOption";
  option2.innerHTML = `
		<span>E</span>
		<span>n</span>
		<span>d</span>
		<span>l</span>
		<span>e</span>
		<span>s</span>
		<span>s</span>
	`;
  option2.addEventListener("click", () => {
    requestFullscreen(document.body);
    startEndlessGame();
  });
  let option3 = document.createElement("div");
  option3.className = "gameOption";
  option3.innerHTML = `
		<span>H</span>
		<span>a</span>
		<span>r</span>
		<span>d</span>
		<span>c</span>
		<span>o</span>
		<span>r</span>
		<span>e</span>
	`;
  option3.addEventListener("click", () => {
    requestFullscreen(document.body);
    startHardcoreGame();
  });
  optionWrapper.appendChild(option1);
  optionWrapper.appendChild(option2);
  optionWrapper.appendChild(option3);
  startDisplay.appendChild(optionWrapper);
  alertWrapper.appendChild(startDisplay);
  document.body.appendChild(alertWrapper);
}
function startClassicGame() {
  document.getElementById("alertWrapper").remove();
  deck = [
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    6,
    6,
    6,
    6,
    7,
    7,
    7,
    7,
    8,
    8,
    8,
    8,
    9,
    9,
    9,
    9,
    10,
    10,
    10,
    10,
    11,
    11,
    11,
    11
  ];
  hand = [];
  cardIDCounter = 0;
  score = 0;
  gameType = 0;
  let deckDisplay = document.createElement("div");
  deckDisplay.id = "deckDisplay";
  deckDisplay.innerHTML = `Cards Left: ${deck.length}`;
  document.body.appendChild(deckDisplay);
  let menuButton = document.createElement("div");
  menuButton.id = "menuButton";
  menuButton.addEventListener("click", () => {
    removeAllChildNodes(document.getElementsByTagName("body")[0]);
    let homePage = document.createElement("div");
    homePage.id = "wrapper";
    homePage.className = "homepage";
    document.getElementsByTagName("body")[0].appendChild(homePage);
    interstitial();
    home();
  });
  menuButton.innerHTML = `
		<span>Q</span>
		<span>u</span>
		<span>i</span>
		<span>t</span>
	`;
  menuButton.className = "homepageButton";
  document.body.appendChild(menuButton);
  let totalWrapper = document.createElement("div");
  totalWrapper.id = "totalWrapper";
  let totalDisplay = document.createElement("div");
  totalDisplay.id = "totalDisplay";
  total = 0;
  totalDisplay.innerHTML = total;
  let decreaseTotal = document.createElement("div");
  decreaseTotal.id = "decreaseTotal";
  let increaseTotal = document.createElement("div");
  increaseTotal.id = "increaseTotal";
  totalWrapper.appendChild(decreaseTotal);
  totalWrapper.appendChild(totalDisplay);
  totalWrapper.appendChild(increaseTotal);
  document.body.appendChild(totalWrapper);
  shuffleDeck();
  drawHand();
}
function startEndlessGame() {
  document.getElementById("alertWrapper").remove();
  hand = [];
  cardIDCounter = 0;
  score = 0;
  gameType = 1;
  let deckDisplay = document.createElement("div");
  deckDisplay.id = "deckDisplay";
  deckDisplay.innerHTML = `Score: ${score}`;
  document.body.appendChild(deckDisplay);
  let menuButton = document.createElement("div");
  menuButton.id = "menuButton";
  menuButton.onclick = () => {
    removeAllChildNodes(document.getElementsByTagName("body")[0]);
    let homePage = document.createElement("div");
    homePage.id = "wrapper";
    homePage.className = "homepage";
    document.getElementsByTagName("body")[0].appendChild(homePage);
    interstitial();
    home();
  };
  menuButton.innerHTML = `
		<span>Q</span>
		<span>u</span>
		<span>i</span>
		<span>t</span>
	`;
  menuButton.className = "homepageButton";
  document.body.appendChild(menuButton);
  let totalWrapper = document.createElement("div");
  totalWrapper.id = "totalWrapper";
  let totalDisplay = document.createElement("div");
  totalDisplay.id = "totalDisplay";
  total = 0;
  totalDisplay.innerHTML = total;
  let decreaseTotal = document.createElement("div");
  decreaseTotal.id = "decreaseTotal";
  let increaseTotal = document.createElement("div");
  increaseTotal.id = "increaseTotal";
  totalWrapper.appendChild(decreaseTotal);
  totalWrapper.appendChild(totalDisplay);
  totalWrapper.appendChild(increaseTotal);
  document.body.appendChild(totalWrapper);
  drawHand();
}
function startHardcoreGame() {
  document.getElementById("alertWrapper").remove();
  hand = [];
  cardIDCounter = 0;
  score = 0;
  gameType = 2;
  lives = 3;
  deck = [
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    6,
    6,
    6,
    6,
    7,
    7,
    7,
    7,
    8,
    8,
    8,
    8,
    9,
    9,
    9,
    9,
    10,
    10,
    10,
    10,
    11,
    11,
    11,
    11
  ];
  let deckDisplay = document.createElement("div");
  deckDisplay.id = "deckDisplay";
  deckDisplay.innerHTML = `Cards Left: ${deck.length}`;
  document.body.appendChild(deckDisplay);
  let menuButton = document.createElement("div");
  menuButton.id = "menuButton";
  menuButton.onclick = () => {
    removeAllChildNodes(document.getElementsByTagName("body")[0]);
    let homePage = document.createElement("div");
    homePage.id = "wrapper";
    homePage.className = "homepage";
    document.getElementsByTagName("body")[0].appendChild(homePage);
    interstitial();
    home();
  };
  menuButton.innerHTML = `
		<span>Q</span>
		<span>u</span>
		<span>i</span>
		<span>t</span>
	`;
  menuButton.className = "homepageButton";
  document.body.appendChild(menuButton);
  let totalWrapper = document.createElement("div");
  totalWrapper.id = "totalWrapper";
  let totalDisplay = document.createElement("div");
  totalDisplay.id = "totalDisplay";
  total = 0;
  totalDisplay.innerHTML = total;
  let decreaseTotal = document.createElement("div");
  decreaseTotal.id = "decreaseTotal";
  let increaseTotal = document.createElement("div");
  increaseTotal.id = "increaseTotal";
  totalWrapper.appendChild(decreaseTotal);
  totalWrapper.appendChild(totalDisplay);
  totalWrapper.appendChild(increaseTotal);
  document.body.appendChild(totalWrapper);
  let lifeWrapper = document.createElement("div");
  lifeWrapper.id = "lifeWrapper";
  lifeWrapper.innerHTML = `
		<img class="lifeIcon" id="life3" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
		<img class="lifeIcon" id="life2" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
		<img class="lifeIcon" id="life1" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
	`;
  document.body.appendChild(lifeWrapper);
  shuffleDeck();
  drawHand();
}
function endGame(message) {
  document.getElementById("deckDisplay").remove();
  document.getElementById("totalWrapper").remove();
  document.getElementById("menuButton").remove();
  if (document.getElementById("lifeWrapper"))
    document.getElementById("lifeWrapper").remove();
  let allCards = document.querySelectorAll('[class$="card"]');
  allCards.forEach((thisCard) => {
    thisCard.remove();
  });
  let alertWrapper = document.createElement("div");
  alertWrapper.id = "alertWrapper";
  let startDisplay = document.createElement("div");
  startDisplay.id = "startDisplay";
  startDisplay.className = "gameAlert";
  startDisplay.innerHTML = `${message}`;
  let optionWrapper = document.createElement("div");
  optionWrapper.id = "optionWrapper";
  let option1 = document.createElement("div");
  option1.className = "gameOption";
  option1.innerHTML = `
		<span>M</span>
		<span>e</span>
		<span>n</span>
		<span>u</span>
	`;
  option1.onclick = () => {
    removeAllChildNodes(document.getElementsByTagName("body")[0]);
    let homePage = document.createElement("div");
    homePage.id = "wrapper";
    homePage.className = "homepage";
    document.getElementsByTagName("body")[0].appendChild(homePage);
    interstitial();
    home();
  };
  let option2 = document.createElement("div");
  option2.className = "gameOption";
  option2.innerHTML = `
		<span>N</span>
		<span>e</span>
		<span>w</span>
		<span>&nbsp;</span>
		<span>G</span>
		<span>a</span>
		<span>m</span>
		<span>e</span>
	`;
  option2.addEventListener("click", () => {
    interstitial();
    startGame();
  });
  optionWrapper.appendChild(option1);
  optionWrapper.appendChild(option2);
  startDisplay.appendChild(optionWrapper);
  alertWrapper.appendChild(startDisplay);
  document.body.appendChild(alertWrapper);
}
function tutorial() {
  removeAllChildNodes(document.getElementById("wrapper"));
  let pageWrapper = document.createElement("div");
  pageWrapper.id = "pageWrapper";
  document.getElementById("wrapper").appendChild(pageWrapper);
  goToPage(0);
}
function goToPage(tutorialPage) {
  let page = document.createElement("div");
  page.id = "page";
  if (tutorialPage == 0) {
    page.innerHTML = `
			<div id="page0Text">
				<div class="tutorialText">
					Welcome to Arithmio, a game of arithmetic and clever combinations! There are four modes: classic, endless, hardcore, and multiplayer. Each mode offers its own twist on the main premise of divisor hopping. The classic version can also be played with a standard deck of cards with Ace = 1 up to Jack = 11, removing all other cards.
				</div>
			</div>
		`;
  } else if (tutorialPage == 1) {
    page.innerHTML = `
			<div id="totalWrapper">
				<img id="decreaseTotal" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">
				<div id="totalDisplay">56</div>
				<img id="increaseTotal" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">
			</div>
			<div id="page1Text">
				<div class="tutorialText">
					The central number on screen is the Aggregate. You can only play cards whose value divides the Aggregate evenly. In this example, the Aggregate is 56 so the only playable cards would be 1, 2, 4, 7, 8 (and 14, 16 in Endless).
				</div>
			</div>
		`;
  } else if (tutorialPage == 2) {
    page.innerHTML = `
			<div id="totalWrapper">
				<img id="decreaseTotal" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">
				<div id="totalDisplay" style="color:green">63</div>
				<img id="increaseTotal" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">
			</div>
			<div id="page2Text">
				<div class="tutorialText">
					In order to play a card, <u>click and drag it onto the plus or the minus symbol</u>. Playing it on the plus will add its value to the Aggregate, while playing it on the minus will subtract it from the Aggregate. You will receive points equal to the value of the card played. If the Aggregate ever reaches 0, the game immediately ends.
				</div>
			</div>
		`;
  } else if (tutorialPage == 3) {
    page.innerHTML = `
			<div id="page3Text">
				<div class="tutorialText">
					Classic mode is the original Arithmio experience. You start with four of each number 1 through 11 randomly shuffled and your aim is to run out of cards.
				</div>
			</div>
		`;
  } else if (tutorialPage == 4) {
    page.innerHTML = `
			<div id="page4Text">
				<div class="tutorialText">
					Endless mode is entirely focused on survival. The value of cards drawn is completely random, but will also steadily increase over time. Your score is technically unlimited, but will become progressively more difficult to obtain.
				</div>
			</div>
		`;
  } else if (tutorialPage == 5) {
    page.innerHTML = `
			<div id="tutorialLifeWrapper">
				<img class="lifeIcon" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
				<img class="lifeIcon" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
				<img class="lifeIcon" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
			</div>
			<div id="page5Text">
				<div class="tutorialText">
					Hardcore is similar to classic in that the deck is finite and you win if you run through the entire deck, but you are now limited to 3 lives. Divisors of the Aggregate will no longer be emphasized, and if you attempt to play a card that is not a divisor, you will lose a life. Lose all 3 lives and the game ends. Furthermore, the initial Aggregate can be in the thousands, requiring you to truly master modular arithmetic in order to overcome this challenge.
				</div>
			</div>
		`;
  } else if (tutorialPage == 6) {
    page.innerHTML = `
			<div id="page6Text">
				<div class="tutorialText">
					During multiplayer, players take turns playing as many cards as they can before drawing new ones. Note though that you cannot play the same card twice in a row during your turn (i.e. you can play 3 -> 6 -> 3, but not 6 -> 3 -> 3). If you end your turn without playing any cards, you will draw a 1. Players compete to reach the point goal first, but can also prematurely end the game by driving the Aggregate to 0. However, the player to do so will receive a 50 point penalty before final scores are calculated.
				</div>
			</div>
		`;
  } else if (tutorialPage == 7) {
    page.innerHTML = `
			<div id="page7Text">
				<div class="tutorialText">
					You are now ready to try Arithmio! The game is meant to facilitate the learning of arithmetic, in particular division. Hope you enjoy and thanks for playing!
				</div>
			</div>
		`;
  }
  const pageCount = 7;
  if (tutorialPage == pageCount) {
    page.innerHTML = `${page.innerHTML}
			<div id="doneButton" class="tutorialButton">
				<span>D</span>
				<span>o</span>
				<span>n</span>
				<span>e</span>
			</div>
		`;
  } else {
    page.innerHTML = `${page.innerHTML}
			<div id="forwardButton" class="tutorialButton">
				<span>N</span>
				<span>e</span>
				<span>x</span>
				<span>t</span>
			</div>
		`;
  }
  page.innerHTML = `${page.innerHTML}
		<div id="backButton" class="tutorialButton">
			<span>B</span>
			<span>a</span>
			<span>c</span>
			<span>k</span>
		</div>
	`;
  removeAllChildNodes(document.getElementById("wrapper"));
  document.getElementById("wrapper").appendChild(page);
  if (document.getElementById("backButton")) {
    document.getElementById("backButton").addEventListener("click", () => {
      if (tutorialPage <= 0) {
        home();
      } else {
        goToPage(tutorialPage - 1);
      }
    });
  }
  if (document.getElementById("forwardButton")) {
    document.getElementById("forwardButton").addEventListener("click", () => {
      goToPage(tutorialPage + 1);
    });
  }
  if (document.getElementById("doneButton")) {
    document.getElementById("doneButton").addEventListener("click", () => {
      home();
    });
  }
}
function multiplayerChoice() {
  removeAllChildNodes(document.getElementById("wrapper"));
  let choiceDisplay = document.createElement("div");
  choiceDisplay.id = "choiceDisplay";
  choiceDisplay.innerHTML = `
		<div id="goHome" class="homepageButton">
			<span>B</span>
			<span>a</span>
			<span>c</span>
			<span>k</span>
		</div>
		<div id="joinGame" class="homepageButton">
			<span>J</span>
			<span>o</span>
			<span>i</span>
			<span>n</span>
		</div>
		<div id="hostGame" class="homepageButton">
			<span>H</span>
			<span>o</span>
			<span>s</span>
			<span>t</span>
		</div>
	`;
  document.getElementById("wrapper").appendChild(choiceDisplay);
  document.getElementById("goHome").addEventListener("click", () => home());
  document.getElementById("joinGame").addEventListener("click", () => join());
  document.getElementById("hostGame").addEventListener("click", () => chooseSettings());
}
function chooseSettings() {
  removeAllChildNodes(document.getElementById("wrapper"));
  let settingsDisplay = document.createElement("div");
  settingsDisplay.id = "settingsDisplay";
  settingsDisplay.innerHTML = `
		<div>Game Settings</div>
		<div id="wrapper1" class="settingsWrapper">
			<div>Players:</div>
			<input type="number" id="maxPlayers" name="maxPlayers" min="2" max="8" value="4">
		</div>
		<div id="wrapper2" class="settingsWrapper">
			<div>Victory Points:</div>
			<input type="number" id="winPoints" name="winPoints" min="100" max="1000" value="200">
		</div>
		<div id="wrapper3" class="settingsWrapper">
			<div>Game Speed:</div>
			<select id="gameSpeed" name="gameSpeed">
				<option value="-1">Unlimited</option>
				<option value="90">Slow</option>
				<option value="40" selected>Normal</option>
				<option value="20">Fast</option>
				<option value="10">Lightning</option>
			</select>
		</div>
		<div id="wrapper4" class="settingsWrapper2">
			<div id="multiplayerChoice" class="homepageButton" style="font-size:4vw">
				<span>B</span>
				<span>a</span>
				<span>c</span>
				<span>k</span>
			</div>
			<div id="createGame" class="homepageButton" style="font-size:4vw">
				<span>C</span>
				<span>r</span>
				<span>e</span>
				<span>a</span>
				<span>t</span>
				<span>e</span>
			</div>
		</div>
	`;
  document.getElementById("wrapper").appendChild(settingsDisplay);
  document.getElementById("multiplayerChoice").addEventListener("click", () => multiplayerChoice());
  document.getElementById("createGame").addEventListener("click", () => createGame());
}
function join() {
  removeAllChildNodes(document.getElementById("wrapper"));
  let joinDisplay = document.createElement("div");
  joinDisplay.id = "joinDisplay";
  joinDisplay.innerHTML = `
		<div id="wrapper1" class="settingsWrapper">
			<div>Room Code:</div>
			<input type="text" id="joinCode" name="joinCode">
		</div>
		<div id="wrapper2" class="settingsWrapper">
			<div>Name:</div>
			<input type="text" id="joinName" name="joinName">
		</div>
		<div id="wrapper3" class="settingsWrapper2">
			<div id="multiplayerChoice" class="homepageButton" style="font-size:4vw">
				<span>B</span>
				<span>a</span>
				<span>c</span>
				<span>k</span>
			</div>
			<div id="joinGame" class="homepageButton" style="font-size:4vw">
				<span>J</span>
				<span>o</span>
				<span>i</span>
				<span>n</span>
			</div>
		</div>
	`;
  document.getElementById("wrapper").appendChild(joinDisplay);
  document.getElementById("multiplayerChoice").addEventListener("click", () => multiplayerChoice());
  document.getElementById("joinGame").addEventListener("click", () => joinGame());
  document.getElementById("joinCode").addEventListener("input", () => {
    document.getElementById("joinCode").value = document.getElementById("joinCode").value.toUpperCase();
  });
}
function createGame() {
  const maxPlayers = document.getElementById("maxPlayers").value;
  const winPoints = document.getElementById("winPoints").value;
  const gameSpeed = document.getElementById("gameSpeed").value;
  if (maxPlayers != parseInt(maxPlayers)) {
    alert("Please enter a valid number of players.");
    return;
  }
  if (winPoints != parseInt(winPoints)) {
    alert("Please enter a valid score.");
    return;
  }
  fetch(`${hostname}${route}/start`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      maxPlayers,
      winPoints,
      gameSpeed
    }),
    method: "POST"
  }).then((res) => res.json()).then((data) => {
    removeAllChildNodes(document.getElementById("wrapper"));
    let codeDisplay = document.createElement("div");
    codeDisplay.id = "codeDisplay";
    codeDisplay.innerHTML = `
			<div id="codeTitle">${data.roomCode}</div>
			<div id="wrapper1" class="settingsWrapper">
				<div>Name: </div>
				<input type="text" id="joinName" name="joinName">
			</div>
			<div id="wrapper2" class="settingsWrapper2">
				<div id="multiplayerChoice" class="homepageButton" style="font-size:4vw">
					<span>B</span>
					<span>a</span>
					<span>c</span>
					<span>k</span>
				</div>
				<div id="joinGame" class="homepageButton" style="font-size:4vw">
					<span>J</span>
					<span>o</span>
					<span>i</span>
					<span>n</span>
				</div>
			</div>
		`;
    document.getElementById("wrapper").appendChild(codeDisplay);
    document.getElementById("multiplayerChoice").addEventListener("click", () => multiplayerChoice());
    document.getElementById("joinGame").addEventListener("click", () => joinGame());
  }).catch((err) => {
    console.log(err);
  });
}
function joinGame() {
  let code;
  if (document.getElementById("joinCode")) {
    code = document.getElementById("joinCode").value;
  } else {
    code = document.getElementById("codeTitle").innerHTML;
  }
  console.log(code);
  let name = document.getElementById("joinName").value;
  if (name.length > 13) {
    alert("Please pick a shorter name.");
    return;
  }
  for (let i = 0; i < name.length; i++) {
    let ascii = name.charCodeAt(i);
    if (!(ascii > 47 && ascii < 58) && !(ascii > 64 && ascii < 91) && !(ascii > 96 && ascii < 123)) {
      alert("Please use valid characters in name.");
      return;
    }
  }
  fetch(`${hostname}${route}/join`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      joinCode: code,
      joinName: name
    }),
    method: "POST"
  }).then((res) => res.json()).then((data) => {
    if (data.access === "dne") {
      alert("Room does not exist.");
    } else if (data.access === "full") {
      alert("Room is full.");
    } else if (data.access === "dupl") {
      alert("That name is already taken.");
    } else if (data.access === "granted") {
      appRoomCode = code;
      appPlayerId = data.playerID;
      clientHand = [];
      cardIDCounter = 0;
      isMyTurn = false;
      clientTurn = -1;
      isMultiplayer = true;
      socket.emit("joinArithmio", appRoomCode, appPlayerId);
      let multiplayerBackground = document.createElement("div");
      multiplayerBackground.id = "multiplayerBackground";
      let gameWrapper = document.createElement("div");
      gameWrapper.id = "gameWrapper";
      document.getElementById("wrapper").remove();
      document.getElementsByTagName("body")[0].appendChild(multiplayerBackground);
      document.getElementsByTagName("body")[0].appendChild(gameWrapper);
      getLastCard(appRoomCode, appPlayerId);
    }
  }).catch((err) => {
    console.log(err);
  });
}
socket.on("updateArithmio", (gameState) => {
  renderGame(gameState);
});
socket.on("sendChat", (name, message) => {
  if (document.getElementById("messageWrapper")) {
    let messageWrapper = document.getElementById("messageWrapper");
    let chatMessage = document.createElement("div");
    chatMessage.className = "chatMessage";
    if (messageWrapper.children.length % 2 == 0) {
      chatMessage.style.backgroundColor = "white";
    } else {
      chatMessage.style.backgroundColor = "#dddddd";
    }
    let chatName = document.createElement("div");
    chatName.className = "chatName";
    chatName.textContent = `${name}:`;
    let chatContent = document.createElement("div");
    chatContent.className = "chatContent";
    chatContent.textContent = `${message}`;
    chatMessage.appendChild(chatName);
    chatMessage.appendChild(chatContent);
    messageWrapper.insertBefore(chatMessage, messageWrapper.firstChild);
    if (document.getElementById("winner")) {
      let messages = messageWrapper.children;
      for (let i = 0; i < messages.length; i++) {
        if (i > 9) {
          messages[i].remove();
        } else {
          messages[i].style.opacity = `${1 - 0.1 * i}`;
        }
      }
    }
  }
});
async function moveHandMultiplayer(isMyTurn2) {
  for (let i = 0; i < clientHand.length; i++) {
    let dest = handToDest(clientHand.length, i, clientHand[i][0], isMyTurn2, lastCard);
    moveCard(clientHand[i][1], dest[0], dest[1], dest[2], dest[3], dest[4], 0.5);
  }
}
async function displayTimer(parentPlayer, totalTime, turnNumber) {
  if (document.getElementById("playerTimer"))
    document.getElementById("playerTimer").remove();
  let playerTimer = document.createElement("div");
  playerTimer.id = "playerTimer";
  if (parentPlayer.id.includes("player")) {
    let rect = parentPlayer.getBoundingClientRect();
    playerTimer.style.height = `${rect.bottom - rect.top}px`;
    playerTimer.style.left = "-3px";
  }
  parentPlayer.appendChild(playerTimer);
  if (totalTime <= 0) {
    return;
  }
  totalTime *= 1e3;
  let timedTime = 0;
  const timeIncrement = 50;
  while (timedTime < totalTime) {
    timedTime += timeIncrement;
    let timeout = timedTime;
    setTimeout(() => {
      if (clientTurn == turnNumber && document.getElementById("playerTimer")) {
        document.getElementById("playerTimer").style.width = `${103 * timeout / totalTime}%`;
      }
    }, timeout);
  }
  await timer(totalTime);
  socket.emit("forceEndTurn", appRoomCode, appPlayerId, turnNumber);
  return;
}
function renderGame(gameState) {
  if (gameState.phase == 0) {
    let playerList = ``;
    for (let i = 0; i < gameState.players.length; i++) {
      playerList += `<div>${gameState.players[i].name}</div>`;
    }
    document.getElementById("gameWrapper").innerHTML = `
			<div id="lobbyDisplay">
				<div id="codeTitle">${appRoomCode}</div>
				<div id="playerCount">Players: ${gameState.players.length}/${gameState.settings.maxPlayers}</div>
				<div id="playerDisplay">
					${playerList}
				</div>
			</div>
		`;
  } else if (gameState.phase == 1) {
    if (document.getElementById("lobbyDisplay"))
      document.getElementById("lobbyDisplay").remove();
    if (document.getElementById("totalWrapper"))
      document.getElementById("totalWrapper").remove();
    isMyTurn = appPlayerId == gameState.game.turn % gameState.players.length;
    lastCard = gameState.players[appPlayerId].lastCard;
    let totalWrapper = document.createElement("div");
    totalWrapper.id = "totalWrapper";
    totalWrapper.style.width = "90vw";
    let totalDisplay = document.createElement("div");
    totalDisplay.id = "totalDisplay";
    totalDisplay.innerHTML = total;
    let decreaseTotal = document.createElement("div");
    decreaseTotal.id = "decreaseTotal";
    decreaseTotal.style.width = "12vw";
    let increaseTotal = document.createElement("div");
    increaseTotal.id = "increaseTotal";
    increaseTotal.style.width = "12vw";
    if (!isMyTurn) {
      decreaseTotal.style.visibility = "hidden";
      increaseTotal.style.visibility = "hidden";
    }
    if (keyboardUp) {
      totalWrapper.style.display = "none";
    }
    totalWrapper.appendChild(decreaseTotal);
    totalWrapper.appendChild(totalDisplay);
    totalWrapper.appendChild(increaseTotal);
    document.getElementById("gameWrapper").appendChild(totalWrapper);
    if (total != gameState.game.total) {
      changeTotal(gameState.game.total);
      total = gameState.game.total;
    }
    if (total > 999) {
      totalDisplay.style.fontSize = "30vh";
    } else if (total > 99) {
      totalDisplay.style.fontSize = "40vh";
    } else {
      totalDisplay.style.fontSize = "50vh";
    }
    if (clientHand != gameState.players[appPlayerId].hand) {
      let tempClientHand = [];
      let tempServerHand = [];
      for (let i = 0; i < clientHand.length; i++) {
        tempClientHand.push(clientHand[i]);
      }
      for (let i = 0; i < gameState.players[appPlayerId].hand.length; i++) {
        tempServerHand.push(gameState.players[appPlayerId].hand[i]);
      }
      for (let i = 0; i < tempServerHand.length; i++) {
        for (let j = 0; j < tempClientHand.length; j++) {
          if (tempClientHand[j][0] == tempServerHand[i]) {
            tempClientHand.splice(j, 1);
            tempServerHand.splice(i, 1);
            i--;
            j = tempClientHand.length;
          }
        }
      }
      for (let i = 0; i < tempServerHand.length; i++) {
        clientHand.push([tempServerHand[i], cardIDCounter]);
        cardIDCounter++;
        createCard(`${tempServerHand[i]}`, "86vw", "70vh", 10, "9vw", "25vh", document.body, `${clientHand[clientHand.length - 1][1]}`);
        clientHand.sort((card1, card2) => {
          return card1[0] - card2[0];
        });
      }
      moveHandMultiplayer(isMyTurn);
    }
    if (gameState.game.turn != clientTurn) {
      if (document.getElementById("playerInfo"))
        document.getElementById("playerInfo").remove();
      let playerInfo = document.createElement("div");
      playerInfo.id = "playerInfo";
      for (let i = 1; i < gameState.players.length; i++) {
        let thisPlayerWrapper = document.createElement("div");
        thisPlayerWrapper.id = `${(appPlayerId + i) % gameState.players.length}player`;
        thisPlayerWrapper.className = "playerWrapper";
        let thisPlayerName = document.createElement("div");
        thisPlayerName.className = "playerName";
        thisPlayerName.innerHTML = `${gameState.players[(appPlayerId + i) % gameState.players.length].name}:`;
        let thisPlayerScore = document.createElement("div");
        thisPlayerScore.className = "playerScore";
        if (gameState.players[(appPlayerId + i) % gameState.players.length].hasResigned) {
          thisPlayerScore.innerHTML = `X`;
        } else {
          thisPlayerScore.innerHTML = `${gameState.players[(appPlayerId + i) % gameState.players.length].score}`;
        }
        if (gameState.players[(appPlayerId + i) % gameState.players.length].name.length > 8) {
          thisPlayerName.style.fontSize = "1.5vw";
        }
        if ((appPlayerId + i) % gameState.players.length == gameState.game.turn % gameState.players.length) {
          thisPlayerWrapper.style.boxShadow = "0 0 5px 2px #000000, 0 0 5px 2px #000000, 0 0 5px 2px #000000";
          thisPlayerWrapper.style.borderRadius = "15px";
        } else {
          thisPlayerWrapper.style.boxShadow = "none";
        }
        thisPlayerWrapper.appendChild(thisPlayerName);
        thisPlayerWrapper.appendChild(thisPlayerScore);
        playerInfo.appendChild(thisPlayerWrapper);
      }
      if (keyboardUp) {
        playerInfo.style.display = "none";
      }
      document.getElementById("gameWrapper").appendChild(playerInfo);
    }
    if (document.getElementById("endTurnBtn"))
      document.getElementById("endTurnBtn").remove();
    if (isMyTurn) {
      let endTurnBtn = document.createElement("div");
      endTurnBtn.id = "endTurnBtn";
      endTurnBtn.innerHTML = "End Turn";
      endTurnBtn.onclick = () => {
        socket.emit("endTurn", appRoomCode, appPlayerId);
      };
      if (keyboardUp) {
        endTurnBtn.style.display = "none";
      }
      document.getElementById("gameWrapper").appendChild(endTurnBtn);
    }
    if (!document.getElementById("myInfo")) {
      let myInfo = document.createElement("div");
      myInfo.id = "myInfo";
      let myName = document.createElement("div");
      myName.id = "myName";
      myName.innerHTML = `${gameState.players[appPlayerId].name}:`;
      let myScore = document.createElement("div");
      myScore.id = "myScore";
      if (gameState.players[appPlayerId].hasResigned) {
        myScore.innerHTML = `X`;
      } else {
        myScore.innerHTML = `${gameState.players[appPlayerId].score}`;
      }
      if (gameState.players[appPlayerId].name.length > 10) {
        myName.style.fontSize = "2.5vw";
      } else if (gameState.players[appPlayerId].name.length > 7) {
        myName.style.fontSize = "3vw";
      } else if (gameState.players[appPlayerId].name.length > 4) {
        myName.style.fontSize = "3.5vw";
      }
      if (keyboardUp) {
        myInfo.style.display = "none";
      }
      myInfo.appendChild(myName);
      myInfo.appendChild(myScore);
      document.getElementById("gameWrapper").appendChild(myInfo);
    } else {
      if (gameState.players[appPlayerId].hasResigned) {
        document.getElementById("myScore").innerHTML = `X`;
      } else {
        document.getElementById("myScore").innerHTML = `${gameState.players[appPlayerId].score}`;
      }
    }
    if (isMyTurn) {
      document.getElementById("myInfo").style.boxShadow = "0 0 5px 3px #000000, 0 0 5px 3px #000000, 0 0 5px 3px #000000";
      document.getElementById("myInfo").style.borderRadius = "15px";
    } else {
      document.getElementById("myInfo").style.boxShadow = "none";
    }
    if (!document.getElementById("multiplayerMenu")) {
      let multiplayerMenu = document.createElement("div");
      multiplayerMenu.id = "multiplayerMenu";
      let objectiveDisplay = document.createElement("div");
      objectiveDisplay.id = "objectiveDisplay";
      objectiveDisplay.innerHTML = `First to ${gameState.settings.winPoints}`;
      let resignButton = document.createElement("div");
      resignButton.id = "resignButton";
      resignButton.innerHTML = `Resign`;
      resignButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to resign?")) {
          socket.emit("resignGame", appRoomCode, appPlayerId);
        }
      });
      multiplayerMenu.appendChild(objectiveDisplay);
      multiplayerMenu.appendChild(resignButton);
      document.getElementById("gameWrapper").appendChild(multiplayerMenu);
    }
    if (gameState.game.turn != clientTurn) {
      clientTurn = gameState.game.turn;
      if (isMyTurn) {
        displayTimer(document.getElementById("myInfo"), gameState.settings.gameSpeed, gameState.game.turn);
      } else {
        displayTimer(document.getElementById(`${gameState.game.turn % gameState.players.length}player`), gameState.settings.gameSpeed, gameState.game.turn);
      }
    }
    if (!document.getElementById("chatWrapper")) {
      let chatWrapper = document.createElement("div");
      chatWrapper.id = "chatWrapper";
      let inputWrapper = document.createElement("div");
      inputWrapper.id = "inputWrapper";
      let inputBox = document.createElement("input");
      inputBox.type = "text";
      inputBox.name = "inputBox";
      inputBox.id = "inputBox";
      inputBox.addEventListener("keyup", ({ key }) => {
        if (key === "Enter") {
          socket.emit("sendChat", appRoomCode, appPlayerId, document.getElementById("inputBox").value);
          document.getElementById("inputBox").value = "";
        }
      });
      let inputBtn = document.createElement("div");
      inputBtn.id = "inputBtn";
      inputBtn.innerHTML = "Chat";
      inputBtn.onclick = () => {
        socket.emit("sendChat", appRoomCode, appPlayerId, document.getElementById("inputBox").value);
        document.getElementById("inputBox").value = "";
      };
      let messageWrapper = document.createElement("div");
      messageWrapper.id = "messageWrapper";
      inputWrapper.appendChild(inputBox);
      inputWrapper.appendChild(inputBtn);
      chatWrapper.appendChild(inputWrapper);
      chatWrapper.appendChild(messageWrapper);
      document.getElementById("gameWrapper").appendChild(chatWrapper);
    }
  } else if (gameState.phase == 2) {
    removeAllChildNodes(document.getElementById("gameWrapper"));
    const allImgs = document.querySelectorAll("img");
    for (let i = 0; i < allImgs.length; i++) {
      allImgs[i].remove();
    }
    const allCards = document.querySelectorAll('[class$="card"]');
    for (let i = 0; i < allCards.length; i++) {
      allCards[i].remove();
    }
    if (!document.getElementById("chatWrapper")) {
      let chatWrapper = document.createElement("div");
      chatWrapper.id = "chatWrapper";
      chatWrapper.style.width = "90vw";
      chatWrapper.style.right = "5vw";
      chatWrapper.style.bottom = "3vh";
      chatWrapper.style.fontSize = "2vw";
      chatWrapper.style.top = "unset";
      chatWrapper.style.justifyContent = "flex-end";
      let inputWrapper = document.createElement("div");
      inputWrapper.id = "inputWrapper";
      inputWrapper.style.marginTop = "2vh";
      inputWrapper.style.marginBottom = "0";
      let inputBox = document.createElement("input");
      inputBox.type = "text";
      inputBox.name = "inputBox";
      inputBox.id = "inputBox";
      inputBox.style.fontSize = "2vw";
      inputBox.addEventListener("keyup", ({ key }) => {
        if (key === "Enter") {
          socket.emit("sendChat", appRoomCode, appPlayerId, document.getElementById("inputBox").value);
          document.getElementById("inputBox").value = "";
        }
      });
      let inputBtn = document.createElement("div");
      inputBtn.id = "inputBtn";
      inputBtn.innerHTML = "Chat";
      inputBtn.onclick = () => {
        socket.emit("sendChat", appRoomCode, appPlayerId, document.getElementById("inputBox").value);
        document.getElementById("inputBox").value = "";
      };
      inputBtn.style.width = "10%";
      let leaveBtn = document.createElement("div");
      leaveBtn.id = "leaveBtn";
      leaveBtn.innerHTML = "Leave";
      leaveBtn.onclick = () => {
        removeAllChildNodes(document.getElementsByTagName("body")[0]);
        let homePage = document.createElement("div");
        homePage.id = "wrapper";
        homePage.className = "homepage";
        document.getElementsByTagName("body")[0].appendChild(homePage);
        interstitial();
        home();
      };
      leaveBtn.style.width = "10%";
      let messageWrapper = document.createElement("div");
      messageWrapper.id = "messageWrapper";
      messageWrapper.style.flexDirection = "column-reverse";
      inputWrapper.appendChild(inputBox);
      inputWrapper.appendChild(inputBtn);
      inputWrapper.appendChild(leaveBtn);
      chatWrapper.appendChild(messageWrapper);
      chatWrapper.appendChild(inputWrapper);
      document.getElementById("gameWrapper").appendChild(chatWrapper);
    }
    if (!document.getElementById("winDisplay")) {
      gameState.players.sort((player1, player2) => {
        return player2.score - player1.score;
      });
      let finishedPlayers = gameState.players.filter((player) => !player.hasResigned);
      let rankingsDisplay = ``;
      for (let i = 0; i < finishedPlayers.length; i++) {
        rankingsDisplay += `
					<div class="ranking">
						<div class="rankingName">${finishedPlayers[i].name}</div>
						<div class="rankingScore">${finishedPlayers[i].score}</div>
					</div>
				`;
      }
      let winDisplay = document.createElement("div");
      winDisplay.id = "winDisplay";
      winDisplay.innerHTML = `
				<div id="winner">${finishedPlayers[0].name} wins!</div>
				${rankingsDisplay}
			`;
      document.getElementById("gameWrapper").appendChild(winDisplay);
    }
  }
}
interstitial();
home();
export { WebPlugin as W };
