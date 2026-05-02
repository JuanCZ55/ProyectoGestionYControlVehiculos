import type { ReactNode } from "react";
import "../css/CardGestion.css";

interface CardGestionProps {
  title: string;
  icon: string;
  description: string;
  button: ReactNode;
}

export default function CardGestion({
  title,
  icon,
  description,
  button,
}: CardGestionProps) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card card-gestion bg-dark text-white border-0 shadow-sm rounded-4 h-100">
        <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center">
          <div
            className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-4"
            style={{ width: "80px", height: "80px" }}>
            <i className={`${icon} fs-1`}></i>
          </div>

          <h5 className="card-title fw-bold mb-3">{title}</h5>

          <p className="card-text text-light mb-4" style={{ opacity: 0.7 }}>
            {description}
          </p>

          <div className="mt-auto w-100 custom-btn-wrapper">{button}</div>
        </div>
      </div>
    </div>
  );
}
