import { CAuthorizer } from "../src";
import { getPermissionsFromBackend } from "./configs";

const runExample = async () => {
  const permissions = await getPermissionsFromBackend();

  // ! If you will not init authorizer, the methods like "can" will throw error
  // You can check does authorizer initialized with "isInited" method
  const authorizer = new CAuthorizer();
  await authorizer.init(permissions.m, permissions.p);

  const allSubjects = await authorizer.getEnforcer()?.getAllSubjects();
  const allActinos = await authorizer.getEnforcer()?.getAllActions();
  const allObjects = await authorizer.getEnforcer()?.getAllObjects();
  const allRoles = await authorizer.getEnforcer()?.getAllRoles();

  console.log("- inited authorizer data:");
  console.log("all subjects (sub):", allSubjects);
  console.log("all actions  (act):", allActinos);
  console.log("all objects  (obj):", allObjects);
  console.log("all roles   (RBAC):", allRoles);
  console.log();

  console.log("- check permissions with authorizer.can");
  console.log(
    "fish fly air?".padEnd(30),
    await authorizer.can(["fish", "fly", "air"])
  );
  console.log(
    "fish walk ground?".padEnd(30),
    await authorizer.can(["fish", "swim", "ground"])
  );
  console.log(
    "fish swim water?".padEnd(30),
    await authorizer.can(["fish", "swim", "water"])
  );
  console.log(
    "cat swim water?".padEnd(30),
    await authorizer.can(["cat", "swim", "water"])
  );
  console.log(
    "bird run ground?".padEnd(30),
    await authorizer.can(["bird", "run", "ground"])
  );
  console.log(
    "cat run ground?".padEnd(30),
    await authorizer.can(["cat", "run", "ground"])
  );
  console.log();

  console.log("- check permissions with authorizer.canAll");
  console.log(
    "cat AND fish breathe air?".padEnd(30),
    await authorizer.canAll([
      ["cat", "breathe", "air"],
      ["fish", "breathe", "air"],
    ])
  );
  console.log(
    "cat AND bird breathe air?".padEnd(30),
    await authorizer.canAll([
      ["cat", "breathe", "air"],
      ["bird", "breathe", "air"],
    ])
  );
  console.log();

  console.log("- check permissions with authorizer.canAny");
  console.log(
    "cat OR fish breathe air?".padEnd(30),
    await authorizer.canAny([
      ["cat", "breathe", "air"],
      ["fish", "breathe", "air"],
    ])
  );
  console.log(
    "cat OR fish fly air?".padEnd(30),
    await authorizer.canAny([
      ["cat", "fly", "air"],
      ["fish", "fly", "air"],
    ])
  );
  console.log();

  // ! The order of your request elements must follow the rules which you set in `model`
  // ? See more: https://casbin.org/docs/syntax-for-models#request-definition
  console.log("- the order of requests are important");
  console.log(
    "invalid request example".padEnd(30),
    await authorizer.can(["fish", "water", "swim"])
  );
  console.log(
    "invalid request example".padEnd(30),
    await authorizer.can(["water", "swim", "fish"])
  );
  console.log(
    "correct request example".padEnd(30),
    await authorizer.can(["fish", "swim", "water"])
  );
};

runExample();
