import { Bell, CircleUserRound } from "lucide-react";

export default function Topbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-[#2a2a2e] bg-[#0a0a0c]/95 px-6 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Security Operations Center
        </p>

        <h2 className="text-sm font-semibold text-white">
          Deception Intelligence
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-zinc-400 transition hover:text-white">
          <Bell size={19} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 border-l border-[#2a2a2e] pl-5">
          <CircleUserRound size={21} className="text-zinc-400" />

          <div>
            <p className="text-xs font-medium text-white">
              Analyst
            </p>

            <p className="text-[10px] text-zinc-500">
              SOC Operator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}