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
    id: "pricing-card",
    title: "SaaS Pricing Card",
    category: "Level 1 • Components",
    badge: "Popular",
    description: "Modern subscription card with highlighted tier, feature list, and purchase CTA button.",
    draw: (ctx, w, h) => {
      ctx.save();
      ctx.strokeStyle = "#e0e7ff";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Card bounding box
      const cx = w * 0.2;
      const cy = h * 0.12;
      const cw = w * 0.6;
      const ch = h * 0.75;

      ctx.strokeRect(cx, cy, cw, ch);

      // Header title
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy + 45);
      ctx.lineTo(cx + cw * 0.45, cy + 45);
      ctx.stroke();

      // Price tag
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy + 95);
      ctx.lineTo(cx + 70, cy + 95);
      ctx.moveTo(cx + 80, cy + 85);
      ctx.lineTo(cx + 140, cy + 85);
      ctx.stroke();

      // Features check lines
      for (let i = 0; i < 4; i++) {
        const fy = cy + 150 + i * 35;
        // Check mark
        ctx.beginPath();
        ctx.moveTo(cx + 30, fy + 5);
        ctx.lineTo(cx + 38, fy + 12);
        ctx.lineTo(cx + 50, fy);
        // Line
        ctx.moveTo(cx + 65, fy + 8);
        ctx.lineTo(cx + cw - 40, fy + 8);
        ctx.stroke();
      }

      // CTA Button
      const btnY = cy + ch - 65;
      ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
      ctx.fillRect(cx + 30, btnY, cw - 60, 42);
      ctx.strokeRect(cx + 30, btnY, cw - 60, 42);

      // Button label sketch
      ctx.beginPath();
      ctx.moveTo(cx + cw * 0.35, btnY + 21);
      ctx.lineTo(cx + cw * 0.65, btnY + 21);
      ctx.stroke();

      ctx.restore();
    },
    mockResponse: {
      componentName: "PricingCard",
      html: `<div class="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-950/90 p-6 shadow-2xl backdrop-blur-md">
  <div class="flex items-center justify-between">
    <h3 class="text-base font-semibold text-white">{{title}}</h3>
    <span class="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">{{tier}}</span>
  </div>
  <p class="mt-2 text-xs text-gray-400">{{description}}</p>
  <div class="mt-4 flex items-baseline gap-1">
    <span class="text-3xl font-extrabold text-white">{{price}}</span>
    <span class="text-xs text-gray-400">/month</span>
  </div>
  <ul class="mt-5 space-y-2.5 text-xs text-gray-300">
    <li class="flex items-center gap-2">
      <svg class="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      <span>Unlimited canvas napkin exports</span>
    </li>
    <li class="flex items-center gap-2">
      <svg class="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      <span>Gemma 4 31B zero-shot compilation</span>
    </li>
    <li class="flex items-center gap-2">
      <svg class="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      <span>Dynamic prop inspector & live sync</span>
    </li>
  </ul>
  <button class="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95">
    {{ctaText}}
  </button>
</div>`,
      props: [
        { name: "title", type: "string", default: "Pro Developer", description: "Title displayed at top of card" },
        { name: "tier", type: "string", default: "Most Popular", description: "Badge text in header corner" },
        { name: "price", type: "string", default: "$29", description: "Monthly subscription price" },
        { name: "description", type: "string", default: "Everything you need to turn napkins into production UI.", description: "Subheading under title" },
        { name: "ctaText", type: "string", default: "Get Started Now", description: "Call to action button text" },
      ],
    },
  },
  {
    id: "profile-badge",
    title: "User Profile Badge",
    category: "Level 2 • Social",
    badge: "Identity",
    description: "Compact avatar card with user status, handle, bio, and follow action.",
    draw: (ctx, w, h) => {
      ctx.save();
      ctx.strokeStyle = "#e0e7ff";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      const cx = w * 0.2;
      const cy = h * 0.25;
      const cw = w * 0.6;
      const ch = h * 0.5;

      ctx.strokeRect(cx, cy, cw, ch);

      // Avatar circle
      ctx.beginPath();
      ctx.arc(cx + 50, cy + ch / 2, 28, 0, Math.PI * 2);
      ctx.stroke();

      // Name & role lines
      ctx.beginPath();
      ctx.moveTo(cx + 95, cy + ch / 2 - 12);
      ctx.lineTo(cx + cw * 0.6, cy + ch / 2 - 12);
      ctx.moveTo(cx + 95, cy + ch / 2 + 10);
      ctx.lineTo(cx + cw * 0.45, cy + ch / 2 + 10);
      ctx.stroke();

      // Follow button
      const bx = cx + cw - 90;
      const by = cy + ch / 2 - 16;
      ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
      ctx.fillRect(bx, by, 75, 32);
      ctx.strokeRect(bx, by, 75, 32);

      ctx.restore();
    },
    mockResponse: {
      componentName: "UserProfileBadge",
      html: `<div class="flex items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-4 shadow-xl">
  <div class="flex items-center gap-3">
    <div class="relative size-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5">
      <div class="flex size-full items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
        {{avatarInitials}}
      </div>
      <span class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-gray-950 bg-emerald-500"></span>
    </div>
    <div>
      <h4 class="text-sm font-semibold text-white">{{userName}}</h4>
      <p class="text-xs text-gray-400">@{{userHandle}} • {{role}}</p>
    </div>
  </div>
  <button class="rounded-xl border border-purple-500/40 bg-purple-950/40 px-3.5 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-900/60 transition-colors">
    {{buttonText}}
  </button>
</div>`,
      props: [
        { name: "userName", type: "string", default: "Alex River", description: "Full display name" },
        { name: "userHandle", type: "string", default: "ariver_dev", description: "Username handle" },
        { name: "role", type: "string", default: "Kernel Architect", description: "User title or position" },
        { name: "avatarInitials", type: "string", default: "AR", description: "Initials shown in avatar" },
        { name: "buttonText", type: "string", default: "Follow", description: "Action button label" },
      ],
    },
  },
  {
    id: "analytics-widget",
    title: "Analytics Stat Widget",
    category: "Level 3 • Dashboard",
    badge: "Metrics",
    description: "Executive KPI metric card with percentage delta indicator and bar chart sketch.",
    draw: (ctx, w, h) => {
      ctx.save();
      ctx.strokeStyle = "#e0e7ff";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      const cx = w * 0.2;
      const cy = h * 0.2;
      const cw = w * 0.6;
      const ch = h * 0.6;

      ctx.strokeRect(cx, cy, cw, ch);

      // Label line
      ctx.beginPath();
      ctx.moveTo(cx + 25, cy + 35);
      ctx.lineTo(cx + 120, cy + 35);
      ctx.stroke();

      // Big number
      ctx.beginPath();
      ctx.moveTo(cx + 25, cy + 75);
      ctx.lineTo(cx + 150, cy + 75);
      ctx.stroke();

      // Mini bar chart
      const barBase = cy + ch - 30;
      const heights = [25, 45, 30, 60, 50, 75, 90];
      for (let i = 0; i < heights.length; i++) {
        const bx = cx + 25 + i * 22;
        ctx.fillStyle = "rgba(99, 102, 241, 0.3)";
        ctx.fillRect(bx, barBase - heights[i], 14, heights[i]);
        ctx.strokeRect(bx, barBase - heights[i], 14, heights[i]);
      }

      ctx.restore();
    },
    mockResponse: {
      componentName: "AnalyticsMetricCard",
      html: `<div class="rounded-2xl border border-gray-800 bg-gray-950 p-5 shadow-xl">
  <div class="flex items-center justify-between">
    <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">{{metricLabel}}</span>
    <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
      ↑ {{growthRate}}
    </span>
  </div>
  <div class="mt-3 text-3xl font-bold tracking-tight text-white">{{metricValue}}</div>
  <p class="mt-1 text-xs text-gray-400">{{subtext}}</p>
  <div class="mt-4 flex items-end gap-1.5 h-12 pt-2 border-t border-gray-800/80">
    <div class="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t h-[40%] transition-all"></div>
    <div class="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t h-[65%] transition-all"></div>
    <div class="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t h-[45%] transition-all"></div>
    <div class="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t h-[80%] transition-all"></div>
    <div class="flex-1 bg-indigo-500/30 hover:bg-indigo-500/50 rounded-t h-[70%] transition-all"></div>
    <div class="flex-1 bg-indigo-500/50 hover:bg-indigo-500/70 rounded-t h-[95%] transition-all"></div>
    <div class="flex-1 bg-indigo-500 rounded-t h-[100%] shadow-sm shadow-indigo-500/50"></div>
  </div>
</div>`,
      props: [
        { name: "metricLabel", type: "string", default: "Total Active Compilations", description: "Header metric label" },
        { name: "metricValue", type: "string", default: "148,290", description: "Main numerical value" },
        { name: "growthRate", type: "string", default: "+24.8%", description: "Percentage growth badge" },
        { name: "subtext", type: "string", default: "Compared to previous 30 days", description: "Context footer note" },
      ],
    },
  },
];
