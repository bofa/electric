const validIcons = [
  'cog',
  'settings',
  'anchor',
  'changes',
]

export default function randomIcon() {
  const index = Math.floor(validIcons.length * Math.random());

  return validIcons[index];
}