import { ReactNode, useCallback, useEffect, useState } from "react";
import { CAuthorizer } from "../src";
import { getPermissionsFromBackend } from "./configs";

// ? !!! IMPORTANT
// ? this code not runs in this project
// ? try to run following code in your project, and see how it works

const Authorizer = new CAuthorizer();

let isLoading = false;
const loadPermissions = async (onInitCallback?: () => void) => {
  if (isLoading) {
    if (onInitCallback) Authorizer.addToInitOneTimeCallbacks(onInitCallback);
    return;
  }

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
 * @returns function which inits `Authorizer` and runs onSuccess if `Authorizer` was inited
 */
export function useAuthorizerSafelyChecker() {
  const safelyCheck = useCallback(
    async ({
      onSuccess,
      onFail,
    }: {
      onSuccess?: () => Promise<void> | void;
      onFail?: () => Promise<void> | void;
    }) => {
      try {
        if (Authorizer.isInited()) {
          loadPermissions(onSuccess);
          return;
        }
        onSuccess && (await onSuccess());
      } catch (error) {
        onFail && (await onFail());
      }
    },
    []
  );

  return { safelyCheck };
}

/**
 * @returns permissions for given rvals
 */
export function useAuthorizerCan(...rvals: string[]) {
  const { safelyCheck } = useAuthorizerSafelyChecker();
  const [can, setCan] = useState(false);

  useEffect(() => {
    safelyCheck({
      onSuccess: async () => setCan(await Authorizer.can(...rvals)),
      onFail: () => setCan(false),
    });
  }, [...rvals, Authorizer.isInited()]);

  return { can };
}

/**
 * @returns children - if `Authorizer.can(...rvals)` returns true
 * @returns childrenWhenNotAvailable - if `Authorizer.can(...rvals)` returns false
 */
export const AuthorizerCan = ({
  rvals,
  children,
  childrenWhenNotAvailable,
}: {
  rvals: string[];
  children: ReactNode;
  childrenWhenNotAvailable?: ReactNode;
}) => {
  const { can } = useAuthorizerCan(...rvals);

  if (can) return children;
  return childrenWhenNotAvailable;
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
      let result: string[][] = [];
      for (let i = 0; i < listRvals.length; i++) {
        const rvals = listRvals[i];
        if (await Authorizer.can(...rvals)) result.push(rvals);
      }
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
