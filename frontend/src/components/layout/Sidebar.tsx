import {
  LayoutDashboard,
  Search,
  ClipboardList,
  Network,
  ShieldAlert,
  FileSearch,
  FileText,
  Settings,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Discover",
    icon: Search,
    path: "/discover",
  },
  {
    label: "Investigations",
    icon: ClipboardList,
    path: "/investigations",
  },

  {
    label: "Campaigns",
    icon: Network,
    path: "/campaigns",
  },
  {
    label: "Threat Intelligence",
    icon: ShieldAlert,
    path: "/threat-intelligence",
  },
  {
    label: "Forensics",
    icon: FileSearch,
    path: "/forensics",
  },
  {
    label: "Reports",
    icon: FileText,
    path: "/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-[#2a2a2e] bg-[#0d0d10]">
      <div className="border-b border-[#2a2a2e] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
            <ShieldAlert size={20} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-wide text-white">
              DECEPTRIX
            </h1>

            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              CTI Platform
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-[#16161a] hover:text-white"
            >
              <Icon size={18} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-[#2a2a2e] p-4">
        <div className="rounded-lg bg-[#16161a] p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400" />

            <span className="text-xs text-zinc-400">
              AI Engine Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}