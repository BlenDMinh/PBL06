import Link from "next/link";

export default function SidebarItem({
  href,
  children,
  icon,
  active,
}: Readonly<{
  href: string;
  children?: React.ReactNode;
  icon: React.ReactNode;
  active: boolean;
}>) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-4 p-4 w-full rounded-lg ${
          active ? "bg-primary" : ""
        }`}
      >
        {icon}
        <span>{children}</span>
      </div>
    </Link>
  );
}
