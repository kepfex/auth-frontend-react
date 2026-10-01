import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const StudentTableSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>
              Estudiante
            </TableHead>
            <TableHead>
              Documento
            </TableHead>
            <TableHead>Estado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>

              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </TableCell>

              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>

              <TableCell>
                <Skeleton className="ml-auto size-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};