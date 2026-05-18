import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  GitBranch, LayoutGrid, Search, Settings2, X, ChevronRight,
  Users, MapPin, Mail, Calendar as CalendarIcon, Building2, Briefcase, Plane,
  ZoomIn, ZoomOut, Maximize2, Minus, Plus, ChevronsDownUp, ChevronsUpDown
} from 'lucide-react';
import { employees, getEmployeeById, departments } from '../data/employees';
import { useLanguage } from '../hooks/useLanguage';
import { LeadCTA } from './Requests';
import { cn, yearsOfService } from '../lib/utils';
import type { Employee } from '../types';

interface OrgchartProps {
  onLeadCapture: (module: string) => void;
}

type ViewMode = 'tree' | 'departments';

interface CardSettings {
  showRole: boolean;
  showDepartment: boolean;
  showLocation: boolean;
  showReports: boolean;
  showEmail: boolean;
  showTenure: boolean;
  showStatus: boolean;
}

const DEFAULT_SETTINGS: CardSettings = {
  showRole: true,
  showDepartment: false,
  showLocation: true,
  showReports: true,
  showEmail: false,
  showTenure: false,
  showStatus: true,
};

const SETTINGS_KEY = 'de-demo-orgchart-settings';
const VIEW_KEY = 'de-demo-orgchart-view';
const COLLAPSED_KEY = 'de-demo-orgchart-collapsed';
const ZOOM_KEY = 'de-demo-orgchart-zoom';

