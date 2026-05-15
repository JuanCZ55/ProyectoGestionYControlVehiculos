interface TableContainerProps {
  children?: React.ReactNode;
  title?: string;
}

export default function TableContainer({
  children,
  title,
}: TableContainerProps) {
  return (
    <div className=" d-flex flex-column ">
      <h2 className="text-center my-1 py-1">{title}</h2>
      {children}
    </div>
  );
}
