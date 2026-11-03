// pagination, measured against CDS Pagination (fixtures/expansion/pagination.tsx):
// the same ten pages from the first with no siblings, so the list is CDS's
// 1, 2, 3, …, 10 while the current page is any of the first three.
import { useState, type MouseEvent } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Hook } from "../Hook"

const total = 10

export default function PaginationSection() {
  const [page, setPage] = useState(1)
  const go = (to: number) => (event: MouseEvent) => {
    event.preventDefault()
    setPage(to)
  }
  const link = (n: number) => (
    <PaginationItem>
      <PaginationLink href={`?page=${n}`} aria-label={`หน้า ${n} / Page ${n}`} isActive={page === n} onClick={go(n)}>
        {n}
      </PaginationLink>
    </PaginationItem>
  )
  return (
    <div className="w-80">
      <Hook name="pagination">
        <Pagination aria-label="เลือกหน้า / Pages">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`?page=${page - 1}`}
                text="หน้าก่อนหน้า / Previous page"
                disabled={page === 1}
                onClick={go(page - 1)}
              />
            </PaginationItem>
            {link(1)}
            {link(2)}
            {link(3)}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            {link(total)}
            <PaginationItem>
              <PaginationNext
                href={`?page=${page + 1}`}
                text="หน้าถัดไป / Next page"
                disabled={page === total}
                onClick={go(page + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Hook>
    </div>
  )
}
