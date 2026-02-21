let currentId = 1000;

export function nextId() {
  currentId += 1;
  return currentId;
}
