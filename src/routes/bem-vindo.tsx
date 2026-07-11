import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bem-vindo")({
  beforeLoad: () => {
    throw redirect({ to: "/minha-conta" });
  },
});
