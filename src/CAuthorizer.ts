import * as core from "casbin-core";

const errEnforcerNotInitialized = new Error("Enforcer is not initialized");

export class CAuthorizer {
  private enforcer?: core.Enforcer;
  /**
   * callback function thats runs and flushes after successful calling funciton init
   */
  private initOneTimeCallbacks: (() => void)[] = [];

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
    await this.executeInitOneTimeCallbacks();
  }

  public isInited(): boolean {
    return !!this.enforcer;
  }

  /**
   * removes inited enforcer
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
   * Runs all function in `initOneTimeCallbacks` with removing them
   */
  private async executeInitOneTimeCallbacks() {
    if (!this.initOneTimeCallbacks.length) return;
    while (this.initOneTimeCallbacks.length) {
      const func = this.initOneTimeCallbacks.shift();
      if (func) func();
    }
  }

  /**
   * Add function to queue of function, which runs once on init and removes from queue
   * @param func is function which runs after initing enforcer
   */
  public addToInitOneTimeCallbacks(func: () => void) {
    this.initOneTimeCallbacks.push(func);
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
  public async can(rvals: string[]): Promise<boolean> {
    if (!this.isInited()) throw errEnforcerNotInitialized;
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
    if (!this.isInited()) throw errEnforcerNotInitialized;
    for (let i = 0; i < listRvals.length; i++) {
      const allowed = await this.can(listRvals[i]);
      if (!allowed) continue;
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
    if (!this.isInited()) throw errEnforcerNotInitialized;
    for (let i = 0; i < listRvals.length; i++) {
      const allowed = await this.can(listRvals[i]);
      if (!allowed) return false;
    }
    return true;
  }

  /**
   * @throws when enforcer is not initialized.
   * @throws when rvals count not match it can throw error.
   *
   * @param listRvals
   * @returns a filtered `listRvals` containing only the elements for which the `can` method returned `true`
   *
   * @example
   * // ? after initizlization `CAuthoraizer` with permissions
   * const rvalsA = ["fish", "swim", "water"]
   * const rvalsB = ["fish", "fly", "air"]
   *
   * console.log(await auth.can(rvalsA)) // true
   * console.log(await auth.can(rvalsB)) // false
   *
   * console.log(await auth.filterByCan([rvalsA, rvalsB])) // [ [ 'fish', 'swim', 'water' ] ]
   */
  public async filterByCan(listRvals: string[][]): Promise<string[][]> {
    if (!this.isInited()) throw errEnforcerNotInitialized;

    const result: string[][] = [];
    for (let i = 0; i < listRvals.length; i++) {
      const allowed = await this.can(listRvals[i]);
      if (!allowed) continue;
      result.push(listRvals[i]);
    }
    return result;
  }
}
