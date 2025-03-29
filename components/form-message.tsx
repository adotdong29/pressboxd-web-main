export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm pt-5">
      {"success" in message && (
        <div className="text-foreground border-l-2 p-4 border-primary">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-foreground border-l-2 p-4 border-primary">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-foreground border-l-2 p-4 border-primary">
          {message.message}
        </div>
      )}
    </div>
  );
}
