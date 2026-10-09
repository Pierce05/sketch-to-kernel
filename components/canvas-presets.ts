export interface CanvasPreset {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  mockResponse: {
    componentName: string;
    html: string;
    props: Array<{
      name: string;
      type: string;
      default: string;
      description: string;
    }>;
  };
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  {
    id: "hackathon-card",
    title: "Hackathon Project Card",
    category: "Level 1 • Showcase",
    badge: "Hacktoberfest",
    description: "Hand-drawn project submission card with team credentials, track badges, and demo action.",
    draw: (ctx, w, h) => {
      ctx.save();
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Card bounding box
      const cx = w * 0.15;
      const cy = h * 0.12;
      const cw = w * 0.7;
      const ch = h * 0.76;

      ctx.strokeRect(cx, cy, cw, ch);

      // Header title: [ SketchToKernel ]
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy + 45);
      ctx.lineTo(cx + cw * 0.55, cy + 45);
      ctx.stroke();

      // Badge outline: [ Gemma 4 Track ]
      ctx.strokeRect(cx + cw - 120, cy + 30, 90, 26);

      // Subtitle line
      ctx.beginPath();
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 2;
      ctx.moveTo(cx + 30, cy + 85);
      ctx.lineTo(cx + cw - 40, cy + 85);
      ctx.stroke();

      // Feature tags
      for (let i = 0; i < 3; i++) {
        const tx = cx + 30 + i * 85;
        const ty = cy + 120;
        ctx.strokeRect(tx, ty, 75, 24);
      }

      // Code / sketch box area
      const boxY = cy + 165;
      ctx.fillStyle = "rgba(79, 70, 229, 0.08)";
      ctx.fillRect(cx + 30, boxY, cw - 60, ch - 250);
      ctx.strokeRect(cx + 30, boxY, cw - 60, ch - 250);

      // Terminal text lines
      ctx.strokeStyle = "#6366f1";
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.moveTo(cx + 45, boxY + 25 + j * 20);
        ctx.lineTo(cx + 45 + (j === 0 ? 120 : j === 1 ? 180 : 90), boxY + 25 + j * 20);
        ctx.stroke();
      }

      // CTA Button: [ View On GitHub / Demo ]
      const btnY = cy + ch - 65;
      ctx.fillStyle = "rgba(79, 70, 229, 0.25)";
      ctx.fillRect(cx + 30, btnY, cw - 60, 42);
      ctx.strokeStyle = "#4f46e5";
      ctx.strokeRect(cx + 30, btnY, cw - 60, 42);

      // Button label line
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.moveTo(cx + cw * 0.35, btnY + 21);
      ctx.lineTo(cx + cw * 0.65, btnY + 21);
      ctx.stroke();

      ctx.restore();
    },
    mockResponse: {
      componentName: "HackathonProjectCard",
      html: `<div class="w-full max-w-md rounded-2xl border-2 border-indigo-500/40 bg-gray-950 p-6 shadow-2xl">
  <div class="flex items-center justify-between">
    <div>
      <span class="font-mono text-xs font-semibold text-indigo-400 uppercase tracking-wider">{{trackBadge}}</span>
      <h3 class="text-lg font-bold text-white tracking-tight mt-0.5">{{projectTitle}}</h3>
    </div>
    <span class="rounded-lg bg-emerald-950/80 px-2.5 py-1 text-xs font-mono text-emerald-400 border border-emerald-800/40">★ {{starsCount}}</span>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-gray-400">{{description}}</p>
  <div class="mt-4 flex flex-wrap gap-2">
    <span class="rounded-md border border-gray-800 bg-gray-900 px-2 py-0.5 text-[11px] font-mono text-indigo-300">Next.js 16</span>
    <span class="rounded-md border border-gray-800 bg-gray-900 px-2 py-0.5 text-[11px] font-mono text-purple-300">Tailwind v4</span>
    <span class="rounded-md border border-gray-800 bg-gray-900 px-2 py-0.5 text-[11px] font-mono text-pink-300">Gemma 4 31B</span>
  </div>
  <div class="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
    <span class="text-xs text-gray-500 font-mono">Team: {{teamName}}</span>
    <button class="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors">
      {{ctaLabel}}
    </button>
  </div>
</div>`,
      props: [
        { name: "projectTitle", type: "string", default: "SketchToKernel", description: "Hackathon project title" },
        { name: "trackBadge", type: "string", default: "Hacktoberfest 2026", description: "Hackathon track tag" },
        { name: "teamName", type: "string", default: "Pierce & Atharv", description: "Team creator names" },
        { name: "description", type: "string", default: "Turn hand-drawn napkin sketches into live Tailwind components in seconds using Gemma 4.", description: "Project summary" },
        { name: "starsCount", type: "string", default: "142", description: "GitHub star count" },
        { name: "ctaLabel", type: "string", default: "Explore Project →", description: "Action button text" },
      ],
    },
  },
  {
    id: "dev-terminal",
    title: "Gemma Terminal Runner",
    category: "Level 2 • Developer Tools",
    badge: "AI Pipeline",
    description: "Napkin wireframe compiler terminal showing Gemma 4 inference status and output logs.",
    draw: (ctx, w, h) => {
      ctx.save();
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      const cx = w * 0.15;
      const cy = h * 0.2;
      const cw = w * 0.7;
      const ch = h * 0.6;

      ctx.strokeRect(cx, cy, cw, ch);

      // Window title bar dots
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(cx + 25 + i * 16, cy + 20, 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Title line
      ctx.beginPath();
      ctx.moveTo(cx + 90, cy + 20);
      ctx.lineTo(cx + 200, cy + 20);
      ctx.stroke();

      // Divider
      ctx.beginPath();
      ctx.moveTo(cx, cy + 38);
      ctx.lineTo(cx + cw, cy + 38);
      ctx.stroke();

      // Console lines
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.moveTo(cx + 25, cy + 65 + j * 24);
        ctx.lineTo(cx + 25 + (j % 2 === 0 ? cw * 0.6 : cw * 0.4), cy + 65 + j * 24);
        ctx.stroke();
      }

      ctx.restore();
    },
    mockResponse: {
      componentName: "DevTerminalWidget",
      html: `<div class="w-full max-w-md rounded-2xl border border-purple-500/30 bg-black p-5 font-mono text-xs shadow-2xl">
  <div class="flex items-center justify-between border-b border-gray-800 pb-3">
    <div class="flex items-center gap-2">
      <span class="size-3 rounded-full bg-red-500/80 inline-block"></span>
      <span class="size-3 rounded-full bg-yellow-500/80 inline-block"></span>
      <span class="size-3 rounded-full bg-green-500/80 inline-block"></span>
      <span class="ml-2 text-gray-400 font-semibold">{{terminalTitle}}</span>
    </div>
    <span class="rounded bg-purple-950/60 px-2 py-0.5 text-[10px] text-purple-300 border border-purple-800/40">Gemma 4 31B</span>
  </div>
  <div class="mt-4 space-y-2 text-gray-300">
    <div class="text-indigo-400">$ {{commandInput}}</div>
    <div class="text-emerald-400">✓ Canvas raster exported (1280x720 PNG)</div>
    <div class="text-gray-400">→ Sending payload to POST /api/compile...</div>
    <div class="text-purple-300">★ Inference complete in {{latency}} (Zod validated)</div>
    <div class="text-gray-500">// Output: {{statusMessage}}</div>
  </div>
</div>`,
      props: [
        { name: "terminalTitle", type: "string", default: "gemma-compiler-v4", description: "Terminal window title" },
        { name: "commandInput", type: "string", default: "sketch compile --model gemma-4-31b", description: "Executed CLI command" },
        { name: "latency", type: "string", default: "420ms", description: "API response latency" },
        { name: "statusMessage", type: "string", default: "Ready for live preview inspection", description: "Status footer text" },
      ],
    },
  },
  {
    id: "voting-card",
    title: "Project Upvote & Feedback",
    category: "Level 3 • Community",
    badge: "Judging",
    description: "Interactive voting card where judges and peers vote for the project and see real-time counters.",
    draw: (ctx, w, h) => {
      ctx.save();
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      const cx = w * 0.15;
      const cy = h * 0.2;
      const cw = w * 0.7;
      const ch = h * 0.6;

      ctx.strokeRect(cx, cy, cw, ch);

      // Upvote arrow triangle
      const ax = cx + 45;
      const ay = cy + 50;
      ctx.beginPath();
      ctx.moveTo(ax, ay + 25);
      ctx.lineTo(ax + 15, ay);
      ctx.lineTo(ax + 30, ay + 25);
      ctx.closePath();
      ctx.stroke();

      // Vote count number
      ctx.beginPath();
      ctx.moveTo(ax + 45, ay + 12);
      ctx.lineTo(ax + 85, ay + 12);
      ctx.stroke();

      // Feedback lines
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + 35, cy + 110 + i * 28);
        ctx.lineTo(cx + cw - 40, cy + 110 + i * 28);
        ctx.stroke();
      }

      ctx.restore();
    },
    mockResponse: {
      componentName: "ProjectVotingCard",
      html: `<div class="w-full max-w-sm rounded-2xl border border-pink-500/30 bg-gray-950 p-5 shadow-xl">
  <div class="flex items-center justify-between">
    <span class="text-xs font-mono uppercase tracking-wider text-pink-400 font-semibold">{{headerLabel}}</span>
    <span class="rounded-full bg-pink-950/60 px-2 py-0.5 text-[10px] font-mono text-pink-300 border border-pink-800/40">Live Poll</span>
  </div>
  <div class="mt-4 flex items-center gap-4">
    <button class="flex flex-col items-center justify-center rounded-xl border border-pink-500/40 bg-pink-950/30 px-4 py-2 text-pink-300 hover:bg-pink-900/50 transition-colors">
      <span class="text-lg font-bold">▲</span>
      <span class="text-sm font-extrabold">{{upvotesCount}}</span>
    </button>
    <div>
      <h4 class="text-sm font-bold text-white">{{questionText}}</h4>
      <p class="text-xs text-gray-400 mt-0.5">{{authorCredit}}</p>
    </div>
  </div>
  <div class="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
    <span>Feedback: {{feedbackScore}} / 10</span>
    <span class="text-pink-400 font-medium">Cast Your Vote →</span>
  </div>
</div>`,
      props: [
        { name: "headerLabel", type: "string", default: "Hackathon Judge Poll", description: "Header category title" },
        { name: "upvotesCount", type: "string", default: "284", description: "Total upvotes count" },
        { name: "questionText", type: "string", default: "Would you ship this to production?", description: "Main poll question" },
        { name: "authorCredit", type: "string", default: "Built for Hacktoberfest 2026", description: "Subhead credits" },
        { name: "feedbackScore", type: "string", default: "9.8", description: "Average rating score" },
      ],
    },
  },
];
