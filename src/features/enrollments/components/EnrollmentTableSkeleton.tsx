import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";

export function EnrollmentTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Estudiante</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Año</TableHead>
          <TableHead>Grado / Aula</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index}>
            {Array.from({ length: 6 }).map((_, cellIndex) => (
              <TableCell key={cellIndex}>
                <Skeleton className="h-5 w-full max-w-32" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
