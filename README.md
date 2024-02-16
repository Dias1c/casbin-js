# casbin-js

🔐 Simple library that supports access control models like ACL, RBAC, ABAC in Frontend Javascript.

<p align="center">
  <img alt="ts" src="https://badgen.net/badge/-/TypeScript?icon=typescript&label&labelColor=blue&color=555555">
  <a href="https://www.npmjs.com/package/@diaskappassov/hungry-local-storage">
    <img alt="Visit the NPM page" src="https://img.shields.io/npm/v/@diaskappassov/casbin-js"/>
  </a>
  <a href="https://github.com/Dias1c/casbin-js/">
    <img alt="Visit package GitHub page" src="https://img.shields.io/github/stars/Dias1c/casbin-js?style=social&label=GitHub&maxAge=2592000"/>
  </a>
</p>

See more about casbin [here](https://casbin.org/docs/overview).

## Installation

```
npm i @diaskappassov/casbin-js
```

## Usage

You can see all usage examples in [examples directory](./examples).

- [vanilla typescript example](./examples/vanilla.ts)
- [react typescript example](./examples/react.tsx)

### Initialize Authorizer

To understand what the `model` and `policy` read https://casbin.org/docs/syntax-for-models/

```ts
import { CAuthorizer } from "@diaskappassov/casbin-js";

const model = `
# Request definition
[request_definition]
# Can subject, do_action, on_object
r = sub, act, obj

# Policy definition
[policy_definition]
p = sub, act, obj

# Role definition
[role_definition]
g = _, _

# Policy effect
[policy_effect]
e = some(where (p.eft == allow))

# Matchers
[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
`;

const policy = [
  ["p", "cat", "walk", "ground"],
  ["p", "cat", "run", "ground"],
  ["p", "cat", "swim", "water"],
  ["p", "cat", "breathe", "air"],

  ["p", "bird", "fly", "air"],
  ["p", "bird", "breathe", "air"],
  ["p", "bird", "walk", "ground"],

  ["p", "fish", "swim", "water"],
  ["p", "fish", "breathe", "water"],
];

const Authorizer = new CAuthorizer();

Authorizer.init(model, policy);
```

### Check permissions

You can check permissions with `can`, `canAll`, `canAny` methods, but before that YOU MUST INITIALIZE `Authorizer`.

> !Important: The order of your request elements must follow the rules which you set in policy. See more: https://casbin.org/docs/syntax-for-models#request-definition

#### Check permissions with `can` method

> Throws error if `Authorizer` not initialized

```ts
await Authorizer.can("fish", "fly", "air"); // false
await Authorizer.can("fish", "swim", "ground"); // false
await Authorizer.can("fish", "swim", "water"); // true
await Authorizer.can("cat", "swim", "water"); // true
await Authorizer.can("bird", "run", "ground"); // false
await Authorizer.can("cat", "run", "ground"); // true
```

#### Check permissions with `canAll` method

```ts
// returns `false` cause one of condition returned `false`
await Authorizer.canAll([
  ["cat", "breathe", "air"],
  ["fish", "breathe", "air"],
]);

// returns `true` cause all condition returned `true`
await Authorizer.canAll([
  ["cat", "breathe", "air"],
  ["bird", "breathe", "air"],
]);
```

#### Check permissions with `canAny` method

```ts
// returns `true` cause one of condition returned `true`
await authorizer.canAny([
  ["cat", "breathe", "air"],
  ["fish", "breathe", "air"],
]);

// returns `false` cause all condition returned `false`
await authorizer.canAny([
  ["cat", "fly", "air"],
  ["fish", "fly", "air"],
]);
```

## Author

- [Dias1c - Dias Kappassov](https://github.com/Dias1c)