export function Orgchart({ onLeadCapture }: OrgchartProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [view, setView] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    return (saved === 'tree' || saved === 'departments') ? saved : 'tree';
  });
  const [settings, setSettings] = useState<CardSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) { /* ignore */ }
    return DEFAULT_SETTINGS;
  });
  const [search, setSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Tree-specific state: collapsed nodes & zoom
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(COLLAPSED_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) { /* ignore */ }
    // Default: collapse all 2nd-level managers (so only CEO + direct reports show)
    return new Set();
  });
  const [zoom, setZoom] = useState<number>(() => {
    const saved = localStorage.getItem(ZOOM_KEY);
    return saved ? parseFloat(saved) : 0.7;
  });

  // Persist all state
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);
  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(Array.from(collapsed)));
  }, [collapsed]);
  useEffect(() => {
    localStorage.setItem(ZOOM_KEY, zoom.toString());
  }, [zoom]);

  const ceo = employees.find((e) => e.role === 'CEO');
  const directReportsOf = useCallback((managerId: string) =>
    employees.filter((e) => e.manager === managerId), []);

  // Count of total reports recursively (for badge)
  const getReportCount = useMemo(() => {
    const cache = new Map<string, number>();
    const count = (id: string): number => {
      if (cache.has(id)) return cache.get(id)!;
      const direct = directReportsOf(id);
      const total = direct.length + direct.reduce((sum, e) => sum + count(e.id), 0);
      cache.set(id, total);
      return total;
    };
    return count;
  }, [directReportsOf]);

  // Initialize collapsed state on first mount: collapse 2nd-level managers by default
  useEffect(() => {
    if (!ceo) return;
    const saved = localStorage.getItem(COLLAPSED_KEY);
    if (saved) {
      // Migration: if saved state is empty array but tree has been updated, regenerate default
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return; // user has a real preference
      } catch (e) { /* ignore, regenerate */ }
    }
    // Collapse all managers below CEO who have reports
    const initialCollapsed = new Set<string>();
    directReportsOf(ceo.id).forEach((manager) => {
      if (directReportsOf(manager.id).length > 0) {
        initialCollapsed.add(manager.id);
      }
    });
    setCollapsed(initialCollapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleNode = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => {
    if (!ceo) return;
    const all = new Set<string>();
    employees.forEach((e) => {
      if (e.id !== ceo.id && directReportsOf(e.id).length > 0) {
        all.add(e.id);
      }
    });
    setCollapsed(all);
  };

  const zoomIn = () => setZoom((z) => Math.min(1.2, z + 0.1));
  const zoomOut = () => setZoom((z) => Math.max(0.4, z - 0.1));
  const resetZoom = () => setZoom(0.7);

  if (!ceo) return null;

  const filteredEmployees = search
    ? employees.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">People</p>
          <h1 className="font-display text-3xl">{isEn ? 'Organization Structure' : 'Organizačná štruktúra'}</h1>
          <p className="text-secondary text-sm mt-1">
            {isEn
              ? `${employees.length} employees · ${departments.length} departments · Click teammate for detail`
              : `${employees.length} zamestnancov · ${departments.length} oddelení · Klikni na kolegu pre detail`}
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEn ? 'Name, role, department...' : 'Meno, rola, oddelenie...'}
              className="input-field pl-9 text-sm py-2 w-full sm:w-[240px]"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-tertiary rounded-lg overflow-x-auto max-w-full">
            <button
              onClick={() => setView('tree')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                view === 'tree' ? 'bg-secondary shadow-sm-themed text-primary' : 'text-secondary hover:text-primary'
              )}
            >
              <GitBranch size={13} />
              {isEn ? 'Hierarchy' : 'Hierarchia'}
            </button>
            <button
              onClick={() => setView('departments')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                view === 'departments' ? 'bg-secondary shadow-sm-themed text-primary' : 'text-secondary hover:text-primary'
              )}
            >
              <LayoutGrid size={13} />
              {isEn ? 'Departments' : 'Oddelenia'}
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn('btn-secondary text-sm', showSettings && 'accent-bg text-white border-transparent')}
          >
            <Settings2 size={14} />
            <span className="hidden sm:inline">{isEn ? 'View' : 'Zobrazenie'}</span>
          </button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">{isEn ? 'What to show on cards' : 'Čo zobraziť na karte'}</p>
                  <p className="text-xs text-tertiary">{isEn ? 'Choose which info appears for each employee' : 'Vyber, ktoré informácie sa zobrazia pri každom zamestnancovi'}</p>
                </div>
                <button onClick={() => setSettings(DEFAULT_SETTINGS)} className="btn-ghost text-xs">
                  {isEn ? 'Reset' : 'Reset'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <SettingToggle label={isEn ? 'Position' : 'Pozícia'} icon={Briefcase} value={settings.showRole}
                  onChange={(v) => setSettings({ ...settings, showRole: v })} />
                <SettingToggle label={isEn ? 'Department' : 'Oddelenie'} icon={Building2} value={settings.showDepartment}
                  onChange={(v) => setSettings({ ...settings, showDepartment: v })} />
                <SettingToggle label={isEn ? 'Location' : 'Lokalita'} icon={MapPin} value={settings.showLocation}
                  onChange={(v) => setSettings({ ...settings, showLocation: v })} />
                <SettingToggle label={isEn ? 'Reports' : 'Podriadení'} icon={Users} value={settings.showReports}
                  onChange={(v) => setSettings({ ...settings, showReports: v })} />
                <SettingToggle label="Email" icon={Mail} value={settings.showEmail}
                  onChange={(v) => setSettings({ ...settings, showEmail: v })} />
                <SettingToggle label={isEn ? 'Years in company' : 'Roky vo firme'} icon={CalendarIcon} value={settings.showTenure}
                  onChange={(v) => setSettings({ ...settings, showTenure: v })} />
                <SettingToggle label={isEn ? 'Status (time off)' : 'Status (dovolenka)'} icon={Plane} value={settings.showStatus}
                  onChange={(v) => setSettings({ ...settings, showStatus: v })} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search results */}
      {filteredEmployees && (
        <div className="card">
          <p className="text-sm text-tertiary mb-3">
            {isEn ? `${filteredEmployees.length} results for "${search}"` : `${filteredEmployees.length} výsledkov pre "${search}"`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEmployees.map((emp) => (
              <CompactPersonCard
                key={emp.id}
                emp={emp}
                settings={settings}
                reportCount={getReportCount(emp.id)}
                onClick={() => setSelectedEmp(emp)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main view */}
      {!filteredEmployees && (
        <>
          {view === 'tree' ? (
            <TreeView
              ceo={ceo}
              directReportsOf={directReportsOf}
              settings={settings}
              getReportCount={getReportCount}
              onSelectEmp={setSelectedEmp}
              collapsed={collapsed}
              onToggleNode={toggleNode}
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
              zoom={zoom}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetZoom={resetZoom}
            />
          ) : (
            <DepartmentsView
              settings={settings}
              getReportCount={getReportCount}
              onSelectEmp={setSelectedEmp}
            />
          )}
        </>
      )}

      {/* Detail side panel */}
      <AnimatePresence>
        {selectedEmp && (
          <PersonDetailPanel
            emp={selectedEmp}
            reportCount={getReportCount(selectedEmp.id)}
            directReports={directReportsOf(selectedEmp.id)}
            manager={selectedEmp.manager ? getEmployeeById(selectedEmp.manager) : undefined}
            onClose={() => setSelectedEmp(null)}
            onSelectOther={(e) => setSelectedEmp(e)}
          />
        )}
      </AnimatePresence>

      <LeadCTA module={isEn ? 'Org Chart' : 'Org Chart'} onLeadCapture={onLeadCapture} />
    </div>
  );
}

// ============================================
// TREE VIEW (with zoom + collapse)
// ============================================

function TreeView({
  ceo,
  directReportsOf,
  settings,
  getReportCount,
  onSelectEmp,
  collapsed,
  onToggleNode,
  onExpandAll,
  onCollapseAll,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: {
  ceo: Employee;
  directReportsOf: (id: string) => Employee[];
  settings: CardSettings;
  getReportCount: (id: string) => number;
  onSelectEmp: (e: Employee) => void;
  collapsed: Set<string>;
  onToggleNode: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
    moved: boolean;
  } | null>(null);

  // Re-center pan when zoom or collapsed state changes
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [zoom, collapsed.size]);

  // Drag-to-pan handlers (pointer events for mouse + touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't start drag from interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button[data-no-drag]') || target.closest('input')) return;

    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
    // Capture pointer so we keep getting events even when leaving the element
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStateRef.current) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;

    // Only start visual drag if moved more than threshold (5px) — preserves clicks on cards
    if (!dragStateRef.current.moved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;

    if (!dragStateRef.current.moved) {
      dragStateRef.current.moved = true;
      setIsDragging(true);
    }

    setPan({
      x: dragStateRef.current.panX + dx,
      y: dragStateRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStateRef.current) return;
    const wasDragging = dragStateRef.current.moved;
    dragStateRef.current = null;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) { /* ignore */ }

    // If we were dragging, swallow the click so PersonNode doesn't open detail panel
    if (wasDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Block click after drag (capture phase)
  const handleClickCapture = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Wheel handler: ctrl/cmd+scroll = zoom, plain scroll = pan vertically, shift+scroll = horizontal
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) onZoomIn();
      else onZoomOut();
      return;
    }
    // Pan with wheel
    e.preventDefault();
    setPan((prev) => ({
      x: prev.x - (e.shiftKey ? e.deltaY : e.deltaX),
      y: prev.y - (e.shiftKey ? 0 : e.deltaY),
    }));
  };

  const resetPan = () => {
    setPan({ x: 0, y: 0 });
    onResetZoom();
  };

  return (
    <div className="card p-0 overflow-hidden relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 sm:p-3 border-b border-subtle bg-secondary flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={onExpandAll}
            className="btn-ghost text-xs"
            title={isEn ? 'Expand all' : 'Rozbaliť všetko'}
          >
            <ChevronsUpDown size={13} />
            <span className="hidden sm:inline">{isEn ? 'Expand' : 'Rozbaliť'}</span>
          </button>
          <button
            onClick={onCollapseAll}
            className="btn-ghost text-xs"
            title={isEn ? 'Collapse all' : 'Zbaliť všetko'}
          >
            <ChevronsDownUp size={13} />
            <span className="hidden sm:inline">{isEn ? 'Collapse' : 'Zbaliť'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.4}
            className="btn-ghost text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title={isEn ? 'Zoom out' : 'Oddíaliť'}
          >
            <Minus size={14} />
          </button>
          <button
            onClick={onResetZoom}
            className="text-xs font-mono text-tertiary px-2 hover:text-primary min-w-[50px] text-center"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 1.2}
            className="btn-ghost text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title={isEn ? 'Zoom in' : 'Priblížiť'}
          >
            <Plus size={14} />
          </button>
          <button
            onClick={resetPan}
            className="btn-ghost text-xs ml-1"
            title={isEn ? 'Reset view' : 'Reset pohľadu'}
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Pan/zoom viewport */}
      <div
        ref={containerRef}
        className="relative overflow-auto select-none touch-none"
        style={{
          height: 'calc(100vh - 300px)',
          minHeight: 360,
          cursor: isDragging ? 'grabbing' : 'grab',
          background:
            'radial-gradient(circle at center, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onClickCapture={handleClickCapture}
      >
        <div
          style={{
            minWidth: 'max-content',
            display: 'flex',
            justifyContent: 'center',
            padding: '32px 60px 60px 60px',
          }}
        >
          <div
            ref={contentRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'top center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              willChange: 'transform',
            }}
          >
            <TreeNode
              emp={ceo}
              directReportsOf={directReportsOf}
              settings={settings}
              getReportCount={getReportCount}
              onSelectEmp={onSelectEmp}
              collapsed={collapsed}
              onToggleNode={onToggleNode}
              depth={0}
            />
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="hidden sm:block absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-tertiary bg-secondary/80 backdrop-blur px-2 py-1 rounded pointer-events-none">
        {isEn
          ? <>✋ Drag anywhere · <span className="font-mono accent-text">+/−</span> toggles team · <span className="font-mono accent-text">Ctrl+scroll</span> = zoom</>
          : <>✋ Chyť a ťahaj kdekoľvek · <span className="font-mono accent-text">+/−</span> rozbalí tím · <span className="font-mono accent-text">Ctrl+scroll</span> = zoom</>}
      </div>
    </div>
  );
}

