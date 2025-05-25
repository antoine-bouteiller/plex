import { exec } from 'child_process'
import { promisify } from 'util'

const promisifiedExec = promisify(exec)

export const execPromise = async (command: string) => {
  try {
    const { stdout } = await promisifiedExec(command)
    return stdout
  } catch (error) {
    if (error instanceof Error && 'stderr' in error) {
      throw new Error(String(error.stderr))
    }
    throw error
  }
}
