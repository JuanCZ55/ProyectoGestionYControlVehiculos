import { Pagination } from "react-bootstrap";
import "../css/Paginator.css";

interface PaginatorProps {
  previousPage: () => void;
  nextPage: () => void;
  totalCountPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const PaginatorForTable = ({
  previousPage,
  nextPage,
  totalCountPages,
  currentPage,
  onPageChange,
}: PaginatorProps) => {
  const items = [];

  const renderPaginationItem = (pageNumber: number) => (
    <Pagination.Item
      key={pageNumber}
      active={pageNumber === currentPage}
      onClick={() => onPageChange(pageNumber)}
      className={"pagination-item"}>
      {pageNumber}
    </Pagination.Item>
  );

  if (totalCountPages <= 7) {
    for (let i = 1; i <= totalCountPages; i++) {
      items.push(renderPaginationItem(i));
    }
  } else {
    items.push(renderPaginationItem(1));

    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalCountPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      items.push(renderPaginationItem(i));
    }

    if (currentPage < totalCountPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }
    items.push(renderPaginationItem(totalCountPages));
  }

  if (totalCountPages === 0) return null;

  return (
    <div className="pagination-container mt-1 d-flex justify-content-center">
      <Pagination className={"pagination-core mb-0"}>
        <Pagination.Prev
          onClick={previousPage}
          disabled={currentPage === 1}
          className={"pagination-item-previous"}>
          <i className="bi bi-chevron-left"></i>
        </Pagination.Prev>

        {items}

        <Pagination.Next
          onClick={nextPage}
          disabled={currentPage === totalCountPages}
          className={"pagination-item-next"}>
          <i className="bi bi-chevron-right"></i>
        </Pagination.Next>
      </Pagination>
    </div>
  );
};
