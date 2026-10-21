"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "./primitives";

/**
 * Keeps one broken piece (a widget, a module) from taking the whole screen
 * down. Shows a calm message with a retry.
 */
export class ErrorBoundary extends Component<{ name: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <ErrorState title={`${this.props.name} couldn't load`} onRetry={() => this.setState({ failed: false })}>
          The rest of the page is fine. Try again, or hide this widget from Customize.
        </ErrorState>
      );
    }
    return this.props.children;
  }
}
