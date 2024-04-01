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

import Keyv from "keyv";
import Redis from "@keyv/redis";
import Etcd from "@keyv/etcd";
import dotenv from "dotenv";
import { IncomingMessage, ServerResponse } from "http";

dotenv.config();

type SessionId = string;
type Value = string | boolean | number;
type KeyValue = {
  [key: string]: Value;
};

function keyvStoreResolver(
  url: string | undefined
): Keyv.Store<string | undefined> | undefined {
  if (url && url.startsWith("redis://")) return new Redis(url);
  if (url && url.startsWith("etcd://")) return new Etcd(url);
  return undefined;
}

export class Session {
  /* prettier-ignore */ private static readonly DB_URL = process.env.SESSION_DB_URL;
  /* prettier-ignore */ private static keyv = new Keyv<KeyValue>({ store: keyvStoreResolver(Session.DB_URL)});
  /* prettier-ignore */ private res: ServerResponse<IncomingMessage>;
  /* prettier-ignore */ private sessid: string;

  constructor(
    req: IncomingMessage & { cookies: Partial<{ [key: string]: string }> },
    res: ServerResponse<IncomingMessage>
  ) {
    this.res = res;
    this.sessid = req.cookies["sessid"] ? req.cookies["sessid"] : crypto.randomUUID();
  }

  setId(sessionId: string): void {
    const cookiev = `sessid=${sessionId}; Max-Age=${7 * 24 * 60 * 60}; Path=/`;
    this.res.setHeader("Set-Cookie", cookiev);
  }

  public async getId(): Promise<SessionId> {
    if (!this.sessid) {
      this.sessid = crypto.randomUUID();
      this.setId(this.sessid);
    }
    return this.sessid;
  }

  public async regenerateId() {
    const value = await Session.keyv.get(this.sessid);
    Session.keyv.delete(this.sessid);
    this.sessid = crypto.randomUUID();
    this.setId(this.sessid);
    Session.keyv.set(this.sessid, value ? value : {}, 7 * 24 * 60 * 60 * 1000);
    return this.sessid;
  }

  public async destroy() {
    if (this.sessid) {
      Session.keyv.delete(this.sessid);
      this.sessid = "";
    }
    this.sessid = crypto.randomUUID();
    this.setId(this.sessid);
  }

  public async get(key: string = "") {
    const sessionId = await this.getId();
    let value = await Session.keyv.get(sessionId);
    if (key.length) return value ? value[key] : null;
    else return value ? value : null;
  }

  public async set(key: string, value: Value) {
    const sessionId = await this.getId();
    let obj = await Session.keyv.get(sessionId);
    obj = Object.assign(obj ? obj : {}, { [key]: value });
    return await Session.keyv.set(sessionId, obj, 7 * 24 * 60 * 60);
  }
}
