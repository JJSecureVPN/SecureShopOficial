export const extractUsersFromName = (name: string) => {
  const match = name.match(/^(\d+)\s+Usuarios?/i);
  return match ? parseInt(match[1], 10) : 1;
};
