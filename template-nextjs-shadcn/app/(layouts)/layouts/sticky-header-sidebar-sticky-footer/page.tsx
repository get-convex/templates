import { FakeParagraphs } from "@/components/helpers/FakeParagraphs";
import { FakeWordList } from "@/components/helpers/FakeWordList";
import { Paragraph } from "@/components/layout/paragraph";
import { StickyFooter } from "@/components/layout/sticky-footer";
import { StickyHeader } from "@/components/layout/sticky-header";
import { StickySidebar } from "@/components/layout/sticky-sidebar";

export default function Layout() {
  return (
    <>
      <StickyHeader className="p-2">Sticky header</StickyHeader>
      {/* For Footer to appear at the bottom, and the page
        to not have unnecessary scrollbar, the subtrahend
        inside calc() must be the same height as the header + footer */}
      <div className="container grid grid-cols-[240px_minmax(0,1fr)]">
        <StickySidebar className="top-[calc(2.5rem+1px)] h-[calc(100vh-(5rem+2px))]">
          <div>Sticky sidebar</div>
          <FakeWordList count={60} length={[4, 15]} />
        </StickySidebar>
        <main>
          <Paragraph>Main content</Paragraph>
          <FakeParagraphs words={80} count={4} />
        </main>
      </div>
      <StickyFooter className="p-2">Sticky footer</StickyFooter>
    </>
  );
}
