import { Card } from "react-bootstrap";

interface FormCardProps {
  title: string;
  children: React.ReactNode;
  classNameCard?: string;
  styleCard?: React.CSSProperties;
  styleHeader?: React.CSSProperties;
  styleBody?: React.CSSProperties;
  classNameHeader?: string;
  classNameBody?: string;
}

export default function FormCard(props: FormCardProps) {
  return (
    <>
      <Card className={props.classNameCard} style={props.styleCard}>
        <Card.Header
          className={props.classNameHeader}
          style={props.styleHeader}>
          {props.title}
        </Card.Header>
        <Card.Body className={props.classNameBody} style={props.styleBody}>
          {props.children}
        </Card.Body>
      </Card>
    </>
  );
}
