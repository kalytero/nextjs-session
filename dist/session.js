"use strict";
/* ******************************************************************************************************************** */
/*                                                                                                                      */
/*                                                      :::    :::     :::     :::     :::   ::: ::::::::::: :::::::::: */
/*   session.ts                                        :+:   :+:    :+: :+:   :+:     :+:   :+:     :+:     :+:         */
/*                                                    +:+  +:+    +:+   +:+  +:+      +:+ +:+      +:+     +:+          */
/*   By: yus-sato <yushin-sato@kalytero.ne.jp>       +#++:++    +#++:++#++: +#+       +#++:       +#+     +#++:++#      */
/*                                                  +#+  +#+   +#+     +#+ +#+        +#+        +#+     +#+            */
/*   Created: 2024/03/23 01:46:26 by yus-sato      #+#   #+#  #+#     #+# #+#        #+#        #+#     #+#             */
/*   Updated: 2024/03/29 23:54:28 by yus-sato     ###    ### ###     ### ########## ###        ###     ##########.ro    */
/*                                                                                                                      */
/* ******************************************************************************************************************** */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const keyv_1 = __importDefault(require("keyv"));
const redis_1 = __importDefault(require("@keyv/redis"));
const etcd_1 = __importDefault(require("@keyv/etcd"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function keyvStoreResolver(url) {
    if (url && url.startsWith("redis://"))
        return new redis_1.default(url);
    if (url && url.startsWith("etcd://"))
        return new etcd_1.default(url);
    return undefined;
}
class Session {
    constructor(req, res) {
        this.res = res;
        this.sessid = req.cookies["sessid"] ? req.cookies["sessid"] : "";
    }
    setId(sessionId) {
        const cookiev = `sessid=${sessionId}; Max-Age=${7 * 24 * 60 * 60}; Path=/`;
        this.res.setHeader("Set-Cookie", cookiev);
    }
    getId() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sessid)
                this.sessid = crypto.randomUUID();
            return this.sessid;
        });
    }
    regenerateId() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield Session.keyv.get(this.sessid);
            Session.keyv.delete(this.sessid);
            this.sessid = crypto.randomUUID();
            this.setId(this.sessid);
            Session.keyv.set(this.sessid, value ? value : {}, 7 * 24 * 60 * 60 * 1000);
            return this.sessid;
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sessid) {
                Session.keyv.delete(this.sessid);
                this.sessid = "";
            }
            this.sessid = crypto.randomUUID();
            this.setId(this.sessid);
        });
    }
    get() {
        return __awaiter(this, arguments, void 0, function* (key = "") {
            const sessionId = yield this.getId();
            let value = yield Session.keyv.get(sessionId);
            if (key.length)
                return value ? value[key] : null;
            else
                return value ? value : null;
        });
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionId = yield this.getId();
            let obj = yield Session.keyv.get(sessionId);
            obj = Object.assign(obj ? obj : {}, { [key]: value });
            return yield Session.keyv.set(sessionId, obj, 7 * 24 * 60 * 60);
        });
    }
}
exports.Session = Session;
/* prettier-ignore */ Session.DB_URL = process.env.SESSION_DB_URL;
/* prettier-ignore */ Session.keyv = new keyv_1.default({ store: keyvStoreResolver(Session.DB_URL) });
//# sourceMappingURL=session.js.map