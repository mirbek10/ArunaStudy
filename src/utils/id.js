let currentId = 1000;

export function nextId() {
  currentId += 1;
  return currentId;
}

export function ensureIdAtLeast(value) {
  const id = Number(value);
  if (Number.isInteger(id) && id > currentId) {
    currentId = id;
  }
}
