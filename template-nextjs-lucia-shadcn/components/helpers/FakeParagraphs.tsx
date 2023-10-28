import { memo } from "react";
import { Paragraph } from "../layout/paragraph";
import Jabber from "jabber";

const jabber = new Jabber();

export const FakeParagraphs = memo(function FakeParagraphs({
  count,
  words,
}: {
  count: number;
  words: number;
}) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Paragraph key={i}>{jabber.createParagraph(words)}</Paragraph>
      ))}
    </>
  );
});
