import { FakeParagraphs } from "@/components/helpers/FakeParagraphs";
import { FakeWordList } from "@/components/helpers/FakeWordList";
import { Footer } from "@/components/layout/footer";
import { Paragraph } from "@/components/layout/paragraph";
import { StickyHeader } from "@/components/layout/sticky-header";
import { StickySidebar } from "@/components/layout/sticky-sidebar";

export default function Layout() {
  return (
    <>
      <StickyHeader className="p-2">Sticky header</StickyHeader>
      {/* Remove `container` if you want full-page width layout */}
      <div className="container grid grid-cols-[240px_minmax(0,1fr)]">
        <StickySidebar className="top-[calc(2.5rem+1px)] h-[calc(100vh-(2.5rem+1px))]">
          <div>Sticky sidebar</div>
          <FakeWordList count={3} length={[4, 15]} capitalize />
        </StickySidebar>
        <main className="min-h-[calc(100vh-(2.5rem+1px))]">
          <Paragraph>Main content</Paragraph>
          <FakeParagraphs words={80} count={5} />
        </main>
      </div>
      <Footer>Footer below fold</Footer>
    </>
  );
}
