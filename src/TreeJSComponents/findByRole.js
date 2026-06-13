export function findByRole(parent, role) {
  if (!parent || !parent.children) return undefined;
  return parent.children.find((c) => c.userData && c.userData.role === role);
}
