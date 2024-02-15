import * as core from "casbin-core";

export class CAccessManager {
  private enforcer?: core.Enforcer;
  private onInitCallbacksQueue: (() => void)[] = [];

  /**
   * Inits core enforcer with following model and policy
   *
   * @example
   * const model = `
   * [request_definition]
   * r = sub, obj, act
   *
   * [policy_definition]
   * p = sub, obj, act
   *
   * [policy_effect]
   * e = some(where (p.eft == allow))
   *
   * [matchers]
   * m = r.sub == p.sub && r.obj == p.obj && r.act == p.act
   * `
   *
   * const policy = `
   * p, alice, data1, read
   * p, bob, data2, write
   * ` | [
   *    ["p", "alice", "data1", "read"],
   *    ["p", "bob", "data2", "write"],
   *  ]
   *
   * @param model - a model configuration
   * @param policy - policy formatted as a CSV string, or policy array.
   */
  public async init(model: string, policy: string | string[][]) {
    const m = new core.Model(model);
    core.newSyncedEnforcer();
    const adapter = new core.MemoryAdapter(policy);

    this.enforcer = await core.newEnforcer(m, adapter);
    await this.flushOnInitCallbacksQueue();
  }

  public isInited(): boolean {
    return !!this.enforcer;
  }

  /**
   * removes inited enforcer
   *
   * After `reset` you must reinitialize `CAccessManager`
   */
  public reset() {
    this.enforcer = undefined;
  }

  public setEnforcer(enforcer: core.Enforcer) {
    this.enforcer = enforcer;
  }

  public getEnforcer() {
    return this.enforcer;
  }

  /**
   * Runs all function in `onInitCallbacksQueue` and removes them from queue
   */
  private async flushOnInitCallbacksQueue() {
    if (!this.onInitCallbacksQueue.length) return;
    while (this.onInitCallbacksQueue.length) {
      const func = this.onInitCallbacksQueue.shift();
      if (func) func();
    }
  }

  /**
   * Add function to queue of function, which runs once on init and removes from queue
   * @param func is function which runs after initing enforcer
   */
  public addListenerToInitCallbackQueue(func: () => void) {
    this.onInitCallbacksQueue.push(func);
  }

  /**
   * enforce decides whether a "subject" can access a "object" with
   * the operation "action", input parameters are usually: (sub, obj, act).
   *
   * @throws when enforcer is not initialized.
   * @throws when rvals count not match it can throw error.
   *
   * @param rvals the request needs to be mediated, usually an array
   *              of strings, can be class instances if ABAC is used.
   * @returns whether to allow the request.
   */
  public async can(...rvals: string[]): Promise<boolean> {
    if (!this.isInited()) throw new Error("Enforcer is not initialized");
    return await this.enforcer!.enforce(...rvals);
  }

  /**
   * @throws when enforcer is not initialized.
   * @throws when rvals count not match it can throw error.
   *
   * @param listRvals
   * @returns `true` if function `can` returns `true` for one of `listRvals` result
   */
  public async canAny(listRvals: string[][]): Promise<boolean> {
    if (!this.isInited()) throw new Error("Enforcer is not initialized");
    for (let i = 0; i < listRvals.length; i++) {
      const canThis = await this.can(...listRvals[i]);
      if (!canThis) continue;
      return true;
    }
    return false;
  }

  /**
   * @throws when enforcer is not initialized.
   * @throws when rvals count not match it can throw error.
   *
   * @param listRvals
   * @returns `true` if function `can` returns `true` for all `listRvals` results
   */
  public async canAll(listRvals: string[][]): Promise<boolean> {
    if (!this.isInited()) throw new Error("Enforcer is not initialized");
    for (let i = 0; i < listRvals.length; i++) {
      const canThis = await this.can(...listRvals[i]);
      if (!canThis) return false;
    }
    return true;
  }
}
