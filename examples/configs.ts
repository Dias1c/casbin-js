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

/**
 * backend response imitation
 */
export const getPermissionsFromBackend = () => {
  return {
    m: model,
    p: policy,
  };
};
