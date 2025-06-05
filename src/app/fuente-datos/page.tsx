import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, LinkIcon, Info } from "lucide-react";

export default function FuenteDatosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center flex items-center justify-center gap-2">
            <Database className="h-8 w-8" /> Fuente de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            La información sobre las farmacias de turno presentada en TurnoSalud se recopila y actualiza a partir de diversas fuentes.
          </p>
          
          <section className="space-y-3 p-4 border rounded-lg">
            <h2 className="text-xl font-headline font-semibold text-primary flex items-center gap-2">
              <Info className="h-6 w-6" /> Sobre los Datos
            </h2>
            <p>
              Actualmente, para esta versión inicial y demostrativa de la interfaz, los datos de las farmacias son ficticios (mock data) y se utilizan únicamente con el propósito de mostrar el diseño y las funcionalidades de la aplicación.
            </p>
            <p>
              En una futura versión conectada a un sistema real, la información podría provenir de:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Colegios de Farmacéuticos Provinciales y Municipales.</li>
              <li>Portales de datos abiertos gubernamentales.</li>
              <li>APIs públicas o privadas proporcionadas por entidades de salud.</li>
              <li>Colaboración directa con farmacias.</li>
            </ul>
          </section>

          <section className="space-y-3 p-4 border rounded-lg bg-accent/20">
             <h2 className="text-xl font-headline font-semibold text-primary flex items-center gap-2">
              <LinkIcon className="h-6 w-6" /> Próximamente: Conexión a Datos Reales
            </h2>
            <p>
              Estamos trabajando para integrar fuentes de datos confiables y actualizadas para ofrecer la información más precisa posible sobre farmacias de turno en toda Argentina.
            </p>
            <p>
              Si representas a una entidad que gestiona esta información y te interesa colaborar, por favor <a href="/contacto" className="text-primary hover:underline font-semibold">contáctanos</a>.
            </p>
          </section>

          <p className="text-sm text-center text-muted-foreground pt-4">
            Agradecemos tu comprensión y paciencia mientras desarrollamos y mejoramos TurnoSalud.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
