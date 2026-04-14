export async function dispatchCommand(
  command: string,
  payload?: Record<string, unknown>,
): Promise<{ ok: true }> {
  console.log(`[CMD] ${command}`, payload ?? {});
  return { ok: true };
}
