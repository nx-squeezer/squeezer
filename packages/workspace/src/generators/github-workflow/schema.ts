/**
 * Schema of GitHub workflow generator.
 */
export interface GitHubWorkflowGeneratorSchema {
  /**
   * Base branch.
   */
  branch: string;

  /**
   * Configure CI workflow to use Nx Cloud.
   */
  useNxCloud: boolean;

  /**
   * Overwrites existing CI workflow.
   */
  force: boolean;
}
