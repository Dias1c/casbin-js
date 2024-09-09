import { ReactNode, useCallback, useEffect, useState } from "react";
import { CAuthorizer } from "../src";
import { getPermissionsFromBackend } from "./configs";

// ? !!! IMPORTANT
// ? this code not runs in this project
// ? try to run following code in your project, and see how it works

const Authorizer = new CAuthorizer();

let isLoading = false;
const loadPermissions = async (onInitCallback?: () => void) => {
  if (onInitCallback) Authorizer.onInitDisposableCallbacks.push(onInitCallback);
  if (isLoading) return;

  try {
    isLoading = true;
    const data = await getPermissionsFromBackend();
    await Authorizer.init(data.m, data.p);
    isLoading = false;
  } catch (e) {
    isLoading = false;
    throw e;
  }
};

/**
 * @returns permissions for given rvals
 */
export function useAuthorizerCan(rvals: string[]) {
  const [available, setAvailable] = useState(false);

  const loadIsAvailable = useCallback(async () => {
    const setAvailableAfterInit = async () => {
      setAvailable(await Authorizer.can(rvals));
    };

    try {
      if (!Authorizer.isInited()) {
        await loadPermissions(setAvailableAfterInit);
      } else {
        await setAvailableAfterInit();
      }
    } catch (error) {
      console.error("loadIsAvailable", error);
      setAvailable(false);
    }
  }, [...rvals]);

  useEffect(() => {
    loadIsAvailable();
  }, [...rvals, Authorizer.isInited()]);

  useEffect(() => {
    const syncFunction = loadIsAvailable;
    Authorizer.onInitCallbacks.push(syncFunction);
    return () => {
      Authorizer.onInitCallbacks.remove(syncFunction);
    };
  }, [available]);

  return { available };
}

/**
 * @returns children - if `Authorizer.can(rvals)` returns true
 * @returns childrenOnRestricted - if `Authorizer.can(rvals)` returns false
 */
export const AuthorizerCan = ({
  rvals,
  children,
  childrenOnRestricted,
}: {
  rvals: string[];
  children: ReactNode;
  childrenOnRestricted?: ReactNode;
}) => {
  const { available } = useAuthorizerCan(rvals);

  if (available) return children;
  return childrenOnRestricted;
};

/**
 *
 * @param listRvals array of rvals
 * @returns filtered array of rvals where `Authorizer.can()` returned true
 */
export function useAuthorizerCanListRvals(listRvals: string[][]) {
  const [availableListRvals, setAvailableListRvals] = useState<string[][]>([]);

  const loadIsAvailable = async () => {
    const setAvailableAfterInit = async () => {
      let result: string[][] = await Authorizer.filterByCan(listRvals);
      setAvailableListRvals(result);
    };

    try {
      if (!Authorizer.isInited()) {
        await loadPermissions(setAvailableAfterInit);
      } else {
        await setAvailableAfterInit();
      }
    } catch (error) {
      console.error("loadIsAvailable", error);
      setAvailableListRvals([]);
    }
  };

  useEffect(() => {
    loadIsAvailable();
  }, [...listRvals, Authorizer.isInited()]);

  return { availableListRvals };
}

export function App() {
  const { availableListRvals } = useAuthorizerCanListRvals([
    ["fish", "swim", "water"],
    ["bird", "swim", "water"],
    ["bird", "breathe", "water"],
  ]);

  return (
    <div>
      <h1>Authorizer Usage Example on react</h1>
      <AuthorizerCan rvals={["fish", "swim", "water"]}>
        <h2>Fish can swim water</h2>
      </AuthorizerCan>

      <AuthorizerCan rvals={["fish", "fly", "air"]}>
        <h2>Fish can fly air</h2>
      </AuthorizerCan>

      <AuthorizerCan rvals={["cat", "swim", "water"]}>
        <h2>Cat can swim water</h2>
      </AuthorizerCan>

      <p>useAuthorizerCanListRvals result</p>
      {availableListRvals.map((rvals) => {
        return <h2>{rvals}</h2>;
      })}
    </div>
  );
}
