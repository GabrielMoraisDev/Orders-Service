import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusIcon } from "lucide-react";
import Button from "./Button";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  const pathname = usePathname();
  const isNewOrderPage = pathname === '/orders/new';

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 relative top-0 z-10 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {children}
          {!isNewOrderPage && (
            <Link href="/orders/new">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nova Ordem
              </Button>
            </Link>
          )}
        </div>
      </div>


    </div>
  );
}