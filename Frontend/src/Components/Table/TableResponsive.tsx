import React from "react";
import "../css/TableResponsive.css";
import "../css/scrollbar.css";

interface TableProps {
  headerTitle?: React.ReactNode[];
  tableData?: React.ReactNode;
  colWidths?: string[];
  scrollBar?: boolean;
}
export default function TableResponsive({
  headerTitle,
  tableData,
  colWidths,
  scrollBar,
}: TableProps) {
  return (
    <div className={scrollBar ? "contenedor-hijo custom-scrollbar" : ""}>
      <table className="table-responsive">
        {colWidths && (
          <colgroup>
            {colWidths.map((width, idx) => (
              <col key={idx} style={{ width }} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr>
            {headerTitle &&
              headerTitle.map((title, idx) => (
                <th
                  key={idx}
                  className="sticky-header"
                  style={{ textAlign: "center" }}>
                  {title}
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="custom-scrollbar">{tableData}</tbody>
      </table>
    </div>
  );
}
