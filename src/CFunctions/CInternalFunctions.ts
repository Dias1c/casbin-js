import { TFunc } from "./types";

/**
 * CInternalFunctions - internal class that used for internal operations in CAuthorizer class
 */
export class CInternalFunctions {
  array: TFunc[];

  constructor() {
    this.array = [];
  }

  set(arr: TFunc[]) {
    this.array = arr;
  }

  clear() {
    this.array = [];
  }

  push(func: TFunc) {
    this.array.push(func);
  }

  remove(func: TFunc) {
    this.array = this.array.filter((el) => {
      if (el == func) return false;
      return true;
    });
  }

  async executeAll() {
    const arr = this.array;
    for (let i = 0; i < arr.length; i++) {
      const func = arr[i];
      await func();
    }
  }

  async executeAllAndClear() {
    if (!this.array.length) return;
    while (this.array.length) {
      const func = this.array.shift();
      if (func) await func();
    }
  }
}
