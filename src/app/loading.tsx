import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-4 h-10 w-64" />
      <Skeleton className="mb-8 h-5 w-96" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-5">
            <Skeleton className="mb-3 h-5 w-24" />
            <Skeleton className="mb-2 h-6 w-full" />
            <Skeleton className="mb-3 h-4 w-3/4" />
            <Skeleton className="mb-1.5 h-4 w-48" />
            <Skeleton className="mb-1.5 h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
