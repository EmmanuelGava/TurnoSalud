import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldCheck } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center flex items-center justify-center gap-2">
            <FileText className="h-8 w-8" /> Términos y Condiciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground">
          <p className="text-lg font-semibold">Bienvenido a TurnoSalud.</p>
          <p>
            Estos términos y condiciones describen las reglas y regulaciones para el uso del sitio web de TurnoSalud, ubicado en [URL_DEL_SITIO_AQUI].
            Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones. No continúes usando TurnoSalud si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.
          </p>

          <section className="space-y-2">
            <h2 className="text-xl font-headline font-semibold text-primary flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" /> Uso de la Información
            </h2>
            <p>
              La información proporcionada en TurnoSalud sobre farmacias de turno es orientativa y se basa en datos públicos o proporcionados por terceros. Hacemos nuestro mejor esfuerzo para mantener la información actualizada y precisa, pero no garantizamos su exactitud completa ni su disponibilidad constante.
            </p>
            <p>
              TurnoSalud no se hace responsable por decisiones tomadas basadas en la información aquí presentada. Siempre recomendamos verificar directamente con la farmacia antes de dirigirse a ella, especialmente en casos de urgencia.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-headline font-semibold text-primary">Propiedad Intelectual</h2>
            <p>
              El contenido original, características y funcionalidad de TurnoSalud son propiedad de sus creadores y están protegidos por derechos de autor internacionales, marcas registradas, patentes, secretos comerciales y otras leyes de propiedad intelectual o derechos de propiedad.
            </p>
          </section>
          
          <section className="space-y-2">
            <h2 className="text-xl font-headline font-semibold text-primary">Limitación de Responsabilidad</h2>
            <p>
              En ningún caso TurnoSalud, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo sin limitación, pérdida de ganancias, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de (i) tu acceso o uso o incapacidad para acceder o usar el servicio; (ii) cualquier conducta o contenido de terceros en el servicio.
            </p>
          </section>

          <p className="text-sm text-muted-foreground pt-4">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Te recomendamos revisar esta página periódicamente para estar al tanto de cualquier cambio.
          </p>
          <p className="text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-AR')}.</p>
        </CardContent>
      </Card>
    </div>
  );
}
