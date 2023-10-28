import { FakeParagraphs } from "@/components/helpers/FakeParagraphs";
import { Paragraph } from "@/components/layout/paragraph";
import { StickyFooter } from "@/components/layout/sticky-footer";
import { StickyHeader } from "@/components/layout/sticky-header";

export default function Layout() {
  return (
    <>
      <StickyHeader className="p-2">Sticky header</StickyHeader>
      {/* For Footer to appear at the bottom, and the page
        to not have unnecessary scrollbar, the subtrahend
        inside calc() must be the same height as the header + footer */}
      <main className="min-h-[calc(100vh-(5rem+2px))]">
        <Paragraph>Main content</Paragraph>
        <FakeParagraphs words={80} count={5} />
      </main>
      <StickyFooter className="p-2">Sticky footer</StickyFooter>
    </>
  );
}
