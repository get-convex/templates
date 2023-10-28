import { FakeParagraphs } from "@/components/helpers/FakeParagraphs";
import { FakeWordList } from "@/components/helpers/FakeWordList";
import { Footer } from "@/components/layout/footer";
import { Paragraph } from "@/components/layout/paragraph";
import { ResponsiveSidebarButton } from "@/components/layout/responsive-sidebar-button";
import { StickyHeader } from "@/components/layout/sticky-header";
import { StickySidebar } from "@/components/layout/sticky-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

// You control the responsive page layout breakpoint, in this example
// we use `sm:` (640px).
export default function Layout() {
  const sidebar = (
    <>
      <div>Sticky sidebar</div>
      <FakeWordList count={80} length={[4, 15]} capitalize />
      Last
    </>
  );
  return (
    <>
      <StickyHeader className="p-2 flex items-center justify-between h-[3.25rem]">
        Sticky header
        <ResponsiveSidebarButton className="sm:hidden">
          <div className="sm:hidden fixed bg-background w-screen top-[calc(3.25rem+1px)] h-[calc(100vh-(3.25rem+1px))]">
            <ScrollArea className="h-full">{sidebar}</ScrollArea>
          </div>
        </ResponsiveSidebarButton>
      </StickyHeader>
      <div className="container sm:grid grid-cols-[240px_minmax(0,1fr)]">
        <StickySidebar className="hidden sm:block top-[calc(3.25rem+1px)] h-[calc(100vh-(3.25rem+1px))]">
          {sidebar}
        </StickySidebar>
        <main className="min-h-[calc(100vh-(3.25rem+1px))]">
          <Paragraph>Main content</Paragraph>
          <FakeParagraphs words={80} count={5} />
        </main>
      </div>
      <Footer>Footer below fold</Footer>
    </>
  );
}
