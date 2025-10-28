import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/authenticated')({
  component: ServerPage,
});

function ServerPage() {
  return <p>Welcome!</p>;
}
