(function (g, u) {
  typeof exports == 'object' && typeof module < 'u'
    ? u(exports)
    : typeof define == 'function' && define.amd
    ? define(['exports'], u)
    : ((g = typeof globalThis < 'u' ? globalThis : g || self),
      u((g.PivotheadCore = {})));
})(this, function (g) {
  'use strict';
  function u(o, t, s) {
    if (o.length === 0) return 0;
    const e = o
      .map((r) => {
        const n = Number(r[t]);
        return isNaN(n) ? null : n;
      })
      .filter((r) => r !== null);
    if (e.length === 0) return 0;
    const a = e.reduce((r, n) => r + n, 0);
    let i;
    switch (s) {
      case 'sum':
        i = a;
        break;
      case 'avg':
        i = a / e.length;
        break;
      case 'count':
        i = e.length;
        break;
      case 'min':
        i = Math.min(...e);
        break;
      case 'max':
        i = Math.max(...e);
        break;
      default:
        return 0;
    }
    return i;
  }
  function l(o, t) {
    return [...o].sort((s, e) => {
      const a = s[t.field],
        i = e[t.field];
      return a < i
        ? t.direction === 'asc'
          ? -1
          : 1
        : a > i
        ? t.direction === 'asc'
          ? 1
          : -1
        : 0;
    });
  }
  function c(o, t = null, s = null) {
    let e = [...o.data];
    t && (e = l(e, t));
    let a = [];
    if (s) {
      const { rowFields: i, columnFields: r, grouper: n } = s,
        d = [...i, ...r];
      a = h(e, d, n);
    }
    return { data: e, groups: a };
  }
  function h(o, t, s) {
    if (!t || t.length === 0)
      return [{ key: 'All', items: o, subgroups: [], aggregates: {} }];
    const e = {};
    return (
      o.forEach((a) => {
        const i = s(a, t);
        e[i] || (e[i] = { key: i, items: [], subgroups: [], aggregates: {} }),
          e[i].items.push(a);
      }),
      t.length > 1 &&
        Object.values(e).forEach((a) => {
          a.subgroups = h(a.items, t.slice(1), s);
        }),
      Object.values(e)
    );
  }
  class p {
    constructor(t) {
      (this.config = {
        ...t,
        defaultAggregation: t.defaultAggregation || 'sum',
        isResponsive: t.isResponsive ?? !0,
      }),
        (this.state = {
          data: t.data || [],
          processedData: { headers: [], rows: [], totals: {} },
          rows: t.rows || [],
          columns: t.columns || [],
          measures: t.measures || [],
          sortConfig: null,
          rowSizes: this.initializeRowSizes(t.data || []),
          expandedRows: {},
          groupConfig: t.groupConfig || null,
          groups: [],
          selectedMeasures: t.measures || [],
          selectedDimensions: t.dimensions || [],
          selectedAggregation: this.config.defaultAggregation,
          formatting: t.formatting || {},
          columnWidths: {},
          isResponsive: this.config.isResponsive ?? !0,
          rowGroups: [],
          columnGroups: [],
        }),
        (this.state.processedData = this.processData(this.state.data)),
        this.state.groupConfig && this.applyGrouping();
    }
    initializeRowSizes(t) {
      return t.map((s, e) => ({ index: e, height: 40 }));
    }
    processData(t) {
      return {
        headers: this.generateHeaders(),
        rows: this.generateRows(t),
        totals: this.calculateTotals(t),
      };
    }
    generateHeaders() {
      const t = this.state.rows
          ? this.state.rows.map((e) => e.caption || e.uniqueName)
          : [],
        s = this.state.columns
          ? this.state.columns.map((e) => e.caption || e.uniqueName)
          : [];
      return [...t, ...s];
    }
    generateRows(t) {
      return !t || !this.state.rows || !this.state.columns
        ? []
        : t.map((s) => [
            ...this.state.rows.map((e) => s[e.uniqueName]),
            ...this.state.columns.map((e) => s[e.uniqueName]),
          ]);
    }
    calculateTotals(t) {
      const s = {};
      return (
        !t ||
          !this.state.measures ||
          this.state.measures.forEach((e) => {
            s[e.uniqueName] = t.reduce(
              (a, i) => a + (Number(i[e.uniqueName]) || 0),
              0,
            );
          }),
        s
      );
    }
    setMeasures(t) {
      (this.state.selectedMeasures = t),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates();
    }
    setDimensions(t) {
      (this.state.selectedDimensions = t),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates();
    }
    setAggregation(t) {
      (this.state.selectedAggregation = t),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates(),
        this.updateAggregates();
    }
    formatValue(t, s) {
      const e = this.state.formatting[s];
      if (!e) return String(t);
      try {
        switch (e.type) {
          case 'currency':
            return new Intl.NumberFormat(e.locale || 'en-US', {
              style: 'currency',
              currency: e.currency || 'USD',
            }).format(t);
          case 'number':
            return new Intl.NumberFormat(e.locale || 'en-US', {
              minimumFractionDigits: e.decimals || 0,
              maximumFractionDigits: e.decimals || 0,
            }).format(t);
          case 'percentage':
            return new Intl.NumberFormat(e.locale || 'en-US', {
              style: 'percent',
              minimumFractionDigits: e.decimals || 0,
            }).format(t);
          case 'date':
            return new Date(t).toLocaleDateString(e.locale || 'en-US', {
              dateStyle: 'medium',
            });
          default:
            return String(t);
        }
      } catch (a) {
        return (
          console.error(`Error formatting value for field ${s}:`, a), String(t)
        );
      }
    }
    sort(t, s) {
      this.state.sortConfig = { field: t, direction: s };
      const { data: e, groups: a } = c(
        this.config,
        this.state.sortConfig,
        this.state.groupConfig,
      );
      (this.state.data = e),
        (this.state.groups = a),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates();
    }
    updateAggregates() {
      const t = (s) => {
        this.state.measures.forEach((e) => {
          const a = `${this.state.selectedAggregation}_${e.uniqueName}`;
          if (e.formula && typeof e.formula == 'function') {
            const i = s.items.map((r) => e.formula(r));
            s.aggregates[a] = u(
              i.map((r) => ({ value: r })),
              'value',
              e.aggregation || this.state.selectedAggregation,
            );
          } else
            s.aggregates[a] = u(
              s.items,
              e.uniqueName,
              e.aggregation || this.state.selectedAggregation,
            );
        }),
          s.subgroups && s.subgroups.forEach(t);
      };
      this.state.groups.forEach(t);
    }
    applyGrouping() {
      if (!this.state.groupConfig) return;
      const {
        rowFields: t,
        columnFields: s,
        grouper: e,
      } = this.state.groupConfig;
      if (!t || !s || !e) {
        console.error('Invalid groupConfig:', this.state.groupConfig);
        return;
      }
      const { data: a, groups: i } = c(
        this.config,
        this.state.sortConfig,
        this.state.groupConfig,
      );
      (this.state.data = a),
        (this.state.groups = i),
        this.updateAggregates(),
        (this.state.processedData = this.processData(this.state.data));
    }
    createGroups(t, s, e) {
      if (!s || s.length === 0 || !t)
        return [{ key: 'All', items: t || [], aggregates: {} }];
      const a = {};
      return (
        t.forEach((i) => {
          if (i && e) {
            const r = e(i, s);
            a[r] ||
              (a[r] = { key: r, items: [], subgroups: [], aggregates: {} }),
              a[r].items.push(i);
          }
        }),
        s.length > 1 &&
          Object.values(a).forEach((i) => {
            i &&
              i.items &&
              (i.subgroups = this.createGroups(i.items, s.slice(1), e));
          }),
        Object.values(a).forEach((i) => {
          i &&
            i.items &&
            this.state.measures &&
            this.state.measures.forEach((r) => {
              if (r && r.uniqueName) {
                const n = `${this.state.selectedAggregation}_${r.uniqueName}`;
                i.aggregates[n] = u(
                  i.items,
                  r.uniqueName,
                  this.state.selectedAggregation,
                );
              }
            });
        }),
        Object.values(a)
      );
    }
    setGroupConfig(t) {
      (this.state.groupConfig = t),
        t
          ? this.applyGrouping()
          : ((this.state.groups = []),
            (this.state.processedData = this.processData(this.state.data)));
    }
    getGroupedData() {
      return this.state.groups;
    }
    getState() {
      return { ...this.state };
    }
    reset() {
      (this.state = {
        ...this.state,
        data: this.config.data || [],
        processedData: this.processData(this.config.data || []),
        sortConfig: null,
        rowSizes: this.initializeRowSizes(this.config.data || []),
        expandedRows: {},
        groupConfig: this.config.groupConfig || null,
        groups: [],
      }),
        this.state.groupConfig && this.applyGrouping();
    }
    resizeRow(t, s) {
      const e = this.state.rowSizes.findIndex((a) => a.index === t);
      e !== -1 && (this.state.rowSizes[e].height = Math.max(20, s));
    }
    toggleRowExpansion(t) {
      this.state.expandedRows[t] = !this.state.expandedRows[t];
    }
    isRowExpanded(t) {
      return !!this.state.expandedRows[t];
    }
    dragRow(t, s) {
      const e = [...this.state.data],
        [a] = e.splice(t, 1);
      e.splice(s, 0, a),
        (this.state.data = e),
        (this.state.rowSizes = this.state.rowSizes.map((i, r) => ({
          ...i,
          index: r < t || r > s ? r : r < s ? r + 1 : r - 1,
        }))),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates();
    }
    dragColumn(t, s) {
      const e = [...this.state.columns],
        [a] = e.splice(t, 1);
      e.splice(s, 0, a),
        (this.state.columns = e),
        (this.state.processedData = this.processData(this.state.data)),
        this.updateAggregates();
    }
  }
  (g.PivotEngine = p),
    Object.defineProperty(g, Symbol.toStringTag, { value: 'Module' });
});
