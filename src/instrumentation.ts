export async function register() {
  // Runs once on each cold start — initializes Turso DB schema
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeDb } = await import('./lib/db')
    await initializeDb()
  }
}
