import { WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ScaleActionErrorProps = {
  action: "save" | "delete";
  message: string | null;
  onDismiss: () => void;
};

export function ScaleActionError({
  action,
  message,
  onDismiss,
}: ScaleActionErrorProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive">
      <WarningCircleIcon aria-hidden="true" />
      <AlertTitle>Couldn’t {action} scale.</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <AlertAction>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Dismiss ${action} error`}
          onClick={onDismiss}
        >
          <XIcon aria-hidden="true" />
        </Button>
      </AlertAction>
    </Alert>
  );
}
