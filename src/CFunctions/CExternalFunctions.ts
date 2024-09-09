import { CInternalFunctions } from "./CInternalFunctions";
import { TFunc } from "./types";

export class CExternalFunctions {
  private controller: CInternalFunctions;

  constructor(_controller: CInternalFunctions) {
    this.controller = _controller;
  }

  push(func: TFunc) {
    this.controller.push(func);
  }

  remove(func: TFunc) {
    this.controller.remove(func);
  }

  set(arr: TFunc[]) {
    this.controller.set(arr);
  }

  clear() {
    this.controller.clear();
  }
}
