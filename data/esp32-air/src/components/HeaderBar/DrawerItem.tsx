import Link from "next/link";

export default function DrawerItem({
  route,
  text,
  Icon,
}: {
  route: string;
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon?: React.ComponentType<any>;
}) {
  return (
    <Link className="w-full text-white p-3 hover:bg-slate-600" href={route}>
      {Icon && <Icon className="mr-2" />}
      {text}
    </Link>
  );
}
