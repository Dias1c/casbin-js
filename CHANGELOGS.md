# Changelogs

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
