# Changelogs

## [0.5.0] - 2024-09-09

### Changed `CAuthorizer` methods related with `initOneTimeCallbacks` field

`CAuthorizer` methods `executeInitOneTimeCallbacks`, `addToInitOneTimeCallbacks`, `removeFromInitOneTimeCallbacks` and field `initOneTimeCallbacks` replaced with `onInitDisposableCallbacks` field. The `onInitDisposableCallbacks` field, is class that stored public methods for user to control `callbacks`. Field `onInitDisposableCallbacks` contains `push`, `remove`, `set` and `clear` methods. Use them instead of `addToInitOneTimeCallbacks`/`removeFromInitOneTimeCallbacks` methods.

The `onInitDisposableCallbacks` works like `initOneTimeCallbacks`.

### Added `onInitCallbacks` to `CAuthorizer`

`onInitCallbacks` works like `onInitDisposableCallbacks`, but `onInitCallbacks` not clears after executing on init.

### Changed React examples

- Removed `useAuthorizerSafelyChecker`.
- Updated `useAuthorizerCan`.
- Updated `AuthorizerCan`, `loadPermissions`.

## [0.4.3] - 2024-08-08

Nothing changed

## [0.4.2] - 2024-08-08

### Added method `removeFromInitOneTimeCallbacks`

Added new method `removeFromInitOneTimeCallbacks` that removes function which was added by `addToInitOneTimeCallbacks`. Later example will be added, also it will be renamed.

## [0.4.1] - 2024-07-06

### Added

#### CAuthorizer method `filterByCan`

Added new method `filterByCan` that takes `listRvals` and returns a filtered result where the `can` method returned `true`.

### Changed

#### Examples

- Updated `react` example, updated hook `useAuthorizerCanListRvals`
- Updated `vanilla` example, added example of usage method `filterByCan`

## [0.4.0] - 2024-04-13

### Changed

#### CAuthorizer method `can`

Now method `can` of class `CAuthorizer` changed accept only one argument, and this is array of request elements.

Before:

```ts
Authorizer.can("cat", "walk", "ground");
// OR
const rvals = ["cat", "walk", "ground"];
Authorizer.can(...rvals);
```

Now:

```ts
Authorizer.can(["cat", "walk", "ground"]);
```

#### Examples

- Updated `react` example, added new hook.
