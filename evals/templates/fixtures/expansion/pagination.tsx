// pagination's Counterpart, CDS Pagination: ten pages from the first, with no
// siblings, so it shows a disabled previous button, the current page, two
// plain single-digit pages, an ellipsis, a two-digit last page and next.
import { useState } from "react";
import { VStack } from "@coinbase/cds-web/layout";
import { Pagination as CdsPagination } from "@coinbase/cds-web/pagination";
import { Hook } from "../Hook";

export default function Pagination() {
  const [page, setPage] = useState(1);
  return (
    <VStack width={320}>
      <Hook name="pagination">
        <CdsPagination
          accessibilityLabel="เลือกหน้า / Pages"
          accessibilityLabels={{
            previous: "หน้าก่อนหน้า / Previous page",
            next: "หน้าถัดไป / Next page",
            page: (n) => `หน้า ${n} / Page ${n}`,
          }}
          activePage={page}
          onChange={setPage}
          siblingCount={0}
          totalPages={10}
          testIDMap={{ prevButton: "pagination-previous", nextButton: "pagination-next" }}
        />
      </Hook>
    </VStack>
  );
}
