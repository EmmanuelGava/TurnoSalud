import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

export default function ContactoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Si tienes alguna pregunta, sugerencia o inconveniente, no dudes en contactarnos.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Correo Electrónico</h3>
                <a href="mailto:contacto@turnosalud.com.ar" className="text-primary hover:underline">
                  contacto@turnosalud.com.ar
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Teléfono (Soporte Técnico)</h3>
                <p className="text-muted-foreground">+54 9 11 1234-5678 (Solo WhatsApp para consultas técnicas)</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground pt-4">
            Nuestro equipo intentará responder a la brevedad.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
