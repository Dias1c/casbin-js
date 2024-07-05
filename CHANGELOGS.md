# Changelogs

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
