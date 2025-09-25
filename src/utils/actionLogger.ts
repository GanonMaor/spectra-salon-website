/**
 * Action Logger Utility
 * Comprehensive tracking of all user actions in the admin dashboard
 * Created: 2024-01-09 14:30:00 UTC
 */

export interface ActionLogEntry {
  user_id?: number;
  session_id?: string;
  action_type: string;
  context: string;
  page_url?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
}

export type ActionType =
  | "navigation"
  | "button_click"
  | "form_submit"
  | "data_view"
  | "data_export"
  | "settings_change"
  | "login"
  | "logout"
  | "search"
  | "filter_applied"
  | "page_load"
  | "api_call"
  | "error_occurred";

class ActionLogger {
  private sessionId: string;
  private userId?: number;

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
    // User ID will be set after authentication
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem("admin_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("admin_session_id", sessionId);
    }
    return sessionId;
  }

  setUserId(userId: number) {
    this.userId = userId;
  }

  /**
   * Log any user action with comprehensive context
   */
  async logAction(
    actionType: ActionType,
    context: string,
    details?: Record<string, any>,
  ): Promise<void> {
    try {
      const logEntry: ActionLogEntry = {
        user_id: this.userId,
        session_id: this.sessionId,
        action_type: actionType,
        context,
        page_url: window.location.href,
        details: details || {},
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // Send to backend (will be implemented)
      await this.sendToBackend(logEntry);

      // Also log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`🔍 Action logged:`, {
          type: actionType,
          context,
          details,
          timestamp: logEntry.timestamp,
        });
      }
    } catch (error) {
      console.error("Failed to log action:", error);
    }
  }

  private async sendToBackend(logEntry: ActionLogEntry): Promise<void> {
    // Temporarily disabled until user_actions table is created
    // This prevents console spam while maintaining functionality
    try {
      // Uncomment when database table is ready:
      // const response = await fetch('/.netlify/functions/log-action', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(logEntry)
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
    } catch (error) {
      // Silently fail for now - we don't want to break the UI
      console.warn("Action logging failed:", error);
    }
  }

  // Convenience methods for common actions
  async logNavigation(
    fromPage: string,
    toPage: string,
    method: "click" | "url" = "click",
  ) {
    await this.logAction("navigation", `${fromPage} -> ${toPage}`, {
      from_page: fromPage,
      to_page: toPage,
      method,
    });
  }

  async logButtonClick(
    buttonName: string,
    location: string,
    additionalData?: Record<string, any>,
  ) {
    await this.logAction("button_click", location, {
      button_name: buttonName,
      ...additionalData,
    });
  }

  async logFormSubmit(formName: string, formData?: Record<string, any>) {
    await this.logAction("form_submit", formName, {
      form_fields: Object.keys(formData || {}),
      ...formData,
    });
  }

  async logDataView(
    dataType: string,
    filters?: Record<string, any>,
    resultCount?: number,
  ) {
    await this.logAction("data_view", `viewing_${dataType}`, {
      data_type: dataType,
      filters,
      result_count: resultCount,
    });
  }

  async logError(errorType: string, errorMessage: string, stackTrace?: string) {
    await this.logAction("error_occurred", errorType, {
      error_message: errorMessage,
      stack_trace: stackTrace,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }

  async logPageLoad(pageName: string, loadTime?: number) {
    await this.logAction("page_load", pageName, {
      page_name: pageName,
      load_time: loadTime,
      referrer: document.referrer,
    });
  }
}

// Export singleton instance
export const actionLogger = new ActionLogger();

// Export React hook for easy use in components
export const useActionLogger = () => {
  return {
    logAction: actionLogger.logAction.bind(actionLogger),
    logNavigation: actionLogger.logNavigation.bind(actionLogger),
    logButtonClick: actionLogger.logButtonClick.bind(actionLogger),
    logFormSubmit: actionLogger.logFormSubmit.bind(actionLogger),
    logDataView: actionLogger.logDataView.bind(actionLogger),
    logError: actionLogger.logError.bind(actionLogger),
    logPageLoad: actionLogger.logPageLoad.bind(actionLogger),
    setUserId: actionLogger.setUserId.bind(actionLogger),
  };
};
