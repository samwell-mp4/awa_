import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/planos")({
  validateSearch: (s: Record<string, unknown>): { checkout?: string } => {
    const checkout = s.checkout as string | undefined;
    return checkout ? { checkout } : {};
  },
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/minha-conta", search: search as any });
  },
});
