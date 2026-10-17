import { useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  useStudentQrCard,
  useUpdateStudentQrStatus,
} from "../../hooks/useStudentQrCard";

interface StudentQrTabProps {
  studentId: number;
}

export const StudentQrTab = ({ studentId }: StudentQrTabProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    data: qrCard,
    isPending,
    isError,
    error,
    refetch,
  } = useStudentQrCard(studentId);

  const updateStatus = useUpdateStudentQrStatus(studentId);

  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  const handleCopy = async () => {
    if (!qrCard) return;

    try {
      await navigator.clipboard.writeText(qrCard.uuid);

      toast.success("UUID copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el UUID");
    }
  };

  const handleUpdateStatus = () => {
    if (!qrCard || updateStatus.isPending) return;

    updateStatus.mutate(
      {
        is_active: !qrCard.is_active,
      },
      {
        onSuccess: (updated) => {
          toast.success(
            updated.is_active
              ? "Código QR activado correctamente"
              : "Código QR desactivado correctamente",
          );

          setConfirmOpen(false);
        },
        onError: () => {
          toast.error("No se pudo actualizar el estado del código QR");
        },
      },
    );
  };

  if (isPending) {
    return (
      <Card>
        <CardContent className="flex min-h-72 items-center justify-center gap-3">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Cargando código QR...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="size-8 text-destructive" />

          <h3 className="font-semibold">
            {notFound
              ? "Código QR no encontrado"
              : "No se pudo cargar el código QR"}
          </h3>

          <p className="max-w-md text-sm text-muted-foreground">
            {notFound
              ? "Este estudiante no tiene un código QR asociado. Verifica su registro en el sistema."
              : "Ocurrió un problema al consultar el código QR. Intenta nuevamente."}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
          >
            <RefreshCw className="size-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!qrCard) return null;

  const isActive = qrCard.is_active;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* QR del estudiante */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="size-5" />
                  Código QR del estudiante
                </CardTitle>

                <CardDescription>
                  Identificador único para el control de asistencia.
                </CardDescription>
              </div>

              <Badge
                variant={isActive ? "secondary" : "destructive"}
                className="gap-1"
              >
                {isActive ? (
                  <CheckCircle2 className="size-3" />
                ) : (
                  <ShieldOff className="size-3" />
                )}

                {isActive ? "Activo" : "Desactivado"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <QRCodeSVG
                  value={qrCard.qr_value}
                  size={220}
                  level="M"
                  marginSize={1}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  title="Código QR del estudiante"
                />
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Código utilizado por el kiosco de asistencia.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Identificador UUID</p>

              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <code className="min-w-0 flex-1 break-all text-xs sm:text-sm">
                  {qrCard.uuid}
                </code>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Copiar UUID"
                  title="Copiar UUID"
                  onClick={() => void handleCopy()}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Este código se genera automáticamente al registrar al estudiante y
              no cambia cuando se modifica su matrícula.
            </p>
          </CardContent>
        </Card>

        {/* Estado y administración */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del código QR</CardTitle>

            <CardDescription>
              Control de uso para registrar asistencia.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <CheckCircle2 className="size-5 text-emerald-600" />
                ) : (
                  <ShieldOff className="size-5 text-destructive" />
                )}

                <span className="font-medium">
                  {isActive ? "QR habilitado" : "QR deshabilitado"}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {isActive
                  ? "El código puede utilizarse en el kiosco si el estudiante cumple las condiciones de matrícula y horario."
                  : "El kiosco rechazará las marcaciones realizadas con este código."}
              </p>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Fecha de creación</p>

              <p className="font-medium">
                {new Date(qrCard.created_at).toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </p>
            </div>

            <Button
              type="button"
              variant={isActive ? "destructive" : "default"}
              className="w-full"
              disabled={updateStatus.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              {isActive ? (
                <>
                  <ShieldOff className="size-4" />
                  Desactivar código QR
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Activar código QR
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmación de cambio de estado */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!updateStatus.isPending) {
            setConfirmOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive
                ? "¿Desactivar el código QR?"
                : "¿Activar el código QR?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {isActive
                ? "El estudiante no podrá registrar su asistencia mediante este código QR hasta que vuelva a habilitarse."
                : "El código QR volverá a estar habilitado. Las marcaciones seguirán sujetas a la matrícula y los horarios correspondientes."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatus.isPending}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={updateStatus.isPending}
              onClick={(event) => {
                event.preventDefault();
                handleUpdateStatus();
              }}
            >
              {updateStatus.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}

              {isActive ? "Desactivar" : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
