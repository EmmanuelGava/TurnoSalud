import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <div className="flex justify-center space-x-4 mb-2">
          <Link href="/contacto" className="hover:text-primary transition-colors">
            Contacto
          </Link>
          <Link href="/terminos" className="hover:text-primary transition-colors">
            Términos y Condiciones
          </Link>
          <Link href="/fuente-datos" className="hover:text-primary transition-colors">
            Fuente de Datos
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} TurnoSalud. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
