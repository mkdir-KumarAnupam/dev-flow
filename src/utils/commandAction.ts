import chalk from "chalk";

type CommandAction<TOptions = unknown> = (options: TOptions) => Promise<void> | void;

export function commandAction<TOptions = unknown>(action: CommandAction<TOptions>) {
  return async (options: TOptions) => {
    try {
      await action(options);
    } catch (error) {
      if (isPromptCancelled(error)) {
        console.log(chalk.dim("\nCancelled."));
        process.exitCode = 130;
        return;
      }

      console.log(chalk.red("\nCommand failed."));
      console.log(chalk.dim(getErrorMessage(error)));
      process.exitCode = 1;
    }
  };
}

export function commandActionVariadic(action: (...args: any[]) => Promise<void> | void) {
  return async (...args: any[]) => {
    try {
      await action(...args);
    } catch (error) {
      if (isPromptCancelled(error)) {
        console.log(chalk.dim("\nCancelled."));
        process.exitCode = 130;
        return;
      }

      console.log(chalk.red("\nCommand failed."));
      console.log(chalk.dim(getErrorMessage(error)));
      process.exitCode = 1;
    }
  };
}

export function isPromptCancelled(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "ExitPromptError" ||
    error.message.includes("User force closed the prompt")
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
