import { FakeParagraphs } from "@/components/helpers/FakeParagraphs";
import { FakeWordList } from "@/components/helpers/FakeWordList";
import { Paragraph } from "@/components/layout/paragraph";

// This is a simpler implementation of the
// `sticky-sides-flex-content` layout,
// in case you don't need to switch to another layout dynamically.
export default function Layout() {
  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="border-b backdrop-blur p-2">Sticky header</div>
      <div className="flex-grow flex min-h-0">
        <aside className="overflow-y-scroll min-w-[240px]">
          <div>Sticky sidebar</div>
          <FakeWordList count={20} length={[4, 15]} />
        </aside>
        <main className="flex-grow p-4">
          <div className="h-full overflow-scroll">
            <div className="p-4 bg-muted">
              <Paragraph>Main content</Paragraph>
              <FakeParagraphs words={80} count={7} />
            </div>
          </div>
        </main>
      </div>
      <div className="p-2 border-t backdrop-blur">Sticky footer</div>
    </div>
  );
}