function TreeNode({
  emp,
  directReportsOf,
  settings,
  getReportCount,
  onSelectEmp,
  collapsed,
  onToggleNode,
  depth,
}: {
  emp: Employee;
  directReportsOf: (id: string) => Employee[];
  settings: CardSettings;
  getReportCount: (id: string) => number;
  onSelectEmp: (e: Employee) => void;
  collapsed: Set<string>;
  onToggleNode: (id: string) => void;
  depth: number;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const reports = directReportsOf(emp.id);
  const hasReports = reports.length > 0;
  const isCollapsed = collapsed.has(emp.id);
  const showChildren = hasReports && !isCollapsed;

  return (
    <div className="flex flex-col items-center relative">
      {/* The node card with collapse button */}
      <div className="relative">
        <PersonNode
          emp={emp}
          settings={settings}
          reportCount={getReportCount(emp.id)}
          onClick={() => onSelectEmp(emp)}
        />
        {hasReports && (
          <button
            data-no-drag
            onClick={(e) => {
              e.stopPropagation();
              onToggleNode(emp.id);
            }}
            className={cn(
              'absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md-themed border-2 z-10 transition-all hover:scale-110',
              isCollapsed
                ? 'accent-bg text-white border-white'
                : 'bg-secondary text-secondary border-medium hover:accent-border'
            )}
            title={isCollapsed
              ? (isEn ? `Expand team (${getReportCount(emp.id)})` : `Rozbaliť tím (${getReportCount(emp.id)})`)
              : (isEn ? 'Collapse team' : 'Zbaliť tím')}
          >
            {isCollapsed ? <Plus size={12} /> : <Minus size={12} />}
          </button>
        )}
      </div>

      {/* Children */}
      {showChildren && (
        <div className="relative mt-2">
          {/* Vertical line from parent card down to horizontal bus (24px) */}
          <div
            className="absolute left-1/2 -top-1 w-0.5 pointer-events-none z-0"
            style={{
              background: 'var(--border-medium)',
              transform: 'translateX(-50%)',
              height: 24,
            }}
          />

          {/* Children flex row — each child wrapper contains its own L-shaped connector */}
          <div
            className="flex items-start justify-center"
            style={{
              columnGap: 24,
              position: 'relative',
              paddingTop: 48,
            }}
          >
            {reports.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === reports.length - 1;
              const isOnly = reports.length === 1;
              return (
                <div
                  key={child.id}
                  className="relative flex flex-col items-center"
                >
                  {/* Vertical segment from horizontal bus down to this card's top */}
                  <div
                    className="absolute left-1/2 w-0.5 pointer-events-none z-0"
                    style={{
                      background: 'var(--border-medium)',
                      transform: 'translateX(-50%)',
                      top: -24,
                      height: 24,
                    }}
                  />
                  {/* Horizontal segment going from this card's center toward the parent's vertical line.
                      First child: extends right; Last child: extends left; Middle children: extend both ways. */}
                  {!isOnly && (
                    <div
                      className="absolute h-0.5 pointer-events-none z-0"
                      style={{
                        background: 'var(--border-medium)',
                        top: -24,
                        left: isFirst ? '50%' : '-12px',
                        right: isLast ? '50%' : '-12px',
                      }}
                    />
                  )}
                  <TreeNode
                    emp={child}
                    directReportsOf={directReportsOf}
                    settings={settings}
                    getReportCount={getReportCount}
                    onSelectEmp={onSelectEmp}
                    collapsed={collapsed}
                    onToggleNode={onToggleNode}
                    depth={depth + 1}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * (Unused, replaced by inline grid-based connector that handles asymmetric subtree widths.)
 */
function ChildrenConnector(_: { childCount: number }) {
  return null;
}

// ============================================
// DEPARTMENTS VIEW (Grouped accordion)
// ============================================

function DepartmentsView({
  settings,
  getReportCount,
  onSelectEmp,
}: {
  settings: CardSettings;
  getReportCount: (id: string) => number;
  onSelectEmp: (e: Employee) => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(departments.map((d) => d.name))
  );

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {departments.map((dept) => {
        const deptEmployees = employees.filter((e) => e.department === dept.name);
        const isOpen = expanded.has(dept.name);
        const head = deptEmployees.find((e) => e.role.toLowerCase().includes('head') || e.role === 'CEO' || e.role.toLowerCase().includes('manager') || e.role.toLowerCase().includes('lead'));

        return (
          <div key={dept.name} className="card p-0 overflow-hidden">
            <button
              onClick={() => toggle(dept.name)}
              className="w-full flex items-center gap-3 p-4 hover:bg-tertiary/40 transition-colors text-left"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: dept.color }}
              >
                {dept.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{dept.name}</p>
                  <span className="badge">{deptEmployees.length}</span>
                </div>
                {head && (
                  <p className="text-xs text-tertiary mt-0.5 truncate">
                    {isEn ? 'Lead:' : 'Vedie:'} {head.name}
                  </p>
                )}
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={18} className="text-tertiary" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-subtle"
                >
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {deptEmployees.map((emp) => (
                      <CompactPersonCard
                        key={emp.id}
                        emp={emp}
                        settings={settings}
                        reportCount={getReportCount(emp.id)}
                        onClick={() => onSelectEmp(emp)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// PERSON NODE (Tree view card)
// ============================================

function PersonNode({
  emp,
  settings,
  reportCount,
  onClick,
}: {
  emp: Employee;
  settings: CardSettings;
  reportCount: number;
  onClick: () => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const dept = departments.find((d) => d.name === emp.department);

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card text-left cursor-pointer transition-all relative overflow-hidden"
      style={{
        width: 200,
        padding: 14,
        borderTopColor: dept?.color,
        borderTopWidth: 3,
      }}
    >
      {/* Status dot */}
      {settings.showStatus && emp.isOnLeave && (
        <div className="absolute top-2 right-2 flex items-center gap-1 badge badge-warning">
          <Plane size={9} />
          <span className="text-[9px]">{isEn ? 'Time off' : 'Dovolenka'}</span>
        </div>
      )}

      <div className="flex items-center gap-2.5 mb-2">
        <img
          src={emp.avatar}
          alt={emp.name}
          className="w-12 h-12 rounded-full border-2 flex-shrink-0"
          style={{ borderColor: dept?.color || 'var(--border-medium)' }}
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm leading-tight truncate">{emp.name}</p>
          {settings.showRole && (
            <p className="text-xs text-tertiary truncate mt-0.5">{emp.role}</p>
          )}
        </div>
      </div>

      <div className="space-y-1 text-[11px]">
        {settings.showDepartment && (
          <div className="flex items-center gap-1.5 text-tertiary">
            <Building2 size={10} />
            <span className="truncate">{emp.department}</span>
          </div>
        )}
        {settings.showLocation && (
          <div className="flex items-center gap-1.5 text-tertiary">
            <MapPin size={10} />
            <span className="truncate">{emp.location}</span>
          </div>
        )}
        {settings.showTenure && (
          <div className="flex items-center gap-1.5 text-tertiary">
            <CalendarIcon size={10} />
            <span>
              {yearsOfService(emp.startDate)} {isEn ? 'years in company' : `${yearsOfService(emp.startDate) === 1 ? 'rok' : 'rok(ov)'} vo firme`}
            </span>
          </div>
        )}
        {settings.showEmail && (
          <div className="flex items-center gap-1.5 text-tertiary">
            <Mail size={10} />
            <span className="truncate">{emp.email.split('@')[0]}@…</span>
          </div>
        )}
      </div>

      {settings.showReports && reportCount > 0 && (
        <div className="mt-2 pt-2 border-t border-subtle flex items-center justify-between">
          <span className="text-[10px] text-tertiary uppercase tracking-wider">{isEn ? 'Team' : 'Tím'}</span>
          <span className="badge badge-accent text-[10px] flex items-center gap-1">
            <Users size={9} />
            {reportCount}
          </span>
        </div>
      )}
    </motion.button>
  );
}

// ============================================
// COMPACT PERSON CARD (used in dept view & search)
// ============================================

function CompactPersonCard({
  emp,
  settings,
  reportCount,
  onClick,
}: {
  emp: Employee;
  settings: CardSettings;
  reportCount: number;
  onClick: () => void;
}) {
  const dept = departments.find((d) => d.name === emp.department);

  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="card text-left p-3 hover:shadow-md-themed transition-all relative"
      style={{ borderLeftColor: dept?.color, borderLeftWidth: 3 }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={emp.avatar}
            alt={emp.name}
            className="w-11 h-11 rounded-full"
          />
          {settings.showStatus && emp.isOnLeave && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center bg-amber-500 border-2 border-white">
              <Plane size={8} className="text-white" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{emp.name}</p>
              {settings.showRole && (
                <p className="text-xs text-tertiary truncate">{emp.role}</p>
              )}
            </div>
            {settings.showReports && reportCount > 0 && (
              <span className="badge badge-accent text-[10px] flex items-center gap-0.5 flex-shrink-0">
                <Users size={9} />
                {reportCount}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px] text-tertiary">
            {settings.showDepartment && (
              <span className="flex items-center gap-1">
                <Building2 size={9} /> {emp.department}
              </span>
            )}
            {settings.showLocation && (
              <span className="flex items-center gap-1">
                <MapPin size={9} /> {emp.location}
              </span>
            )}
            {settings.showTenure && (
              <span className="flex items-center gap-1">
                <CalendarIcon size={9} /> {yearsOfService(emp.startDate)}r
              </span>
            )}
          </div>

          {settings.showEmail && (
            <p className="text-[10px] text-tertiary mt-1 truncate">
              <Mail size={9} className="inline mr-1" />
              {emp.email}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ============================================
// SETTINGS TOGGLE
// ============================================

function SettingToggle({
  label,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  icon: any;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border',
        value
          ? 'accent-bg text-white border-transparent'
          : 'bg-secondary border-subtle text-secondary hover:border-medium'
      )}
    >
      <Icon size={12} />
      <span className="truncate">{label}</span>
    </button>
  );
}

// ============================================
// PERSON DETAIL SIDE PANEL
// ============================================

function PersonDetailPanel({
  emp,
  reportCount,
  directReports,
  manager,
  onClose,
  onSelectOther,
}: {
  emp: Employee;
  reportCount: number;
  directReports: Employee[];
  manager?: Employee;
  onClose: () => void;
  onSelectOther: (e: Employee) => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const dept = departments.find((d) => d.name === emp.department);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-end"
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-secondary h-full w-full max-w-md overflow-y-auto"
      >
        {/* Hero */}
        <div
          className="relative p-4 sm:p-6 text-white"
          style={{ background: dept?.color || 'var(--accent-primary)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <img
              src={emp.avatar}
              alt={emp.name}
              className="w-16 h-16 rounded-full border-4 border-white/40"
            />
            <div>
              <h2 className="font-display text-2xl leading-tight">{emp.name}</h2>
              <p className="text-white/80 text-sm">{emp.role}</p>
            </div>
          </div>
          {emp.isOnLeave && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/20 text-xs mt-2">
              <Plane size={11} />
              {isEn ? 'Currently on time off' : 'Momentálne na dovolenke'}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label={isEn ? 'Team' : 'Tím'} value={reportCount.toString()} />
            <Stat label={isEn ? 'Tenure' : 'Vo firme'} value={`${yearsOfService(emp.startDate)}r`} />
            <Stat label={isEn ? 'Location' : 'Lokalita'} value={emp.location} small />
          </div>

          {/* Info */}
          <div className="space-y-2 text-sm">
            <DetailRow icon={Briefcase} label={isEn ? 'Position' : 'Pozícia'} value={emp.role} />
            <DetailRow icon={Building2} label={isEn ? 'Department' : 'Oddelenie'} value={emp.department} />
            <DetailRow icon={Mail} label="Email" value={emp.email} />
            <DetailRow icon={MapPin} label={isEn ? 'Location' : 'Lokalita'} value={emp.location} />
            <DetailRow icon={CalendarIcon} label={isEn ? 'In company since' : 'Vo firme od'} value={emp.startDate} />
          </div>

          {/* Manager */}
          {manager && (
            <div>
              <p className="text-xs uppercase tracking-wider text-tertiary mb-2">{isEn ? 'Manager' : 'Manažér'}</p>
              <button
                onClick={() => onSelectOther(manager)}
                className="w-full card flex items-center gap-3 p-3 text-left hover:bg-tertiary/40 transition-colors"
              >
                <img src={manager.avatar} className="w-9 h-9 rounded-full" alt="" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{manager.name}</p>
                  <p className="text-xs text-tertiary truncate">{manager.role}</p>
                </div>
                <ChevronRight size={14} className="text-tertiary" />
              </button>
            </div>
          )}

          {/* Direct reports */}
          {directReports.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-tertiary mb-2">
                {isEn ? `Direct reports (${directReports.length})` : `Priami podriadení (${directReports.length})`}
              </p>
              <div className="space-y-1.5">
                {directReports.map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => onSelectOther(rep)}
                    className="w-full card flex items-center gap-3 p-2.5 text-left hover:bg-tertiary/40 transition-colors"
                  >
                    <img src={rep.avatar} className="w-8 h-8 rounded-full" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{rep.name}</p>
                      <p className="text-xs text-tertiary truncate">{rep.role}</p>
                    </div>
                    <ChevronRight size={14} className="text-tertiary" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skills preview */}
          {Object.keys(emp.skills).length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-tertiary mb-2">
                {isEn ? 'Top skills' : 'Top zručnosti'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(emp.skills)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([skill, level]) => (
                    <span
                      key={skill}
                      className="badge badge-accent"
                    >
                      {skill} · L{level}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="card p-3 text-center">
      <p className={cn('font-display', small ? 'text-base truncate' : 'text-2xl')}>{value}</p>
      <p className="text-[10px] text-tertiary uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-tertiary mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-tertiary">{label}</p>
        <p className="text-sm text-primary truncate">{value}</p>
      </div>
    </div>
  );
}
