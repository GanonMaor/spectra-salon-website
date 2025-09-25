// Performance monitoring utility with enhanced dev terminal support
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private callbacks: Array<
    (type: string, message: string, data?: any) => void
  > = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Add callback for real-time updates
  onUpdate(
    callback: (type: string, message: string, data?: any) => void,
  ): void {
    this.callbacks.push(callback);
  }

  private notify(type: string, message: string, data?: any): void {
    this.callbacks.forEach((callback) => callback(type, message, data));
  }

  startTiming(label: string): void {
    this.metrics.set(label, performance.now());
    this.notify("performance", `⏱️ Started timing: ${label}`);
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      const warning = `No start time found for: ${label}`;
      console.warn(warning);
      this.notify("warning", `⚠️ ${warning}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    const message = `⚡ ${label}: ${duration.toFixed(2)}ms`;
    console.log(message);
    this.notify("performance", message, { label, duration });
    this.metrics.delete(label);
    return duration;
  }

  measureChunkLoading(): void {
    // Monitor dynamic imports
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (
          entry.name.includes("chunk") ||
          entry.name.includes(".js") ||
          entry.name.includes(".css")
        ) {
          const message = `📦 Resource loaded: ${entry.name.split("/").pop()} (${entry.duration.toFixed(2)}ms)`;
          console.log(message);
          this.notify("performance", message, entry);
        }
      }
    });

    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      observer.observe({ entryTypes: ["navigation", "resource"] });
    }
  }

  logBundleSize(): void {
    if ("navigator" in window && "connection" in navigator) {
      const connection = (navigator as any).connection;
      const message = `🌐 Network: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps`;
      console.log(message);
      this.notify("info", message, connection);
    }
  }

  // Monitor React component renders
  logComponentRender(componentName: string, renderTime?: number): void {
    const message = renderTime
      ? `🔄 ${componentName} rendered in ${renderTime.toFixed(2)}ms`
      : `🔄 ${componentName} rendered`;

    console.log(message);
    this.notify("info", message, { componentName, renderTime });
  }

  // Monitor errors
  logError(error: Error | string, context?: string): void {
    const message = `❌ Error${context ? ` in ${context}` : ""}: ${error}`;
    console.error(message);
    this.notify("error", message, { error, context });
  }

  // Monitor API calls
  logApiCall(
    url: string,
    method: string,
    duration?: number,
    status?: number,
  ): void {
    const message = duration
      ? `🌐 API ${method} ${url} - ${status} (${duration.toFixed(2)}ms)`
      : `🌐 API ${method} ${url} started`;

    console.log(message);
    this.notify("info", message, { url, method, duration, status });
  }
}

// Auto-start monitoring in development
if (typeof window !== "undefined") {
  const monitor = PerformanceMonitor.getInstance();
  monitor.measureChunkLoading();
  monitor.logBundleSize();

  // Monitor unhandled errors
  window.addEventListener("error", (event) => {
    monitor.logError(event.error || event.message, "Global Error Handler");
  });

  // Monitor promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    monitor.logError(event.reason, "Unhandled Promise Rejection");
  });
}
