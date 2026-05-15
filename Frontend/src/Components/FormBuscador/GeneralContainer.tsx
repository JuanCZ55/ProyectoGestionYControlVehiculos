import "../css/GeneralContainer.css";

interface GeneralContainerProps {
  title: string;
}

export default function GeneralContainer({
  title,
  children,
}: React.PropsWithChildren<GeneralContainerProps>) {
  return (
    <div className="general-container">
      <h2>{title}</h2>
      <div className="">{children}</div>
    </div>
  );
}
// export default function GeneralContainer({
//   title,
//   children,
// }: React.PropsWithChildren<GeneralContainerProps>) {
//   return (
//     <div className="general-container">
//       <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{title}</h1>
//       {/* Agregamos la clase container-body */}
//       <div className="container-body">{children}</div>
//     </div>
//   );
// }
