import { AppLayout } from "@/components/layouts/app-layout"
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { columns } from './columns';
import { data } from './data';
import { DataTable } from './data-table';

export default function Page() {
  return (
    <AppLayout
      breadcrumbs={[
        { label: "Examples", href: "#" },
        { label: "Example 1" },
      ]}
    >
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <Heading
                        variant="small"
                        title="Examples"
                        description="Search, sort, and manage examples used across the workspace."
                    />
                </div>
                
                <Card className="gap-0 overflow-hidden py-0">
                    <CardContent className="p-4">
                        <DataTable columns={columns} data={data} />
                    </CardContent>
                </Card>
            </div>
    </AppLayout>
  )
}
