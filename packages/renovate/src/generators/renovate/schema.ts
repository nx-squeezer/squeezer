/**
 * Renovate generator schema.
 */
export interface RenovateGeneratorSchema {
  /**
   * Configure Renovate workflow to use Nx Cloud.
   */
  useNxCloud: boolean;

  /**
   * Overwrites existing Renovate workflow.
   */
  force: boolean;

  /**
   * Uses local presets instead of the ones provided by @nx-squeezer/squeezer.
   */
  local: boolean;

  /**
   * Assignee for GitHub PRs.
   */
  assignee?: string;
}
