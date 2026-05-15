import NavButton from "./NavButton";

export default function NavButtonPosition() {
  return (
    <div
      className="d-flex justify-content-end"
      style={{ position: "absolute", bottom: "0.2rem", right: "1rem" }}>
      <NavButton iconClass="bi bi-arrow-left" text=" Volver" />
    </div>
  );
}
