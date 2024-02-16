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
 * returns function which inits `Authorizer` and runs onSuccess if `Authorizer` was inited
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
 * @returns children - if `Authorization.can(...rvals)` returns true
 * @returns childrenWhenNotAvailable - if `Authorization.can(...rvals)` returns false
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

export function App() {
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
    </div>
  );
}
