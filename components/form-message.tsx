export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ type, message }: { type: 'success' | 'error' | 'message', message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {("success" in message) && type === 'success' && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {message.success}
        </div>
      )}
      {("error" in message) && type === 'error' && (
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {message.error}
        </div>
      )}
      {("message" in message) && type === 'message' && (
        <div className="text-foreground border-l-2 px-4">{message.message}</div>
      )}
    </div>
  );
}
