export function safeReturnTo(value: string | null) {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\r\n]/.test(value)
  )
    return '/tasks';
  if (value.startsWith('/login') || value.startsWith('/register'))
    return '/tasks';
  return value;
}
